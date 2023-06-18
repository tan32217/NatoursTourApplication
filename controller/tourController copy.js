/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-var */
/* eslint-disable prefer-object-spread */
const fs = require('fs');

const Tour = require('../models/tourModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// TOUR HANDLERS
exports.checkID = (req,res,next,val)=> {
    console.log('param middleware');
    if (req.params.id*1>tours.length) {
        return res.status(404).json({
            status:'fail',
            message:'Invalid ID'
        });
    }
    next();
};

exports.checkBody = (req,res,next)=>{
    console.log('checking body of post method');
    const newItem = req.body;
    console.log(newItem);
    if (!newItem.name || !newItem.price) {
        return res.status(404).json({
            status:'fail',
            message:'Name key or price key not present in the JSOn'
        });
    }
    next();
};

exports.getAllTours = (req,res)=>{
    res.status(200).json({
        status:'success',
        requestedAt:req.requestTime,
        data:{
            tours
        }
    });
};

exports.getTour = (req,res)=>{

    console.log(req.params);
    const id = req.params.id*1;
    const tour = tours.find(el=>el.id===id);

    res.status(200).json({
        status:'Success',
        data:{tour}
    })
}

exports.createTour = (req,res)=>{
    const newId = tours[tours.length-1].id +1;
    const newTour = Object.assign({id:newId},req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        });
    });
    //res.send("done");
}

exports.updateTour = (req,res)=>{
    const id = req.params.id*1;
    var newItem = req.body;
    var updateTour;
    tours.forEach(function(item) {
    if (id === item.id) {
        item.name = newItem.name;
        item.duration = newItem.duration;
        item.difficulty = newItem.difficulty;
        updateTour = item;
    }
    });
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        res.status(200).json({
            status:'success',
            data:{
                tour:updateTour
            }
        });
    });
    console.log(updateTour);
    // res.status(200).json({
    //     status:'Success',
    //     data:newItem
    // });

}

exports.deleteTour = (req,res)=>{
    

    res.status(204).json({
        status:'success',
        data:null
    });
}

