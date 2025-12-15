// src/db.ts - Database connection with environment variables
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool (efficient for multiple queries)
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'myproject',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Query helper function
export async function query(sql: string, params?: any[]): Promise<any> {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
    console.error('Please ensure MySQL is running and credentials are correct');
  }
})();
