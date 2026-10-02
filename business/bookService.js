const { bookmodule } = require("../models/bookmodeles");

const bookService = {
    getAllbooks: async () => {
        return await bookmodule.getAllbooks();
    },

    getBookById: async (id) => {
        if (!id) throw new Error("book id is required");
        return await bookmodule.getBookById(id);
    },

    createBook: async (data = {}) => {
        const { title, author, published_year } = data;

        if (!title || !author || !published_year) {
            throw new Error("title, author and published year are required");
        }

        return await bookmodule.createBook(title, author, published_year);
    },

    updateBook: async (id, data) => {
        if (!id) throw new Error("book id is required");
        if (!data || Object.keys(data).length === 0) {
            throw new Error("At least one field is required to update");
        }

        return await bookmodule.updateBook(id, data);
    },

    deleteBook: async (id) => {
        if (!id) throw new Error("book id is required");
        return await bookmodule.deleteBook(id);
    }
};

module.exports = { bookService };