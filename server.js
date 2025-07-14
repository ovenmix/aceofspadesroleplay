// server.js - Ace of Spades Roleplay Backend Server
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Environment variables validation
const requiredEnvVars = {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback'
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and run: npm run setup');
    process.exit(1);
}

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN,
    DISCORD_GUILD_ID,
    DISCORD_REDIRECT_URI
} = requiredEnvVars;

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-change-this';
const MASTER_EMAIL = process.env.MASTER_EMAIL || 'admin@aceofspades.com';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'changeme123';

// Session middleware
app.use(session({
    secret: SESSION_SECRET,
    resave: true, // Force session save
    saveUninitialized: true, // Save empty sessions
    name: 'aceofspades.sid',
    cookie: { 
        secure: false, // Must be false for HTTP
        httpOnly: false, // Try false for debugging
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Allow same-site requests
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory user database (replace with real database in production)
let users = [];
let userIdCounter = 1;

// Discord role mapping - UPDATE THESE WITH YOUR ACTUAL DISCORD ROLE IDs
const ROLE_MAPPING = {
    // Sheriff's Office
    '1271545226502082620': ['KCSO Member'],
    '1271544908410388651': ['KCSO Member', 'KCSO Command'],
    
    // State Police - Replace with your actual role IDs
    'YOUR_MSP_MEMBER_ROLE_ID': ['MSP Member'],
    'YOUR_MSP_COMMAND_ROLE_ID': ['MSP Member', 'MSP Command'],
    
    // Fire Department - Replace with your actual role IDs
    'YOUR_MFD_MEMBER_ROLE_ID': ['MFD Member'],
    'YOUR_MFD_COMMAND_ROLE_ID': ['MFD Member', 'MFD Command'],
    
    // Staff roles
    '1271545378294075482': ['Staff'],
    '1271544275540250675': ['Staff', 'Admin'],
    '1271541525322403924': ['Staff', 'Admin', 'Server Director']
};

// Initialize master account
const masterUser = {
    id: 0,
    email: MASTER_EMAIL,
    username: 'ServerOwner',
    password: bcrypt.hashSync(MASTER_PASSWORD, 10),
    roles: ['User', 'Staff', 'Admin', 'Server Director', 'Owner'],
    discordId: null,
    discordUsername: null,
    discordAvatar: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    status: 'active'
};

// Load users from file
const usersFile = path.join(__dirname, 'users.json');
try {
    if (fs.existsSync(usersFile)) {
        const userData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        users = userData.users || [];
        userIdCounter = userData.lastId || 1;
        console.log(`✅ Loaded ${users.length} users from database`);
    }
} catch (error) {
    console.error('❌ Error loading users:', error);
}

// Save users to file
function saveUsers() {
    try {
        fs.writeFileSync(usersFile, JSON.stringify({
            users: users,
            lastId: userIdCounter,
            lastUpdated: new Date().toISOString()
        }, null, 2));
    } catch (error) {
        console.error('❌ Error saving users:', error);
    }
}

// Discord API URLs
const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_CDN_URL = 'https://cdn.discordapp.com';

// Helper functions
function generateUserId() {
    return userIdCounter++;
}

function findUserByEmail(email) {
    if (email === MASTER_EMAIL) return masterUser;
    return users.find(user => user.email === email);
}

function findUserById(id) {
    if (id === 0) return masterUser;
    return users.find(user => user.id === id);
}

function findUserByDiscordId(discordId) {
    if (masterUser.discordId === discordId) return masterUser;
    return users.find(user => user.discordId === discordId);
}

function getDiscordAuthURL() {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds.members.read'
    });
    return `https://discord.com/oauth2/authorize?${params}`;
}

async function exchangeCodeForToken(code) {
    try {
        const response = await axios.post(`${DISCORD_API_URL}/oauth2/token`, 
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Token exchange error:', error.response?.data || error.message);
        throw new Error('Failed to exchange code for token');
    }
}

async function getDiscordUser(accessToken) {
    try {
        const response = await axios.get(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Discord user fetch error:', error.response?.data || error.message);
        throw new Error('Failed to fetch Discord user');
    }
}

async function getGuildMember(userId) {
    try {
        const response = await axios.get(`${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/members/${userId}`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Guild member fetch error for ${userId}:`, error.response?.data || error.message);
        return null;
    }
}

function mapDiscordRolesToPermissions(discordRoles = []) {
    const permissions = new Set(['User']); // Everyone gets User role
    
    discordRoles.forEach(roleId => {
        if (ROLE_MAPPING[roleId]) {
            ROLE_MAPPING[roleId].forEach(permission => permissions.add(permission));
        }
    });
    
    return Array.from(permissions);
}

function getDiscordAvatarURL(user) {
    if (user.avatar) {
        return `${DISCORD_CDN_URL}/avatars/${user.id}/${user.avatar}.png?size=128`;
    } else {
        // New username system or old discriminator system
        const discriminator = user.discriminator && user.discriminator !== '0' ? user.discriminator : '0';
        const defaultAvatarNumber = parseInt(discriminator) % 5;
        return `${DISCORD_CDN_URL}/embed/avatars/${defaultAvatarNumber}.png`;
    }
}

// Middleware to check permissions
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!req.session.user.roles.includes(permission)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                required: permission,
                userRoles: req.session.user.roles
            });
        }
        
        next();
    };
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Email/Password Authentication
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        if (findUserByEmail(email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        if (users.find(user => user.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = {
            id: generateUserId(),
            email,
            username,
            password: hashedPassword,
            roles: ['User'],
            discordId: null,
            discordUsername: null,
            discordAvatar: null,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            status: 'active'
        };
        
        users.push(newUser);
        saveUsers();
        
        console.log(`✅ New user registered: ${username} (${email})`);
        
        const { password: _, ...userResponse } = newUser;
        res.json({ success: true, user: userResponse });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Account is banned' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        if (user.id !== 0) saveUsers();
        
        // Create session
        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles,
            discordId: user.discordId,
            discordUsername: user.discordUsername,
            avatar: user.discordAvatar || '/images/default-avatar.png',
            lastLogin: user.lastLogin
        };
        
        console.log(`✅ User logged in: ${user.username}`);
        res.json({ success: true });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Discord OAuth routes
app.get('/auth/discord', (req, res) => {
    const authURL = getDiscordAuthURL();
    console.log(`🔗 Redirecting to Discord OAuth: ${authURL}`);
    res.redirect(authURL);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code, error } = req.query;
    
    console.log('\n🔄 === DISCORD OAUTH CALLBACK ===');
    console.log('📋 Session ID:', req.sessionID);
    console.log('📋 Code:', code ? 'Present' : 'Missing');
    console.log('📋 Error:', error || 'None');
    
    if (error) {
        console.error('❌ Discord OAuth error:', error);
        return res.redirect('/?auth=error&message=' + encodeURIComponent(error));
    }
    
    if (!code) {
        console.error('❌ No authorization code provided');
        return res.redirect('/?auth=error&message=' + encodeURIComponent('No authorization code provided'));
    }
    
    try {
        console.log('🔄 Processing Discord OAuth callback...');
        
        // Exchange code for access token
        const tokenData = await exchangeCodeForToken(code);
        const { access_token } = tokenData;
        
        // Get Discord user information
        const discordUser = await getDiscordUser(access_token);
        console.log(`📝 Discord user: ${discordUser.username} (${discordUser.id})`);
        
        // Get guild member information (roles)
        const guildMember = await getGuildMember(discordUser.id);
        
        if (!guildMember) {
            console.warn(`⚠️  User ${discordUser.username} is not a member of the guild`);
            return res.redirect('/?auth=error&message=' + encodeURIComponent('You must be a member of the Ace of Spades Discord server'));
        }
        
        const discordRoles = guildMember.roles || [];
        const permissions = mapDiscordRolesToPermissions(discordRoles);
        console.log(`👥 User roles: ${permissions.join(', ')}`);
        
        // Check if user is already logged in (account linking)
        if (req.session.user) {
            console.log('🔗 Linking Discord account to existing user...');
            const user = findUserById(req.session.user.id);
            if (user) {
                // Link Discord account
                user.discordId = discordUser.id;
                user.discordUsername = discordUser.discriminator && discordUser.discriminator !== '0' 
                    ? `${discordUser.username}#${discordUser.discriminator}` 
                    : discordUser.username;
                user.discordAvatar = getDiscordAvatarURL(discordUser);
                
                // Merge roles (keep existing + add Discord roles)
                const existingRoles = user.roles.filter(role => !['KCSO Member', 'KCSO Command', 'MSP Member', 'MSP Command', 'MFD Member', 'MFD Command'].includes(role));
                user.roles = [...new Set([...existingRoles, ...permissions])];
                
                if (user.id !== 0) saveUsers();
                
                // Update session immediately
                req.session.user = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    discordId: user.discordId,
                    discordUsername: user.discordUsername,
                    avatar: user.discordAvatar,
                    lastLogin: user.lastLogin
                };
                
                // Force session save
                req.session.save((err) => {
                    if (err) {
                        console.error('❌ Session save error:', err);
                        return res.redirect('/?auth=error&message=' + encodeURIComponent('Session save failed'));
                    }
                    console.log(`🔗 Linked Discord account for ${user.username}`);
                    return res.redirect('/?auth=linked');
                });
                return;
            }
        }
        
        // Check if Discord account is already registered
        let user = findUserByDiscordId(discordUser.id);
        
        if (!user) {
            // Create new user with Discord
            user = {
                id: generateUserId(),
                email: null,
                username: discordUser.username,
                password: null,
                roles: permissions,
                discordId: discordUser.id,
                discordUsername: discordUser.discriminator && discordUser.discriminator !== '0' 
                    ? `${discordUser.username}#${discordUser.discriminator}` 
                    : discordUser.username,
                discordAvatar: getDiscordAvatarURL(discordUser),
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'active'
            };
            
            users.push(user);
            saveUsers();
            
            console.log(`✅ Created new user via Discord: ${user.username}`);
        } else {
            // Update existing user
            user.lastLogin = new Date().toISOString();
            user.discordUsername = discordUser.discriminator && discordUser.discriminator !== '0' 
                ? `${discordUser.username}#${discordUser.discriminator}` 
                : discordUser.username;
            user.discordAvatar = getDiscordAvatarURL(discordUser);
            
            // Update roles based on current Discord roles
            const existingNonDiscordRoles = user.roles.filter(role => 
                !['KCSO Member', 'KCSO Command', 'MSP Member', 'MSP Command', 'MFD Member', 'MFD Command'].includes(role)
            );
            user.roles = [...new Set([...existingNonDiscordRoles, ...permissions])];
            
            if (user.id !== 0) saveUsers();
            
            console.log(`✅ Updated existing user via Discord: ${user.username}`);
        }
        
        // Create new session with proper data structure
        const sessionUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles,
            discordId: user.discordId,
            discordUsername: user.discordUsername,
            avatar: user.discordAvatar,
            lastLogin: user.lastLogin
        };
        
        console.log('📋 Creating session with user data:', JSON.stringify(sessionUser, null, 2));
        req.session.user = sessionUser;
        
        // Force session save and redirect
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.redirect('/?auth=error&message=' + encodeURIComponent('Session creation failed'));
            }
            
            console.log(`✅ Session created for user: ${user.username}`);
            console.log(`📋 Final session user:`, req.session.user);
            res.redirect('/?auth=success');
        });
        
    } catch (error) {
        console.error('❌ Discord OAuth callback error:', error);
        res.redirect('/?auth=error&message=' + encodeURIComponent('Authentication failed: ' + error.message));
    }
});

