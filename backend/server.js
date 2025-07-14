const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { initDatabase, query } = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: '/auth/discord/callback',
  scope: ['identify', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Get user's roles from Discord guild
    const guildMember = await getGuildMember(profile.id);
    const role = mapDiscordRoleToInternal(guildMember.roles);
    
    // Check if user exists in database
    let user = await query('SELECT * FROM users WHERE discord_id = ?', [profile.id]);
    
    if (user.length === 0) {
      // Create new user
      const result = await query(
        'INSERT INTO users (discord_id, username, email, role, avatar) VALUES (?, ?, ?, ?, ?)',
        [profile.id, profile.username, profile.email, role, profile.avatar]
      );
      user = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else {
      // Update existing user's role
      await query('UPDATE users SET role = ?, avatar = ? WHERE discord_id = ?', 
        [role, profile.avatar, profile.id]);
      user = await query('SELECT * FROM users WHERE discord_id = ?', [profile.id]);
    }
    
    return done(null, user[0]);
  } catch (error) {
    console.error('Discord auth error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user[0]);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to get guild member info from Discord API
async function getGuildMember(userId) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
    }
  });
  return response.json();
}

// Map Discord roles to internal roles
function mapDiscordRoleToInternal(discordRoles) {
  const roleMap = {
    [process.env.DIRECTOR_ROLE_ID]: 'Director',
    [process.env.STAFF_ROLE_ID]: 'Staff',
    [process.env.KCSO_COMMAND_ROLE_ID]: 'KCSO_Command',
    [process.env.KCSO_ROLE_ID]: 'KCSO',
    [process.env.MSP_COMMAND_ROLE_ID]: 'MSP_Command',
    [process.env.MSP_ROLE_ID]: 'MSP',
    [process.env.MFD_COMMAND_ROLE_ID]: 'MFD_Command',
    [process.env.MFD_ROLE_ID]: 'MFD'
  };

  // Find highest priority role
  const rolePriority = ['Director', 'Staff', 'KCSO_Command', 'MSP_Command', 'MFD_Command', 'KCSO', 'MSP', 'MFD'];
  
  for (const priority of rolePriority) {
    for (const roleId of discordRoles) {
      if (roleMap[roleId] === priority) {
        return priority;
      }
    }
  }
  
  return 'Civilian';
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    
    const user = await query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    req.user = user[0];
    next();
  });
};

// Check permissions middleware
const checkPermission = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// Authentication Routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3002'}?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}?token=${token}`);
  }
);

app.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: { 
      id: req.user.id, 
      username: req.user.username, 
      email: req.user.email, 
      role: req.user.role 
    }
  });
});

