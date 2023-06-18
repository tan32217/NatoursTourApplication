/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name']
    },
    email:{
        type:String,
        required:[true,'Please tell us your email'],
        unique:true,
        lowercase:true,
        validate: [ validator.isEmail, 'enter valid email address']
    },
    photo:{
        type:String
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm password'],
        validate:{
            validator:function(el){
                return el===this.password;
            }
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next){
    //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // hash pasworss and delete passwordconfirm field
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
  userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
  });

userSchema.methods.correctPassword= async function(cpass,upass) {
    return await bcrypt.compare(cpass,upass);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if(this.passwordChangedAt) {
        console.log(this.passwordChangedAt,JWTTimeStamp);
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

        return JWTTimeStamp<changedTimeStamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken},this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10*60*1000;
    console.log("reset token1",resetToken);
    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;