/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-var */
/* eslint-disable prefer-object-spread */
const fs = require('fs');

const Tour = require('../models/tourModel');

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));



// TOUR HANDLERS

exports.aliasTopTOur = (req,res,next)=>{
    req.query.limit =5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,sumary,difficulty';
    next();
}


exports.getAllTours = async (req,res)=>{
    console.log(req.query);
    try {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        const queryObj = {...req.query};

        //filtering
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach(el=> delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|dt|lt|lte)\b/g,match=>`$${match}`);
        console.log(JSON.parse(queryStr));

        
        let query = Tour.find(JSON.parse(queryStr));

        

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else {
            query = query.sort('-createdAt');
        }

        // Field Limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        //pagination
        const page = req.query.page *1 || 1;
        const limit = req.query.limit*1 || 100;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip>=numTours) throw new Error('This page does not exists');
        }

    
        const tours = await query;


       
        res.status(200).json({
            status:'success',
            data:{
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        });
    }
  
};

exports.getTour = async (req,res)=>{
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        });
    }

}

exports.createTour = async (req,res)=>{
    try{ const newTour = await Tour.create(req.body);
        res.status(200).json({
            status:'success',
            requestedAt:req.requestTime,
            data:newTour
        });
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        })
    }
   
}

exports.updateTour = async (req,res)=>{
    try {
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{new:true});

    res.status(200).json({
        status:'success',
        data: {
            tour
        }
    });
   } catch (err) {
    res.status(404).json({
        status:'fail',
        message:err
    })
   }
    // res.status(200).json({
    //     status:'Success',
    //     data:newItem
    // });

}

exports.deleteTour = async (req,res)=>{
   
    try {
       // const tour = await Tour.deleteOne({_id:req.params.id}) 
        const tour = await Tour.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:'success',
            data: {
                tour
            }
        });
       } catch (err) {
        res.status(404).json({
            status:'fail',
            message:err
        })
       }
}

