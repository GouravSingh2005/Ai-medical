// src/db.ts
import mysql from 'mysql2/promise';

// Create a connection pool (efficient for multiple queries)
export const pool = mysql.createPool({
  host: '127.0.0.1', // Docker MySQL container IP / localhost
  user: 'root',       // Docker MySQL root username
  password: 'root',   // Docker MySQL root password
  database: 'myproject', // Your database name
  port: 3306,         // Port mapping (docker run -p 3306:3306)
});

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to Docker MySQL');
    connection.release(); // release the connection back to pool
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
})();
