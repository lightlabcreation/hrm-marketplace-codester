const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
    database: process.env.DB_NAME || 'hrm-saas-kiaan-codestore',
    waitForConnections: true,
    connectionLimit: 30,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    timezone: '+05:30',
    dateStrings: true
});

module.exports = pool.promise();
