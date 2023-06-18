const dotenv = require('dotenv');
const mongoose = require('mongoose');

const fs = require('fs');

dotenv.config({path:'./config.env'});


const DB = process.env.DATABASE;
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    console.log('db connection successful');
});


const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));
// Import data into Database

const importData = async () =>{
    try {
       //await Tour.create(tours);
       //await User.create(users, {validateBeforeSave:false});
       await Review.create(reviews,{validateBeforeSave:false});
        console.log('data successfully loaded');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

const deleteData = async()=>{
    try {
       // await Tour.deleteMany();
        //await User.deleteMany();
        await Review.deleteMany();
        console.log('data successfully deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2]==='--import') {
    importData()
} else if (process.argv[2]==='--delete') {
    console.log(process.argv[2]);
    deleteData();
}