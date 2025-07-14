const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Testing environment variables:');
console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? 'Found' : 'Missing');
console.log('DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? 'Found' : 'Missing');
console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'Found' : 'Missing');
console.log('DISCORD_GUILD_ID:', process.env.DISCORD_GUILD_ID ? 'Found' : 'Missing');
console.log('PORT:', process.env.PORT || 'Not set');

console.log('\nActual values (first 10 chars only):');
console.log('CLIENT_ID:', process.env.DISCORD_CLIENT_ID?.substring(0, 10) + '...');
console.log('CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET?.substring(0, 10) + '...');
console.log('BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN?.substring(0, 10) + '...');
console.log('GUILD_ID:', process.env.DISCORD_GUILD_ID?.substring(0, 10) + '...');