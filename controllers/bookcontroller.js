const { bookmodule } = require("../models/bookmodeles");

const bookController = {
    getWelcome: async (req, res) => {
        res.status(200).json({ message: "welcome in books managmect API" });
    },

    getAllbooks: async (req, res) => {
        try {
            const books = await bookmodule.getAllbooks();
            return res.status(200).json(books);
        } catch (error) {
            return res.status(500).json({ message: "failed to get books", error: error.message });
        }
    },

    getbookbyid: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await bookmodule.getBookById(id);

            if (!book) {
                return res.status(404).json({ message: "books not found" });
            }

            return res.status(200).json(book);
        } catch (error) {
            return res.status(500).json({ message: "failed to get book", error: error.message });
        }
    },

    createBook: async (req, res) => {
        try {
            const { title, author, published_year } = req.body;
            const newBook = await bookmodule.createBook(title, author, published_year);
            return res.status(201).json({ message: "book created successfully", book: newBook });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    updateBook: async (req, res) => {
        try {
            const { id } = req.params;
            const upBook = await bookmodule.updateBook(id, req.body);

            if (!upBook) {
                return res.status(404).json({ message: "book not found" });
            }

            return res.status(200).json({ message: "book updated successfully", book: upBook });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    deletebook: async (req, res) => {
        try {
            const { id } = req.params;
            const delBook = await bookmodule.deleteBook(id);

            if (!delBook) {
                return res.status(404).json({ message: "no book to delete" });
            }

            return res.status(200).json({ message: "succeeful deleting", book: delBook });
        } catch (error) {
            return res.status(500).json({ message: "failed to delete book", error: error.message });
        }
    }
};

module.exports = { bookController };