// Account management
app.post('/api/account/unlink-discord', requireAuth, (req, res) => {
    const user = findUserById(req.session.user.id);
    
    if (!user || user.id === 0) {
        return res.status(400).json({ error: 'Cannot unlink Discord from this account' });
    }
    
    // Remove Discord-specific roles but keep manually assigned ones
    user.roles = user.roles.filter(role => 
        ['User', 'Staff', 'Admin', 'Server Director'].includes(role)
    );
    user.discordId = null;
    user.discordUsername = null;
    user.discordAvatar = null;
    
    saveUsers();
    
    // Update session
    req.session.user.discordId = null;
    req.session.user.discordUsername = null;
    req.session.user.avatar = '/images/default-avatar.png';
    req.session.user.roles = user.roles;
    
    console.log(`🔗 Unlinked Discord account for ${user.username}`);
    res.json({ success: true });
});

// API endpoints
app.get('/api/user', (req, res) => {
    console.log('📋 Session check - Session ID:', req.sessionID);
    console.log('📋 Session user:', req.session.user ? req.session.user.username : 'Not found');
    
    if (req.session.user) {
        console.log('✅ Returning user data:', req.session.user.username);
        res.json(req.session.user);
    } else {
        console.log('❌ No session found');
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Test route to create a session manually
app.get('/api/test-session', (req, res) => {
    console.log('\n🧪 Testing session creation...');
    console.log('📋 Before - Session ID:', req.sessionID);
    console.log('📋 Before - Session user:', req.session.user);
    
    req.session.user = {
        id: 999,
        username: 'TestUser',
        roles: ['User'],
        testCreated: new Date().toISOString()
    };
    
    req.session.save((err) => {
        if (err) {
            console.error('❌ Test session save error:', err);
            return res.json({ error: 'Session save failed', err: err.message });
        }
        
        console.log('✅ Test session saved!');
        console.log('📋 After - Session ID:', req.sessionID);
        console.log('📋 After - Session user:', req.session.user);
        
        res.json({
            success: true,
            sessionId: req.sessionID,
            user: req.session.user,
            message: 'Test session created. Now try /api/user to see if it persists.'
        });
    });
});

// Enhanced debug endpoint
app.get('/api/debug/session', (req, res) => {
    console.log('\n🔍 Debug session called');
    console.log('📋 Session ID:', req.sessionID);
    console.log('📋 Session exists:', !!req.session);
    console.log('📋 Session user exists:', !!req.session.user);
    console.log('📋 Full session:', JSON.stringify(req.session, null, 2));
    console.log('📋 Cookies:', req.headers.cookie);
    
    res.json({
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasUser: !!req.session.user,
        user: req.session.user || null,
        sessionData: req.session,
        cookies: req.headers.cookie,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/user/permissions/:permission', requireAuth, (req, res) => {
    const { permission } = req.params;
    const hasPermission = req.session.user.roles.includes(permission);
    res.json({ 
        hasPermission, 
        roles: req.session.user.roles,
        permission: permission
    });
});

// Server statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalUsers: users.length + 1, // +1 for master user
        onlineUsers: 0, // Would need real-time tracking
        discordLinked: users.filter(u => u.discordId).length + (masterUser.discordId ? 1 : 0),
        staffCount: users.filter(u => u.roles.includes('Staff')).length + (masterUser.roles.includes('Staff') ? 1 : 0)
    };
    res.json(stats);
});

// Department endpoints
app.get('/api/department/:dept/members', requireAuth, (req, res) => {
    const { dept } = req.params;
    const user = req.session.user;
    
    const deptPermissions = {
        'kcso': 'KCSO Member',
        'msp': 'MSP Member', 
        'mfd': 'MFD Member'
    };
    
    const hasAccess = user.roles.includes(deptPermissions[dept]) || 
                     user.roles.includes('Admin') || 
                     user.roles.includes('Server Director');
    
    if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this department' });
    }
    
    // Get all users with department role
    const allUsers = [masterUser, ...users];
    const deptMembers = allUsers
        .filter(u => u.roles.includes(deptPermissions[dept]))
        .map(u => ({
            id: u.id,
            username: u.username,
            discordUsername: u.discordUsername || 'Not linked',
            roles: u.roles.filter(r => r.includes(dept.toUpperCase())),
            lastLogin: u.lastLogin,
            avatar: u.discordAvatar || '/images/default-avatar.png'
        }));
    
    res.json(deptMembers);
});

// Staff moderation endpoints
app.get('/api/staff/stats', requirePermission('Staff'), (req, res) => {
    const staffStats = {
        totalUsers: users.length + 1,
        activeUsers: users.filter(u => u.status === 'active').length + 1,
        bannedUsers: users.filter(u => u.status === 'banned').length,
        discordLinked: users.filter(u => u.discordId).length + (masterUser.discordId ? 1 : 0),
        staffCount: users.filter(u => u.roles.some(role => ['Staff', 'Admin', 'Server Director'].includes(role))).length + 1,
        topOffenders: [
            { name: 'RepeatOffender1', bans: 5, kicks: 12, warns: 23 },
            { name: 'ProblemPlayer2', bans: 3, kicks: 8, warns: 19 },
            { name: 'TroubleUser3', bans: 4, kicks: 6, warns: 15 }
        ]
    };
    res.json(staffStats);
});

app.post('/api/staff/moderate', requirePermission('Staff'), (req, res) => {
    const { playerId, action, reason, duration } = req.body;
    const moderator = req.session.user.username;
    
    if (!playerId || !action || !reason) {
        return res.status(400).json({ error: 'Missing required fields: playerId, action, reason' });
    }
    
    const validActions = ['warn', 'kick', 'ban'];
    if (!validActions.includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be warn, kick, or ban' });
    }
    
    if (action === 'ban' && !duration) {
        return res.status(400).json({ error: 'Duration required for ban actions' });
    }
    
    // Log the moderation action
    console.log(`🔨 Moderation action by ${moderator}:`, {
        playerId,
        action: action.toUpperCase(),
        reason,
        duration: duration || 'N/A',
        timestamp: new Date().toISOString()
    });
    
    // In a real implementation, you would:
    // 1. Validate the player exists
    // 2. Apply the moderation action to your game server
    // 3. Log the action to your database
    // 4. Send notifications if needed
    
    res.json({ 
        success: true, 
        message: `${action.toUpperCase()} applied to player ${playerId}`,
        action: {
            playerId,
            action,
            reason,
            duration,
            moderator,
            timestamp: new Date().toISOString()
        }
    });
});

app.post('/api/staff/add-money', requirePermission('Staff'), (req, res) => {
    const { playerId, amount, type } = req.body;
    const moderator = req.session.user.username;
    
    if (!playerId || !amount || !type) {
        return res.status(400).json({ error: 'Missing required fields: playerId, amount, type' });
    }
    
    const validTypes = ['cash', 'bank'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid money type. Must be cash or bank' });
    }
    
    if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    console.log(`💰 Money added by ${moderator}:`, {
        playerId,
        amount: `${amount}`,
        type,
        timestamp: new Date().toISOString()
    });
    
    res.json({ 
        success: true, 
        message: `${amount} added to ${playerId}'s ${type}`,
        transaction: {
            playerId,
            amount,
            type,
            moderator,
            timestamp: new Date().toISOString()
        }
    });
});

app.get('/api/staff/live-players', requirePermission('Staff'), (req, res) => {
    // In a real implementation, this would connect to your game server
    // and return actual online players
    const mockLivePlayers = [
        {
            id: 1,
            name: 'ActivePlayer1',
            discordId: '123456789',
            trustScore: 85,
            notes: 'Good player, follows rules',
            onlineTime: '2h 34m',
            position: 'Los Santos',
            job: 'Civilian'
        },
        {
            id: 2,
            name: 'SuspiciousUser',
            discordId: '987654321',
            trustScore: 42,
            notes: 'Previous warnings for mic spam',
            onlineTime: '45m',
            position: 'Sandy Shores',
            job: 'Criminal'
        },
        {
            id: 3,
            name: 'VeteranPlayer',
            discordId: '456789123',
            trustScore: 95,
            notes: 'Veteran player, very reliable',
            onlineTime: '4h 12m',
            position: 'Paleto Bay',
            job: 'Police Officer'
        }
    ];
    
    res.json(mockLivePlayers);
});

app.get('/api/staff/recent-actions', requirePermission('Staff'), (req, res) => {
    // In a real implementation, this would come from your database
    const recentActions = {
        bans: [
            { id: 1, player: 'PlayerName123', moderator: 'ModeratorAlex', reason: 'Cheating/Exploiting', duration: '7 days', time: '2 hours ago' },
            { id: 2, player: 'ToxicUser456', moderator: 'AdminSarah', reason: 'Harassment', duration: '3 days', time: '5 hours ago' },
            { id: 3, player: 'SpeedHacker789', moderator: 'ModeratorMike', reason: 'Speed hacking', duration: '14 days', time: '1 day ago' }
        ],
        kicks: [
            { id: 1, player: 'PlayerABC', moderator: 'ModeratorAlex', reason: 'Mic spam', time: '30 minutes ago' },
            { id: 2, player: 'UserXYZ', moderator: 'AdminSarah', reason: 'Inappropriate language', time: '1 hour ago' },
            { id: 3, player: 'NewPlayer123', moderator: 'ModeratorMike', reason: 'Not following RP', time: '2 hours ago' }
        ],
        warns: [
            { id: 1, player: 'MinorOffender', moderator: 'ModeratorAlex', reason: 'Minor rule violation', time: '15 minutes ago' },
            { id: 2, player: 'NewbiePlayer', moderator: 'AdminSarah', reason: 'First time offense', time: '45 minutes ago' },
            { id: 3, player: 'RegularUser', moderator: 'ModeratorMike', reason: 'Improper vehicle usage', time: '1 hour ago' }
        ]
    };
    
    res.json(recentActions);
});

// Admin endpoints
app.get('/api/admin/users', requirePermission('Admin'), (req, res) => {
    const allUsers = [masterUser, ...users].map(user => ({
        id: user.id,
        username: user.username,
        email: user.email || 'Discord Only',
        discordId: user.discordId || 'Not linked',
        discordUsername: user.discordUsername || 'Not linked',
        roles: user.roles,
        lastLogin: user.lastLogin || 'Never',
        status: user.status,
        createdAt: user.createdAt
    }));
    
    res.json(allUsers);
});

app.put('/api/admin/users/:id/roles', requirePermission('Admin'), (req, res) => {
    const { id } = req.params;
    const { roles } = req.body;
    
    if (parseInt(id) === 0) {
        return res.status(400).json({ error: 'Cannot modify owner account roles' });
    }
    
    const user = findUserById(parseInt(id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate roles
    const validRoles = ['User', 'Staff', 'Admin', 'Server Director', 'KCSO Member', 'KCSO Command', 'MSP Member', 'MSP Command', 'MFD Member', 'MFD Command'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
        return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }
    
    user.roles = roles;
    saveUsers();
    
    console.log(`👥 Admin ${req.session.user.username} updated roles for ${user.username}: ${roles.join(', ')}`);
    res.json({ success: true });
});

app.delete('/api/admin/users/:id', requirePermission('Admin'), (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id) === 0) {
        return res.status(400).json({ error: 'Cannot delete owner account' });
    }
    
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    saveUsers();
    
    console.log(`🗑️  Admin ${req.session.user.username} deleted user: ${deletedUser.username}`);
    res.json({ success: true });
});

// Logout
app.post('/api/logout', (req, res) => {
    const username = req.session.user?.username || 'Unknown';
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
            return res.status(500).json({ error: 'Could not log out' });
        }
        console.log(`👋 User logged out: ${username}`);
        res.json({ success: true });
    });
});

