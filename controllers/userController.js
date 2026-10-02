const { userService } = require("../business/userService");

const userController = {
    getWelcome: (req, res) => {
        res.status(200).json({
            message: "Welcome to the User Management API"
        });
    },

    getUsers: async (req, res) => {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({
                message: "Failed to get users",
                error: error.message
            });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);

            if (!user) {
                return res.status(404).json({ message: "user not found" });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({
                message: "failed to get user",
                error: error.message
            });
        }
    },

    createUser: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const newUser = await userService.register({ name, email, password });
            return res.status(201).json({
                message: "user created succefully",
                user: newUser
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedUser = await userService.updateUser(id, req.body);

            if (!updatedUser) {
                return res.status(404).json({ message: "user not found" });
            }

            return res.status(200).json({
                message: "user updated succesfully",
                user: updatedUser
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedUser = await userService.deleteUser(id);

            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                message: "User deleted successfully",
                user: deletedUser
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to delete user",
                error: error.message
            });
        }
    }
};

module.exports = userController;