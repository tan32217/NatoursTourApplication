/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-var */
/* eslint-disable prefer-object-spread */
const fs = require('fs');

const Tour = require('../models/tourModel');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const APIFeatures = require('../utils/apiFeatures');

//catch Async
const catchAysnc = require("../utils/catchAsync");
const AppError = require('../utils/appError');

//App Error

//Authentication controller
const authController = require("./authController");
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');


// TOUR HANDLERS

exports.aliasTopTOur = (req,res,next)=>{
    req.query.limit =5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,sumary,difficulty';
    next();
}


exports.getAllTours = factory.getAll(Tour);

exports.getTour =  factory.getOne(Tour,{path:'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.getTourStats = async (req,res) => {
    try{
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group: {
                    _id:{$toUpper:'$difficulty'},
                    num:{$sum:1},
                    numRating:{$sum:'$ratingsAverage'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'},
                }
            },
            {
                $sort:{avgPrice:1}
            }
        ]);
        res.status(200).json({
            status:'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        }); 
    }
}

exports.getMontlyPlan = async (req,res)=>{
    try {

        const year = req.params.year*1;

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDate'
        
            },
            {
                $match:{
                    startDate:{
                        $gte: `${year}-01-01`,
                        $lte: `${year}-12-31`,
                    }
                }
            },
            {
                $group:{
                    _id:{ $month:{ $toDate: '$startDate' }  },
                    numTourStarts:{ $sum:1 },
                    tours:{$push:'$name'}
                }    
            },{
                $addFields:{month:'$_id,'}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort: {numTourStarts:-1
                }
            }
            // {
            //     $limit:6
            // }
            
            
        ]);


        res.status(200).json({
            status:'success',
            data: {
                plan
            }
        });
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        }); 
    }
};

exports.getTourWithin= catchAsync(async (req,res,next)=>{
    const {distance,latlng,unit} = req.params;
    const [lat,lng] =latlng.split(',');
   
    console.log("lat",lat);
    console.log("distance",distance)
    if(!lat || !lng) {
        next(new AppError('please provide latitude and longitude in format lat,lng',400))
    };
    const radius = unit==='mi'?distance/3963.2 : distance/6378.1

    const tours = await Tour.find({
        startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    });

    res.status(200).json({
        status:'sucess',
        data:{
            tours
        }
    });
});

exports.getDistances = catchAsync(async (req,res,next)=>{
    const {latlng,unit} = req.params;
    const [lat,lng] =latlng.split(',');

    const multiplier = unit==='mi'? 0.000621371 : 0.001
    if(!lat || !lng) {
        next(new AppError('please provide latitude and longitude in format lat,lng',400))
    };

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier:multiplier
            }
        },{
                $project:{
                    name:1,
                    distance:1
                }
            }
        
    ]);
    res.status(200).json({
        status:'success',
        data:{
            distances
        }
    });

})

