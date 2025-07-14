const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbPath = process.env.DATABASE_PATH || './database.sqlite';
let db;

// Initialize database connection and create tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

// Create all necessary tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id TEXT UNIQUE,
        username TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'Civilian',
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Players table (game server data)
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        steam_id TEXT UNIQUE,
        discord_id TEXT,
        username TEXT NOT NULL,
        playtime INTEGER DEFAULT 0,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        cash_money INTEGER DEFAULT 0,
        bank_money INTEGER DEFAULT 0,
        donated DECIMAL(10,2) DEFAULT 0.00,
        trust_score INTEGER DEFAULT 70,
        notes TEXT,
        online BOOLEAN DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Moderation logs
      `CREATE TABLE IF NOT EXISTS moderation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        moderator_id INTEGER,
        action TEXT NOT NULL,
        reason TEXT,
        duration TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players (id),
        FOREIGN KEY (moderator_id) REFERENCES users (id)
      )`,

      // Bans table
      `CREATE TABLE IF NOT EXISTS bans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        moderator_id INTEGER,
        reason TEXT NOT NULL,
        expires_at DATETIME,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players (id),
        FOREIGN KEY (moderator_id) REFERENCES users (id)
      )`,

      // Department command structure
      `CREATE TABLE IF NOT EXISTS department_command (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department TEXT NOT NULL,
        name TEXT NOT NULL,
        rank TEXT NOT NULL,
        discord_id TEXT,
        rank_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Department documents
      `CREATE TABLE IF NOT EXISTS department_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Server settings
      `CREATE TABLE IF NOT EXISTS server_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_name TEXT DEFAULT 'RP Server Community',
        max_players INTEGER DEFAULT 200,
        discord_guild_id TEXT,
        discord_bot_token TEXT,
        discord_client_id TEXT,
        discord_client_secret TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === tables.length) {
          console.log('All tables created successfully');
          seedData().then(resolve).catch(reject);
        }
      });
    });
  });
};

// Seed initial data
const seedData = async () => {
  try {
    // Check if settings exist
    const settings = await query('SELECT COUNT(*) as count FROM server_settings');
    if (settings[0].count === 0) {
      await query('INSERT INTO server_settings (server_name) VALUES (?)', ['RP Server Community']);
    }

    // Seed department command structure
    const commandExists = await query('SELECT COUNT(*) as count FROM department_command');
    if (commandExists[0].count === 0) {
      const commandData = [
        // KCSO
        ['KCSO', 'John Smith', 'Sheriff', 'JohnS#1234', 1],
        ['KCSO', 'Sarah Johnson', 'Undersheriff', 'SarahJ#5678', 2],
        ['KCSO', 'Mike Wilson', 'Chief Deputy', 'MikeW#9012', 3],
        ['KCSO', 'Lisa Brown', 'Captain', 'LisaB#3456', 4],
        
        // MSP
        ['MSP', 'Robert Davis', 'Colonel', 'RobertD#7890', 1],
        ['MSP', 'Jennifer White', 'Lieutenant Colonel', 'JenW#2345', 2],
        ['MSP', 'David Miller', 'Major', 'DavidM#6789', 3],
        ['MSP', 'Amanda Garcia', 'Captain', 'AmandaG#0123', 4],
        
        // MFD
        ['MFD', 'Thomas Anderson', 'Fire Chief', 'TomA#4567', 1],
        ['MFD', 'Maria Rodriguez', 'Assistant Chief', 'MariaR#8901', 2],
        ['MFD', 'Kevin Lee', 'Battalion Chief', 'KevinL#2345', 3],
        ['MFD', 'Nicole Taylor', 'Captain', 'NicoleT#6789', 4]
      ];

      for (const [dept, name, rank, discord, order] of commandData) {
        await query(
          'INSERT INTO department_command (department, name, rank, discord_id, rank_order) VALUES (?, ?, ?, ?, ?)',
          [dept, name, rank, discord, order]
        );
      }
    }

    // Seed department documents
    const docsExist = await query('SELECT COUNT(*) as count FROM department_documents');
    if (docsExist[0].count === 0) {
      const documents = [
        // KCSO Documents
        ['KCSO', 'Standard Operating Procedures', 'Comprehensive guidelines for daily operations and protocols for King County Sheriff\'s Office personnel.'],
        ['KCSO', 'Training Manual', 'Complete training protocols and procedures for new recruits and ongoing education.'],
        ['KCSO', 'Code of Conduct', 'Professional standards and behavioral expectations for all KCSO personnel.'],
        ['KCSO', 'Equipment Guidelines', 'Proper use and maintenance of department equipment and vehicles.'],
        
        // MSP Documents
        ['MSP', 'Patrol Procedures', 'State-wide patrol guidelines and protocols for Maryland State Police operations.'],
        ['MSP', 'Investigation Manual', 'Criminal investigation procedures and techniques for detectives and investigators.'],
        ['MSP', 'Traffic Enforcement', 'Highway patrol and traffic enforcement guidelines for state troopers.'],
        ['MSP', 'Emergency Response', 'Emergency situation response procedures and incident command protocols.'],
        
        // MFD Documents
        ['MFD', 'Fire Suppression SOPs', 'Fire suppression tactics and safety procedures for emergency response.'],
        ['MFD', 'EMS Protocols', 'Emergency medical service guidelines and patient care protocols.'],
        ['MFD', 'Hazmat Procedures', 'Hazardous materials response and containment procedures.'],
        ['MFD', 'Rescue Operations', 'Technical rescue and emergency response procedures for specialized situations.']
      ];

      for (const [dept, title, content] of documents) {
        await query(
          'INSERT INTO department_documents (department, title, content) VALUES (?, ?, ?)',
          [dept, title, content]
        );
      }
    }

    // Seed sample players
    const playersExist = await query('SELECT COUNT(*) as count FROM players');
    if (playersExist[0].count === 0) {
      const samplePlayers = [
        ['76561198000000001', '123456789', 'VeteranPlayer92', 2847, 456, 123, 15000, 500000, 125.50, 95, 'Veteran player, very reliable', 1],
        ['76561198000000002', '987654321', 'RecklessDriver', 1284, 89, 1284, 5000, 25000, 0, 42, 'Previous warnings for reckless driving', 1],
        ['76561198000000003', '456789123', 'TopCop_Jake', 1856, 456, 89, 12000, 75000, 50.00, 88, 'Excellent police officer', 1],
        ['76561198000000004', '789123456', 'NewPlayer2025', 45, 2, 5, 1500, 5000, 0, 70, 'New player, learning the ropes', 1],
        ['76561198000000005', '321654987', 'BusinessTycoon', 2156, 12, 3, 250000, 15597392, 2450.00, 85, 'Successful business owner', 0]
      ];

      for (const [steamId, discordId, username, playtime, kills, deaths, cash, bank, donated, trust, notes, online] of samplePlayers) {
        await query(
          'INSERT INTO players (steam_id, discord_id, username, playtime, kills, deaths, cash_money, bank_money, donated, trust_score, notes, online) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [steamId, discordId, username, playtime, kills, deaths, cash, bank, donated, trust, notes, online]
        );
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Generic query function with promise support
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (sql.toLowerCase().startsWith('select')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve({ insertId: this.lastID, changes: this.changes });
        }
      });
    }
  });
};

// Get database instance
const getDatabase = () => db;

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  query,
  getDatabase,
  closeDatabase
};