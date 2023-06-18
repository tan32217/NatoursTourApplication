/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

const validator = require('validator');

// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

const User = require('./userModel');

const toursSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have name'],
        unique:true,
        trim:true,
        maxLength:[40,'A tour name can be of max 40 chars'],
        minLength:[10,'A tour name should always be greater than 10 chars'],
       // validate: [ validator.isAlpha, 'tour name must only contain chars']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A tour must have duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'a tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'a tour must define its difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty can be easy, medium or difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1'],
        max:[5,'Rating must be below 5'],
        set: val=> Math.round(val*10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have price']
    },
    priceDiscount:{
        type: Number,
        validate: {
            // this only points to current document on NEW document creation
            validator:function(val) {
                return val < this.price;
            },
            message:'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        required:[true,'A tour must have description']
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour: {
        type:Boolean,
        default:false
    },
    startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    }],
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }]
},
{toJSON:{virtuals:true}});
toursSchema.index({startLocation:'2dsphere'});
toursSchema.index({price:1,ratingsAverage:-1});
toursSchema.index({slug:11});


toursSchema.virtual('durationWeeks').get(function() {
    return this.duration /7;
});

toursSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

toursSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lowe:true});
    next();
} );

//tour guides embedding
// toursSchema.pre('save', async function(next){
//     const guidePromises = this.guides.map(async id=> await User.findById(id));
//     this.guides = await Promise.all(guidePromises);
//     next();
// })

toursSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    next();
});

toursSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    });
    next();
});

// toursSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//     next();
// })
const Tour = mongoose.model('Tour',toursSchema);
module.exports = Tour;