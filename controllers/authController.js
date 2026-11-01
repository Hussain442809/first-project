const { userService } = require("../business/userService");

const authController = {
    register:async(req,res)=>{
        try{
        const user= await userService.register(req.body);
        return res.status(201).json({message:"user registered seccefully",user});
        }
        catch(error)
        {
            const status= error.message === "email is already registered" ? 409 : 400 ;
            return res.status(status).json({message : error.message})
        }
    },

    login:async(req,res)=>{
        try {
            const result= await userService.login(req.body.email,req.body.password);
            return res.status(200).json(result);
        }

        catch(error)
        {
            const status = error.message === "invalid email or password" ? 401 : 500;
            return res.status(status).json({message : error.message})
        }
    }
};

module.exports = authController;
