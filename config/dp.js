const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
    connectionString: process.env.DATABASE,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

module.exports = { pool };
