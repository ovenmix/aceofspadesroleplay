const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { initDatabase, query } = require('./database');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Map Discord roles to internal roles
function mapDiscordRoleToInternal(memberRoles) {
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
  const rolePriority = [
    'Director',
    'Staff', 
    'KCSO_Command',
    'MSP_Command',
    'MFD_Command',
    'KCSO',
    'MSP', 
    'MFD'
  ];

  for (const priority of rolePriority) {
    for (const roleId of memberRoles) {
      if (roleMap[roleId] === priority) {
        return priority;
      }
    }
  }

  return 'Civilian';
}

// Sync user roles when they join or update
async function syncUserRole(member) {
  try {
    const roleIds = member.roles.cache.map(role => role.id);
    const internalRole = mapDiscordRoleToInternal(roleIds);
    
    // Update or create user in database
    const existingUser = await query('SELECT * FROM users WHERE discord_id = ?', [member.id]);
    
    if (existingUser.length > 0) {
      // Update existing user's role
      await query('UPDATE users SET role = ?, username = ? WHERE discord_id = ?', 
        [internalRole, member.user.username, member.id]);
      console.log(`Updated role for ${member.user.username}: ${internalRole}`);
    } else {
      // Create new user
      await query(
        'INSERT INTO users (discord_id, username, role) VALUES (?, ?, ?)',
        [member.id, member.user.username, internalRole]
      );
      console.log(`Created new user ${member.user.username} with role: ${internalRole}`);
    }
  } catch (error) {
    console.error('Error syncing user role:', error);
  }
}

// Bot event handlers
client.once('ready', async () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  
  // Set bot activity
  client.user.setActivity('Server Management', { type: 'WATCHING' });
  
  // Wait a bit for database to be ready, then sync members
  setTimeout(() => {
    syncAllMembers();
    registerCommands();
  }, 3000);
});

client.on('guildMemberAdd', async (member) => {
  console.log(`👋 New member joined: ${member.user.username}`);
  await syncUserRole(member);
  
  // Send welcome message to general channel
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'general');
  if (welcomeChannel) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Welcome to the Server!')
      .setDescription(`Welcome ${member.user.username}! Please read the rules and have fun!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
    
    welcomeChannel.send({ embeds: [embed] });
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Check if roles changed
  const oldRoles = oldMember.roles.cache.map(role => role.id);
  const newRoles = newMember.roles.cache.map(role => role.id);
  
  if (JSON.stringify(oldRoles) !== JSON.stringify(newRoles)) {
    console.log(`🔄 Role update for ${newMember.user.username}`);
    await syncUserRole(newMember);
  }
});

client.on('guildMemberRemove', async (member) => {
  console.log(`👋 Member left: ${member.user.username}`);
  
  // Optionally remove user from database or mark as inactive
  try {
    await query('UPDATE users SET role = ? WHERE discord_id = ?', ['Civilian', member.id]);
  } catch (error) {
    console.error('Error updating user on leave:', error);
  }
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  switch (commandName) {
    case 'ping':
      await interaction.reply('🏓 Pong!');
      break;
      
    case 'players':
      await handlePlayersCommand(interaction);
      break;
      
    case 'warn':
      await handleWarnCommand(interaction);
      break;
      
    case 'status':
      await handleStatusCommand(interaction);
      break;
      
    default:
      await interaction.reply('❌ Unknown command');
  }
});

// Command handlers
async function handlePlayersCommand(interaction) {
  try {
    const players = await query('SELECT COUNT(*) as total, SUM(online) as online FROM players');
    const stats = players[0];
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📊 Server Statistics')
      .addFields(
        { name: 'Online Players', value: `${stats.online || 0}`, inline: true },
        { name: 'Total Players', value: `${stats.total || 0}`, inline: true }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in players command:', error);
    await interaction.reply('❌ Error fetching player data');
  }
}

async function handleWarnCommand(interaction) {
  // Check if user has permission to warn
  const member = interaction.member;
  const hasPermission = member.roles.cache.some(role => 
    [process.env.DIRECTOR_ROLE_ID, process.env.STAFF_ROLE_ID].includes(role.id)
  );
  
  if (!hasPermission) {
    await interaction.reply({ content: '❌ You don\'t have permission to use this command', ephemeral: true });
    return;
  }
  
  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');
  
  try {
    // Log the warning in database
    const moderator = await query('SELECT * FROM users WHERE discord_id = ?', [interaction.user.id]);
    const player = await query('SELECT * FROM players WHERE discord_id = ?', [targetUser.id]);
    
    if (moderator.length > 0 && player.length > 0) {
      await query(
        'INSERT INTO moderation_logs (player_id, moderator_id, action, reason) VALUES (?, ?, ?, ?)',
        [player[0].id, moderator[0].id, 'warn', reason]
      );
    }
    
    const embed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle('⚠️ Player Warned')
      .addFields(
        { name: 'Player', value: targetUser.username, inline: true },
        { name: 'Moderator', value: interaction.user.username, inline: true },
        { name: 'Reason', value: reason || 'No reason provided', inline: false }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    
    // Send DM to warned user
    try {
      await targetUser.send(`⚠️ You have been warned by ${interaction.user.username}. Reason: ${reason || 'No reason provided'}`);
    } catch (dmError) {
      console.log('Could not send DM to warned user');
    }
    
  } catch (error) {
    console.error('Error in warn command:', error);
    await interaction.reply('❌ Error processing warning');
  }
}

async function handleStatusCommand(interaction) {
  try {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🟢 Bot Status')
      .addFields(
        { name: 'Status', value: 'Online', inline: true },
        { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
        { name: 'Guild', value: interaction.guild.name, inline: true }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in status command:', error);
    await interaction.reply('❌ Error fetching status');
  }
}

// Sync all guild members
async function syncAllMembers() {
  try {
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      console.error('Guild not found - check DISCORD_GUILD_ID in .env');
      return;
    }
    
    const members = await guild.members.fetch();
    console.log(`🔄 Syncing ${members.size} members...`);
    
    let synced = 0;
    for (const [, member] of members) {
      if (!member.user.bot) {
        await syncUserRole(member);
        synced++;
      }
    }
    
    console.log(`✅ Synced ${synced} members`);
  } catch (error) {
    console.error('Error syncing members:', error);
  }
}

// Register slash commands
async function registerCommands() {
  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!'
    },
    {
      name: 'players',
      description: 'Show server player statistics'
    },
    {
      name: 'warn',
      description: 'Warn a player',
      options: [
        {
          type: 6, // USER type
          name: 'user',
          description: 'The user to warn',
          required: true
        },
        {
          type: 3, // STRING type
          name: 'reason',
          description: 'Reason for the warning',
          required: true
        }
      ]
    },
    {
      name: 'status',
      description: 'Show bot status'
    }
  ];

  try {
    console.log('🔄 Registering slash commands...');
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (guild) {
      await guild.commands.set(commands);
      console.log('✅ Slash commands registered');
    } else {
      console.error('❌ Could not find guild for slash commands');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Initialize database then login bot
async function startBot() {
  try {
    console.log('🔄 Initializing database for bot...');
    await initDatabase();
    console.log('✅ Database initialized for bot');
    
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error('Failed to start Discord bot:', error);
    process.exit(1);
  }
}

startBot();

module.exports = { client, syncUserRole };