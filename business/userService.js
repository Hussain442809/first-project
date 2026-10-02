const { userModel } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET)
        throw new Error("JWT secret is not configured");

    return process.env.JWT_SECRET;
};

const userService = {
    getAllUsers: async () => {
        return await userModel.getAllUsers();
    },

    getUserById: async (id) => {
        if (!id) throw new Error("user id is required");
        return await userModel.getUserById(id);
    },

    register: async (data = {}) => {
        const { name, email, password } = data || {};
        if (!name || !email || !password)
            throw new Error("name , email and password is required");

        const existingUser = await userModel.getUserByEmail(email);

        if (existingUser)
            throw new Error("email has been figured");

        const passwordHash = await bcrypt.hash(password, 12);
        return await userModel.createUser(name, email, passwordHash);
    },

    login: async (email, password) => {
        const user = await userModel.getUserByEmail(email);

        if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
            throw new Error("invalid email or password");
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || "user" },
            getJwtSecret(),
            { expiresIn: "1h" }
        );

        return {
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role || "user" }
        };
    },

    updateUser: async (id, data) => {
        if (!id) throw new Error("user id is required");
        if (!data || Object.keys(data).length === 0)
            throw new Error("at least one field required to update ");

        return await userModel.updateUser(id, data);
    },

    deleteUser: async (id) => {
        if (!id) throw new Error("user id is required");

        return await userModel.deleteUser(id);
    }
};

module.exports = { userService };