// Test Discord connection
async function testDiscordConnection() {
    try {
        console.log('🔄 Testing Discord API connection...');
        
        // Test bot token
        const botResponse = await axios.get(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log(`✅ Discord bot connected: ${botResponse.data.username}#${botResponse.data.discriminator}`);
        
        // Test guild access
        const guildResponse = await axios.get(`${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log(`✅ Guild access confirmed: ${guildResponse.data.name} (${guildResponse.data.member_count} members)`);
        
        // Test role mapping
        const rolesResponse = await axios.get(`${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/roles`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log('📋 Available Discord roles:');
        rolesResponse.data.forEach(role => {
            if (role.name !== '@everyone') {
                const isMapped = Object.keys(ROLE_MAPPING).includes(role.id);
                console.log(`   ${isMapped ? '✅' : '⚠️ '} ${role.name} (${role.id})`);
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Discord API test failed:', error.response?.data || error.message);
        return false;
    }
}

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log('🎮 Ace of Spades Roleplay Server');
    console.log('================================');
    console.log(`📍 Server running on http://localhost:${PORT}`);
    console.log(`👑 Master account: ${MASTER_EMAIL} / ${MASTER_PASSWORD}`);
    console.log(`💾 User database: ${users.length} users loaded`);
    
    // Test Discord connection
    const discordWorking = await testDiscordConnection();
    if (!discordWorking) {
        console.log('⚠️  Discord integration may not work properly');
        console.log('   Check your .env file and Discord bot permissions');
    }
    
    console.log('================================');
});

module.exports = app;