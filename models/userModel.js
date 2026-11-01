const { pool } = require("../config/dp");

const userModel = {
    getAllUsers: async () => {
        const result = await pool.query(`
            SELECT id, name, email FROM users ORDER BY id ASC
        `);
        return result.rows;
    },

    getUserByEmail: async (email) => {
        const result = await pool.query(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
            [email]
        );
        return result.rows[0];
    },

    createUser: async (name, email, passwordHash) => {
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
            RETURNING id, name, email`,
            [name, email, passwordHash]
        );
        return result.rows[0];
    },

    updateUser: async(id,data)=>{
        const fields=[];
        const values=[];

        if(data.name)
        {
            fields.push(`name = $${values.length+1}`);
            values.push(data.name);
        }

        if(data.email)
        {
            fields.push(`email = $${values.length+1}`);
            values.push(data.email);
        }

        if(fields.length===0)
        {return null;}

        values.push(id);

        const query=`UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, name, email`;
        const result = await pool.query(query,values);
        return result.rows[0];
    },

    deleteUser: async (id) => {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, name, email",
            [id]
        );
        return result.rows[0];
    }
    
};

module.exports = { userModel };