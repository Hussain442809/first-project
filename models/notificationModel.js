const {pool} = require("../config/dp")
const { getUserById } = require("../controllers/userController")

const notificationModel={
    create :async(userId,book_title,book_author)=>{
        const result = await pool.query(`
            INSERT INTO notifications ( user_id,book_title,book_author) values ($1,$2,$3) RETURNIING *;`,[userId,book_title,book_author]);
            return result.rows[0];
    }
}