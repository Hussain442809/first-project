const isNonEmptyString=(value)=>{
    typeof(value)==="string" && value.trim().length >0;
}

const validateUser=(req,res,next)=>{
    const {name , email}= req.body || {};

    if(!isNonEmptyString(name) || !isNonEmptyString(email))
    {
        return res.status(400).json({
            success:false,
            message:"name and email are required"
        });
    }

    if(!email.includes("@"))
    {
        return res.status(400).json({
            success:false ,
            message:"@ is required for email"
        });
    }
    next();
};

const validateBook=(req,res,next)=>{
    const {title,author,published_year}= req.body || {};
    if(!isNonEmptyString(title) || !isNonEmptyString(author))
    {
        return res.status(400).json({
            success:false,
            message:"title and author are reuiquired"
        });
    }

    if(!Number.isInteger(Number(published_year)))
    {return res.status(400).json({
        success:false,
        message:"published year must be integer"
    });
}

next();
};

const validateId = (req, res, next) => {
    if (!Number.isInteger(Number(req.params.id)) || Number(req.params.id) < 1) {
        return res.status(400).json({
            success: false,
            message: "id must be a positive integer"
        });
    }

    next();
};

module.exports = { validateUser, validateBook, validateId };