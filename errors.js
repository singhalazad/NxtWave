const ErrorHandler = require('../utils/ErrorHandler');

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }
    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}
        error.message = err.message

        //Wrong mongoose object ID Error
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message, 400)
        }
        //Handling wrong JWT error
        if(err.name === 'JsonWebTokenError'){
            const message = `JSON Web Token is invalid. Check it and try again!`;
            error = new ErrorHandler(message, 400)
        }
        //Handling Expired JWT error
        if(err.name === 'TokenExpiredError'){
            const message = `JSON Web Token is expired. Check it and try again!`;
            error = new ErrorHandler(message, 400)
        }        
        //Handling mongoose validation errors
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400)
        }
        //Handling Mongoonse duplicate key errors
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message, 400)
        }
        if(err.name === 'JsonWebTokenError'){
            const message = `JsonWebToken is invalid`
            error = new ErrorHandler(message, 400)
        }
        if(err.name === 'TokenExpiredError'){
            const message = `JsonWebToken is expired`
            error = new ErrorHandler(message, 400)
        }
        res.status(error.statusCode).json({
            success:false,
            message: error.message || 'Internal Error'
        })
    }
}