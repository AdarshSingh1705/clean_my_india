const { Pool } = require('pg');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   DATABASE CONNECTION TEST                ║', 'blue');
  log('╚════════════════════════════════════════════╝\n', 'blue');

  // Display connection info (without password)
  log('Connection Details:', 'yellow');
  log(`  Host: ${process.env.DB_HOST}`);
  log(`  Database: ${process.env.DB_NAME}`);
  log(`  User: ${process.env.DB_USER}`);
  log(`  Port: ${process.env.DB_PORT || 5432}`);
  log(`  SSL: Enabled\n`);

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 5432,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  });

  try {
    log('Testing connection...', 'yellow');
    
    // Test basic connection
    const client = await pool.connect();
    log('✓ Successfully connected to database!', 'green');
    
    // Test query
    log('\nTesting query execution...', 'yellow');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    log('✓ Query executed successfully!', 'green');
    log(`  Current Time: ${result.rows[0].current_time}`);
    log(`  PostgreSQL Version: ${result.rows[0].pg_version.split(',')[0]}\n`);
    
    // Check if tables exist
    log('Checking database tables...', 'yellow');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const requiredTables = ['users', 'issues', 'comments', 'likes', 'notifications'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    log(`\nFound ${existingTables.length} tables:`);
    
    let allTablesExist = true;
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        log(`  ✓ ${table}`, 'green');
      } else {
        log(`  ✗ ${table} (MISSING)`, 'red');
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      log('\n⚠ Warning: Some required tables are missing!', 'yellow');
      log('Run the setup-database.sql script to create them:', 'yellow');
      log('  psql -h <host> -U <user> -d <database> -f setup-database.sql\n', 'yellow');
    } else {
      log('\n✓ All required tables exist!', 'green');
      
      // Count records in each table
      log('\nTable Statistics:', 'yellow');
      for (const table of requiredTables) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        log(`  ${table}: ${countResult.rows[0].count} records`);
      }
    }
    
    client.release();
    
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║   CONNECTION TEST PASSED ✓                ║', 'blue');
    log('╚════════════════════════════════════════════╝\n', 'blue');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    log('\n✗ Database connection failed!', 'red');
    log(`\nError: ${error.message}`, 'red');
    
    if (error.code) {
      log(`Error Code: ${error.code}`, 'red');
    }
    
    log('\n╔════════════════════════════════════════════╗', 'red');
    log('║   TROUBLESHOOTING TIPS                    ║', 'red');
    log('╚════════════════════════════════════════════╝\n', 'red');
    
    if (error.message.includes('ENOTFOUND')) {
      log('Issue: Cannot resolve database hostname', 'yellow');
      log('Fix: Check DB_HOST in .env file', 'yellow');
      log('  Should be: dpg-d4hhmhumcj7s73c1ubp0-a.oregon-postgres.render.com\n', 'yellow');
    } else if (error.message.includes('ECONNREFUSED')) {
      log('Issue: Connection refused', 'yellow');
      log('Fix: Check if database is running and port is correct\n', 'yellow');
    } else if (error.message.includes('authentication failed')) {
      log('Issue: Authentication failed', 'yellow');
      log('Fix: Check DB_USER and DB_PASS in .env file\n', 'yellow');
    } else if (error.message.includes('timeout')) {
      log('Issue: Connection timeout', 'yellow');
      log('Fix: Check network connection and firewall settings\n', 'yellow');
    }
    
    await pool.end();
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
