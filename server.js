const express = require("express");
const cors = require("cors");
const db = require("./config/dp");
const userController = require("./controllers/userController");
const authController = require("./controllers/authController");
const { bookController } = require("./controllers/bookcontroller");
const loanController = require("./controllers/loancontroller");
const { authenticate } = require("./middleware/auth");
const { validateUser, validateBook, validateId } = require("./middleware/validation");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/auth/register", authController.register);
app.post("/auth/login", authController.login);

app.get("/", userController.getWelcome);
app.get("/users", userController.getUsers);
app.get("/users/:id", validateId, userController.getUserById);
app.post("/users", validateUser, userController.createUser);
app.put("/users/:id", validateId, userController.updateUser);
app.delete("/users/:id", validateId, userController.deleteUser);

app.get("/books", bookController.getAllbooks);
app.get("/books/:id", validateId, bookController.getbookbyid);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateId, bookController.updateBook);
app.delete("/books/:id", validateId, bookController.deletebook);

app.get("/loans", authenticate, loanController.getAllLoans);
app.get("/loans/:id", authenticate, loanController.getloanByid);
app.post("/loans", authenticate, loanController.createLoans);
app.put("/loans/:id", authenticate, loanController.updateLoans);
app.delete("/loans/:id", authenticate, loanController.deleteloan);

app.use(errorHandler);

const startServer = async () => {
    try {
        await db.pool.connect();
        
        console.log("Connected to PostgreSQL successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1);
    }
};

startServer();