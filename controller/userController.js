const fs = require('fs');
const User = require("../models/userModel");
const catchAysnc = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require('./handlerFactory');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const filterObj =(obj,...allowedFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}



exports.createUser= (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}
exports.getAllUsers = factory.getAll(User);
exports.getUser  = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


exports.updateMe = catchAysnc(async (req,res,next)=>{
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('this route isnot for updating password',400));
    }

    //update user 
    const filteredBody = filterObj(req.body,'name','email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });


    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });
});

exports.deleteMe = catchAysnc(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(200).json({
        status:'success',
        data:null
    });
})
