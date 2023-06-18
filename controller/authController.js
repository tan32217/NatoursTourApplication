// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const crypto = require('crypto');

const User = require("../models/userModel");
const catchAysnc = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const sendEmail =require("../utils/email");



// eslint-disable-next-line arrow-body-style
const signToken = id=> {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
};

const createSendToken =(user,statusCode,res)=>{
    const token =signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
        httpOnly:true
    };

    if (process.env.NODE_ENV==='production') cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

exports.signup =  catchAysnc( async (req,res,next) =>{

    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        role:req.body.role,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
    });
    createSendToken(newUser,201,res);

});

exports.login =catchAysnc( async (req,res,next)=>{
const {email,password} = req.body;
    //1. check email and password exists
    if (!email || !password) {
        return next(new AppError('provide email and password',400));
    }

    //2. check if email and password are correct
    const user = await User.findOne({email}).select('+password');
    //const correct = user.correctPassword(password,user.password);
    console.log("user",password);
    if (!user || !await user.correctPassword(password,user.password)) {
        console.log("db password",user.password);
        return next(new AppError('incorrect email or password',401));
    }

    //3. if everything is okay send token to user
    createSendToken(user,200,res);

});

exports.protect = catchAysnc ( async (req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('you are not logged in, please login to get access',400))
    }
    //Verify Token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('the user belonging to this token no longer exsists',401));
    }
    //check if if user changed password after token is issued
    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password, Please Login again',401));
    }
    // grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => (req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return next(new AppError('you do not have permission to perform this action',403));
    }
    next();
    };

exports.forgotPassword = catchAysnc(async (req,res,next)=>{

    //get user based on posted mail
    const user = await User.findOne({email:req.body.email});

    if (!user) {
        return next(new AppError('there is no user with this email address',404))
    }

    //generate random reset token
    const resetToken = user.createPasswordResetToken();
    console.log("reset token 2",resetToken);
    await user.save({ validateBeforeSave: false });

    //3 send link to user to reset password
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? \n 
    Please submit a Patch request with password and password confrim to url:${resetUrl} \n
    Please Ignore email if you know your password`;
    try {
        await sendEmail({
            email:user.email,
            subject:'your password reset token for natours account',
            message
        });

        res.status(200).json({
            status:'success',
            message:'token sent to email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there was an error sending email',500));
    }

});


exports.resetPassword = catchAysnc(async (req,res,next)=>{
    //1. get user based on token then convert to hash to compare it with value in DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gte:Date.now()}});

    //2. if token has not expired and there is new user then set new password

    if(!user){
        return next(new AppError('token is invalid or has expired',400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave:false});
    createSendToken(user,201,res);

});


exports.updatePassword = catchAysnc( async (req,res,next)=>{
    //1 get user from collection
    
    const user = await User.findById(req.user._id).select('+password');

    //2check if posted password is correct
   
    if (!(await user.correctPassword(req.body.passwordCurrent,user.password)) ) {
        return next(new AppError('passowrd is incorrect',400));
    }

    //3if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();


    //4log in user send jwt
    createSendToken(user,201,res);

})