const loanModel = require("../models/loanmodeles");

const loanService = {
    getAllLoans: async (userId) => {
        return await loanModel.getAllLoans(userId);
    },

    getLoanById: async (id, userId) => {
        if (!id) throw new Error("loan id is required");
        return await loanModel.getLoansById(id, userId);
    },

    createLoan: async (userId, data = {}) => {
        const { book_id } = data;

        if (!userId || !book_id) {
            throw new Error("user and book_id are required");
        }

        return await loanModel.createLoans(userId, book_id);
    },

    updateLoan: async (id, userId, data) => {
        if (!id) throw new Error("loan id is required");
        if (!data || Object.keys(data).length === 0) {
            throw new Error("At least one field is required to update");
        }

        return await loanModel.updateLoans(id, userId, data);
    },

    deleteLoan: async (id, userId) => {
        if (!id) throw new Error("loan id is required");
        return await loanModel.deleteLoans(id, userId);
    }
};

module.exports = { loanService };