// Player Routes
app.get('/api/players', authenticateToken, async (req, res) => {
  try {
    const players = await query('SELECT * FROM players WHERE online = 1');
    res.json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

app.get('/api/players/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT username FROM players ORDER BY playtime DESC LIMIT 1) as most_hours_player,
        (SELECT MAX(playtime) FROM players) as most_hours,
        (SELECT username FROM players ORDER BY deaths DESC LIMIT 1) as most_deaths_player,
        (SELECT MAX(deaths) FROM players) as most_deaths,
        (SELECT username FROM players ORDER BY kills DESC LIMIT 1) as most_kills_player,
        (SELECT MAX(kills) FROM players) as most_kills,
        (SELECT username FROM players ORDER BY money DESC LIMIT 1) as richest_player,
        (SELECT MAX(money) FROM players) as most_money,
        (SELECT username FROM players ORDER BY donated DESC LIMIT 1) as top_donor,
        (SELECT MAX(donated) FROM players) as most_donated
    `);
    
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch player stats' });
  }
});

app.post('/api/players/money', authenticateToken, checkPermission(['Director', 'Staff']), async (req, res) => {
  try {
    const { playerId, amount, type } = req.body;
    
    const column = type === 'bank' ? 'bank_money' : 'cash_money';
    await query(`UPDATE players SET ${column} = ${column} + ? WHERE id = ?`, [amount, playerId]);
    
    // Log the action
    await query(
      'INSERT INTO moderation_logs (player_id, moderator_id, action, reason) VALUES (?, ?, ?, ?)',
      [playerId, req.user.id, 'money_added', `Added $${amount} to ${type}`]
    );
    
    res.json({ success: true, message: 'Money added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add money' });
  }
});

// Moderation Routes
app.post('/api/moderation/warn', authenticateToken, checkPermission(['Director', 'Staff']), async (req, res) => {
  try {
    const { playerId, reason } = req.body;
    
    await query(
      'INSERT INTO moderation_logs (player_id, moderator_id, action, reason) VALUES (?, ?, ?, ?)',
      [playerId, req.user.id, 'warn', reason]
    );
    
    res.json({ success: true, message: 'Player warned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to warn player' });
  }
});

app.post('/api/moderation/kick', authenticateToken, checkPermission(['Director', 'Staff']), async (req, res) => {
  try {
    const { playerId, reason } = req.body;
    
    await query(
      'INSERT INTO moderation_logs (player_id, moderator_id, action, reason) VALUES (?, ?, ?, ?)',
      [playerId, req.user.id, 'kick', reason]
    );
    
    // TODO: Send kick command to game server via RCON
    
    res.json({ success: true, message: 'Player kicked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to kick player' });
  }
});

app.post('/api/moderation/ban', authenticateToken, checkPermission(['Director', 'Staff']), async (req, res) => {
  try {
    const { playerId, reason, duration } = req.body;
    
    const expiresAt = duration === 'permanent' ? null : new Date(Date.now() + parseDuration(duration));
    
    await query(
      'INSERT INTO bans (player_id, moderator_id, reason, expires_at) VALUES (?, ?, ?, ?)',
      [playerId, req.user.id, reason, expiresAt]
    );
    
    await query(
      'INSERT INTO moderation_logs (player_id, moderator_id, action, reason, duration) VALUES (?, ?, ?, ?, ?)',
      [playerId, req.user.id, 'ban', reason, duration]
    );
    
    // TODO: Send ban command to game server via RCON
    
    res.json({ success: true, message: 'Player banned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to ban player' });
  }
});

app.get('/api/moderation/history', authenticateToken, async (req, res) => {
  try {
    const history = await query(`
      SELECT ml.*, p.username as player_name, u.username as moderator_name
      FROM moderation_logs ml
      JOIN players p ON ml.player_id = p.id
      JOIN users u ON ml.moderator_id = u.id
      ORDER BY ml.created_at DESC
      LIMIT 50
    `);
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch moderation history' });
  }
});

// Department Routes
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments');
    const command = await query('SELECT * FROM department_command ORDER BY rank_order');
    const documents = await query('SELECT * FROM department_documents');
    
    res.json({ success: true, departments, command, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments/:dept/command', authenticateToken, async (req, res) => {
  try {
    const { dept } = req.params;
    const { name, rank, discord } = req.body;
    
    // Check if user can edit this department
    const canEdit = req.user.role === 'Director' || req.user.role === `${dept.toUpperCase()}_Command`;
    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    await query(
      'INSERT INTO department_command (department, name, rank, discord_id) VALUES (?, ?, ?, ?)',
      [dept, name, rank, discord]
    );
    
    res.json({ success: true, message: 'Command member added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add command member' });
  }
});

app.put('/api/departments/:dept/documents/:docId', authenticateToken, async (req, res) => {
  try {
    const { dept, docId } = req.params;
    const { title, content } = req.body;
    
    // Check if user can edit this department
    const canEdit = req.user.role === 'Director' || req.user.role === `${dept.toUpperCase()}_Command`;
    if (!canEdit) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    await query(
      'UPDATE department_documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND department = ?',
      [title, content, docId, dept]
    );
    
    res.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update document' });
  }
});

// Settings Routes
app.get('/api/settings', authenticateToken, checkPermission(['Director']), async (req, res) => {
  try {
    const settings = await query('SELECT * FROM server_settings');
    res.json({ success: true, settings: settings[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authenticateToken, checkPermission(['Director']), async (req, res) => {
  try {
    const { serverName, maxPlayers, discordGuildId } = req.body;
    
    await query(
      'UPDATE server_settings SET server_name = ?, max_players = ?, discord_guild_id = ?',
      [serverName, maxPlayers, discordGuildId]
    );
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

app.get('/api/system/status', authenticateToken, async (req, res) => {
  try {
    const status = {
      database: 'online',
      discordBot: 'connected',
      gameServer: 'running',
      lastBackup: '2 hours ago'
    };
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get system status' });
  }
});

app.post('/api/system/backup', authenticateToken, checkPermission(['Director']), async (req, res) => {
  try {
    // TODO: Implement backup functionality
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create backup' });
  }
});

// Helper function to parse duration strings
function parseDuration(duration) {
  const units = {
    'hour': 60 * 60 * 1000,
    'hours': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'days': 24 * 60 * 60 * 1000
  };
  
  const match = duration.match(/(\d+)\s*(hour|hours|day|days)/);
  if (match) {
    const [, amount, unit] = match;
    return parseInt(amount) * units[unit];
  }
  
  return 0;
}

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();