const {pool}=require("../config/dp");

const testmodel=
{
insertdata:async function(id,name)
{
    try{
        const sqlsen="insert into test (id,name) values ($1,$2) ;";
        const datasql=[id,name];
        const result=await pool.query(sqlsen,datasql);
        return result.rows[0];
    }
    catch(err){
        throw(err)
    }
},
modifydata:async function(id,name)
{
    try{
        const sqlsen="update test set name=$1 where id=$2 RETURNING *;";
        const datasql=[name,id];
        const result=await pool.query(sqlsen,datasql);
        return result.rows[0];
    }
    catch(err){throw(err)}
},
removedata:async function(id)
{
    try{
        const sqlsen="delete  from test where id=$1 RETURNING *;";
        const datasql=[id];
        const result=await pool.query(sqlsen,datasql);
        return result.rows[0];
    }
    catch(err){throw(err)}
}
}

module.exports={testmodel};