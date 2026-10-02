const {pool}=require("../config/dp");

const loanmodeles={
    getAllLoans:async(userId)=>{
        const result=await pool.query("select * from loans where user_id=$1;",[userId])
        return result.rows;
    },
    getLoansById:async(id,userId)=>{
        const result=await pool.query("select * from loans where id=$1 and user_id=$2;",[id,userId]);
        return result.rows[0];
    },
    createLoans:async(user_id,book_id)=>{
        const result=await pool.query("insert into loans (user_id,book_id) values ($1,$2) RETURNING *",[user_id,book_id]);
        return result.rows[0];
    },
    updateLoans:async(id,userId,data)=>{
        const fields=[];
        const values=[];
        if(data.book_id !== undefined)
        {
            fields.push(`book_id=$${values.length+1}`);
            values.push(data.book_id);
        }
        if(fields.length===0)
            return null;

        values.push(id);
        values.push(userId);
        const query=`update loans set ${fields.join(", ")} where id=$${values.length-1} and user_id=$${values.length} RETURNING *;`;
        const result=await pool.query(query,values);
        return result.rows[0];
    },
    deleteLoans:async(id,userId)=>{
        const result=await pool.query(`delete from loans where id=$1 and user_id=$2 RETURNING *;`,[id,userId]);
        return result.rows[0];
    }
}

module.exports=loanmodeles;