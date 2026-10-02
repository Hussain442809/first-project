const {pool}=require('../config/dp');

const bookmodule={
    getAllbooks:async ()=>{
        const result=await pool.query(`select * from books ORDER BY id ASC;`);
        return result.rows;
    },
    getBookById:async(id)=>{
        const result=await pool.query("select * from books WHERE id=$1;",[id]);
        return result.rows[0];
    },
    createBook:async(title , author , pub)=>{
        const result =await pool.query(`insert into books (title,author,published_year) values ($1,$2,$3) RETURNING *;`,[title,author,pub]);
        return result.rows[0];
    },
    updateBook:async(id,data)=>{
        const fields=[];
        const values=[];

        if(data.title !== undefined)
        {
            fields.push(`title=$${values.length+1}`);
            values.push(data.title);
        }

        if(data.author !== undefined)
        {
            fields.push(`author=$${values.length+1}`);
            values.push(data.author);
        }

        if(data.published_year !== undefined)
        {
            fields.push(`published_year=$${values.length+1}`);
            values.push(data.published_year);
        }

        if(fields.length===0)
            return null;

        values.push(id);

        const queue=`UPDATE books SET ${fields.join(", ")} WHERE id=$${values.length} RETURNING *;`;
        const result=await pool.query(queue,values);
        return result.rows[0];
    },
    deleteBook:async(id)=>{
        const result = await pool.query(`delete from books where id=$1 RETURNING *;`,[id]);
        return result.rows[0];
    }

}

module.exports={bookmodule};