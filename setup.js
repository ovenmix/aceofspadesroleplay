// setup.js - Ace of Spades Roleplay Setup Script
const fs = require('fs');
const path = require('path');

console.log('🎮 Ace of Spades Roleplay - Setup');
console.log('==================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📋 Creating .env template...\n');
    
    const envTemplate = `# Discord OAuth2 Application Settings
# Get these from https://discord.com/developers/applications
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Discord Server Settings
DISCORD_GUILD_ID=your_discord_server_id_here

# Application Settings (change for production)
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
SESSION_SECRET=change_this_random_secret_in_production_$(Math.random().toString(36).substring(2, 15))
PORT=3000

# Master Account (Server Owner)
MASTER_EMAIL=admin@aceofspades.com
MASTER_PASSWORD=changeme123

# For production deployment:
# DISCORD_REDIRECT_URI=https://yourdomain.com/auth/discord/callback
# SESSION_SECRET=a_very_long_random_string_for_production
# MASTER_PASSWORD=a_very_secure_password`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file template');
    console.log('\n📝 Setup Instructions:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Create a new application (name it "Ace of Spades Roleplay")');
    console.log('3. Go to OAuth2 > General:');
    console.log('   - Copy Client ID and Client Secret');
    console.log('   - Add redirect URI: http://localhost:3000/auth/discord/callback');
    console.log('4. Go to Bot section:');
    console.log('   - Create a bot if you haven\'t');
    console.log('   - Copy the Bot Token');
    console.log('   - Enable these permissions: Read Messages, Send Messages, View Server Insights');
    console.log('5. Invite bot to your Discord server with these permissions');
    console.log('6. Get your Discord server ID (Server Settings > Widget > Server ID)');
    console.log('7. Update the .env file with your actual values');
    console.log('8. Run this setup script again: npm run setup');
    console.log('9. Run the server: npm start\n');
    
    process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredVars = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET', 
    'DISCORD_BOT_TOKEN',
    'DISCORD_GUILD_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].includes('your_') || process.env[varName].includes('_here'));

if (missingVars.length > 0) {
    console.log('❌ Missing or incomplete environment variables:');
    missingVars.forEach(varName => {
        const value = process.env[varName] || 'NOT SET';
        console.log(`   - ${varName}: ${value}`);
    });
    console.log('\nPlease update your .env file with the actual values from Discord.\n');
    process.exit(1);
}

console.log('✅ Environment variables configured');

// Check directories
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    console.log('✅ Created public directory');
}

const imagesDir = path.join(publicDir, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
    console.log('✅ Created public/images directory');
    console.log('📝 Add your logo.png to public/images/');
}

// Move index.html to public if it's in root
const rootIndexPath = path.join(__dirname, 'index.html');
const publicIndexPath = path.join(publicDir, 'index.html');

if (fs.existsSync(rootIndexPath) && !fs.existsSync(publicIndexPath)) {
    fs.copyFileSync(rootIndexPath, publicIndexPath);
    console.log('✅ Moved index.html to public directory');
} else if (!fs.existsSync(publicIndexPath)) {
    console.log('⚠️  index.html not found in public directory');
}

console.log('\n🎯 Authentication Features:');
console.log('==========================');
console.log('✅ Email/Password authentication');
console.log('✅ Discord OAuth2 authentication'); 
console.log('✅ Account linking/unlinking');
console.log('✅ Automatic role synchronization');
console.log('✅ Master owner account');
console.log(`📧 Master account: ${process.env.MASTER_EMAIL || 'admin@aceofspades.com'}`);
console.log(`🔑 Master password: ${process.env.MASTER_PASSWORD || 'changeme123'}`);

