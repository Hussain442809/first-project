const {testmodel}=require("../models/testmodeles");
const dataController={
    getWelcome:function(req,res)
    {
        res.status(200).send("Welcome");
    },
    senddata:function(req,res)
    {
        const name=req.body.text;
        const id =req.body.number;

        testmodel.insertdata(id,name).then(function(){
            res.status(200).send("inserting succefull");
        }).catch(function(err)
    {
        console.error("the error is :"+err);
        res.status(500).send("the server is not running");
    })
    },
    updatedata: function(req, res) {
        const id = req.body.number;
        const name = req.body.text;

        testmodel.modifydata(id, name)
            .then(function(updatedRow) {
                if (!updatedRow) {
                    return res.status(404).send("no record found to update");
                }
                res.status(200).send("updating successful");
            })
            .catch(function(err) {
                console.error(`the error is ${err}`);
                res.status(500).send("the server is not running");
            });
    },
    deletedata:function(req,res)
    {
        const id=req.body.number;

        testmodel.removedata(id).then(function(updatedRow)
    {
        if (!updatedRow)
        {                    return res.status(404).send("no record found to delete"); }
        res.status(200).send("deleting succefully");
    }).catch(function(err)
{
    console.error("the error is:"+err);
    res.status(500).send("the server is not runnong");
})
    }
};

module.exports = dataController;
