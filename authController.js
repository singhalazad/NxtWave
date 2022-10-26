const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken.js');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//Register a new user => api/v1/register
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name, email, password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: 'check_id',
            url: 'check_url'
        } 
    })
    

    sendToken(user, 200, res);

})

//Login User => /api/v1/login
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email, password} = req.body;             //destructuring in js
    //check if email and pass entered by User
    if(!email || !password)
    {
        return next(new ErrorHandler("Please enter email or password", 400))
    }

    //finding user in database
    const user = await User.findOne({email}).select('+password')
    console.log(user);
    if(!user){
        return next(new Errorhandler('Invalid Email or password',401))
    }
    // checks if passowrd is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or password",401));
    }
    

    sendToken(user, 200, res);

})

//Logout user => /api/v1/logout =>
exports.logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'User logged out'
    })
})

//Forgot password => api/v1/password/forget
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({ email : req.body.email});
    if(!user){
        return next(new ErrorHandler('User not found with this email address', 404));
    }

    //Get reset Token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave : false});
    
    //Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/passord/reset/${resetToken}`;

    const message = `Your reset password is ${resetUrl}`;

    try{
        await sendEmail({
            email: user.email,
            subject : 'ShopIT password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to : ${user.email}`
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave : false});
        return next(new ErrorHandler(error.message,500))
    }
})

//Reset password => api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    //Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Pasword reset token is invalid or has been expired',400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }

    //Setup new Password
    user.password = req.body.password;
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

//Get currently logged in user => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    
    if(!user){
        return next(new ErrorHandler('User does not exist'))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//Update password by user => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');

    //comparing password by bcrypt from model user
    const isMatched = await user.comparePassword(req.body.oldPassword);

    if(!isMatched){
        return next(new ErrorHandler('Invalid password combination',400));
    }

    //assigning new password from the body after comparing old password
    user.password = req.body.password;
    
    //updating new password in the user instance created
    await user.save();
    
    sendToken(user,200,res);

})

// Update user profile   =>   /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})


//Admin Routes
//Get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async(req,res,next)=>{
    //.find() can return multiple entries
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })
})

//Get specific user using id => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler('User does not exist',400));
    }

    res.status(200).json({
        success:true,
        user
    })
})

//Admin- update user profile => /api/v1/admin/:id
exports.updateUser = catchAsyncErrors(async(req,res,next)=>{
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email, 
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    
    res.status(200).json({
        success: true,
        user
    })
})

//Admin- delete user profile => /api/v1/admin/:id
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User does not exist',400));
    }
    await user.remove();
    
    res.status(200).json({
        success: true,
        message:"User deleted successfully"
    })
})