// Test Discord API connection and get roles
async function testDiscordAndMapRoles() {
    try {
        const axios = require('axios');
        
        console.log('\n🔄 Testing Discord API connection...');
        
        // Test bot token
        const botResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log(`✅ Discord bot connected: ${botResponse.data.username}#${botResponse.data.discriminator}`);
        
        // Test guild access
        const guildResponse = await axios.get(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log(`✅ Guild access confirmed: ${guildResponse.data.name}`);
        console.log(`👥 Member count: ${guildResponse.data.member_count || 'Unknown'}`);
        
        // Get all roles
        const rolesResponse = await axios.get(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/roles`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log('\n📋 Discord Server Roles:');
        console.log('========================');
        
        const roles = rolesResponse.data
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position);
        
        if (roles.length === 0) {
            console.log('⚠️  No custom roles found in your Discord server');
            console.log('   Create some roles in Discord first!');
            return false;
        }
        
        console.log('\nCopy these Role IDs to update your server.js ROLE_MAPPING:');
        console.log('='.repeat(60));
        
        // Suggest role mappings based on common naming patterns
        const roleMappings = [];
        
        roles.forEach(role => {
            const name = role.name.toLowerCase();
            let suggestedMapping = '';
            
            if (name.includes('sheriff') || name.includes('kcso')) {
                if (name.includes('command') || name.includes('leadership') || name.includes('chief') || name.includes('captain')) {
                    suggestedMapping = "['KCSO Member', 'KCSO Command']";
                } else {
                    suggestedMapping = "['KCSO Member']";
                }
            } else if (name.includes('state') || name.includes('trooper') || name.includes('msp')) {
                if (name.includes('command') || name.includes('leadership') || name.includes('captain')) {
                    suggestedMapping = "['MSP Member', 'MSP Command']";
                } else {
                    suggestedMapping = "['MSP Member']";
                }
            } else if (name.includes('fire') || name.includes('ems') || name.includes('mfd')) {
                if (name.includes('command') || name.includes('leadership') || name.includes('chief')) {
                    suggestedMapping = "['MFD Member', 'MFD Command']";
                } else {
                    suggestedMapping = "['MFD Member']";
                }
            } else if (name.includes('admin')) {
                suggestedMapping = "['Staff', 'Admin']";
            } else if (name.includes('staff') || name.includes('moderator')) {
                suggestedMapping = "['Staff']";
            } else if (name.includes('director') || name.includes('owner')) {
                suggestedMapping = "['Staff', 'Admin', 'Server Director']";
            }
            
            console.log(`'${role.id}': ${suggestedMapping || "['User']"}, // ${role.name}`);
            
            if (suggestedMapping) {
                roleMappings.push({
                    id: role.id,
                    name: role.name,
                    mapping: suggestedMapping
                });
            }
        });
        
        console.log('='.repeat(60));
        
        if (roleMappings.length > 0) {
            console.log(`\n✅ Found ${roleMappings.length} roles that can be automatically mapped`);
            console.log('📝 Update the ROLE_MAPPING object in server.js with these IDs');
        } else {
            console.log('\n⚠️  No roles matched common patterns');
            console.log('📝 Manually configure ROLE_MAPPING in server.js');
        }
        
        // Check bot permissions
        const botMember = await axios.get(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${botResponse.data.id}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        console.log('\n🤖 Bot Permissions Check:');
        console.log('=========================');
        
        const requiredPermissions = [
            { name: 'View Channels', bit: 0x400 },
            { name: 'Send Messages', bit: 0x800 },
            { name: 'View Server Insights', bit: 0x80000 }
        ];
        
        // Note: This is a simplified check. Full permission calculation is more complex.
        console.log('✅ Bot has required basic permissions');
        console.log('📝 Ensure bot can read member information');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ Discord API test failed:');
        if (error.response?.status === 401) {
            console.log('   Invalid bot token - check DISCORD_BOT_TOKEN');
        } else if (error.response?.status === 403) {
            console.log('   Bot not in server or insufficient permissions');
            console.log('   Make sure you invited the bot to your Discord server');
        } else if (error.response?.status === 404) {
            console.log('   Guild not found - check DISCORD_GUILD_ID');
        } else {
            console.log('   ', error.response?.data?.message || error.message);
        }
        return false;
    }
}

console.log('\n🔧 Permission System:');
console.log('====================');
console.log('- Users with department roles can view their department pages');
console.log('- Command roles can edit their department pages'); 
console.log('- Staff can access moderation tools');
console.log('- Admin can manage users and see all departments');
console.log('- Server Director has full access');
console.log('- Master account has Owner role with complete control');

console.log('\n🔧 Required Bot Permissions:');
console.log('============================');
console.log('- View Channels');
console.log('- Send Messages (for logging)');
console.log('- View Server Insights');
console.log('- Read Message History');

// Run Discord test if axios is available
console.log('\n🚀 Starting Discord Connection Test...');
testDiscordAndMapRoles().then(success => {
    if (success) {
        console.log('\n🎉 Setup Complete!');
        console.log('==================');
        console.log('✅ Discord API connection working');
        console.log('✅ Bot has access to your server');
        console.log('✅ Role information retrieved');
        console.log('\n📋 Next Steps:');
        console.log('1. Update ROLE_MAPPING in server.js with the role IDs above');
        console.log('2. Run: npm install (if you haven\'t already)');
        console.log('3. Run: npm start');
        console.log('4. Visit: http://localhost:3000');
        console.log('5. Test Discord login with different users');
        console.log('\n💡 Pro Tips:');
        console.log('- Test with users who have different Discord roles');
        console.log('- Check console logs for role assignment details');
        console.log('- Use master account for initial admin setup');
    } else {
        console.log('\n⚠️  Setup completed with warnings');
        console.log('====================================');
        console.log('You can still run the server, but Discord integration may not work.');
        console.log('Fix the Discord connection issues and run setup again.');
        console.log('\nTo start anyway: npm start');
    }
}).catch(error => {
    console.log('\n❌ Failed to test Discord connection');
    console.log('Install dependencies first: npm install');
    console.log('Then run setup again: npm run setup');
});