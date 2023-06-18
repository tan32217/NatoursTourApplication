/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const morgan = require('morgan');

const path=require('path');


const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//serving static files
app.use(express.static(path.join(__dirname,'public')));
// APP Error Class used
const AppError = require('./utils/appError');

//Error Controller
const globalerrorHandler = require('./controller/errorController');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// 1)MIDDLEWARE

//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// set security http headers
app.use(helmet());


//limit no of requets made
const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'too many requests from one IP, please try again in an hour'
});

app.use('/api',limiter);

//body parser, ready data from body to req.body
app.use(express.json({limit:'10kb'}));

// data sanitization against no sql query injections
app.use(mongoSanitize());

// data sanitization XSS
app.use(xss());


//parameter pollution
app.use(hpp());

// app.get('/',(req,res)=>{
//     res.status(200).render('base',{
//         tour:'the forest hiker',
//         user:'Tanishq'
//     });
// })
// app.get('/overview',(req,res)=>{
//     res.status(200).render('overview',{
//         title:'All Tours'
//     });
// })

// app.get('/tour',(req,res)=>{
//     res.status(200).render('tour',{
//         title:'sikkim'
//     });
// })

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const viewRouter = require('./routes/viewRoutes');

//ROUTES

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/',viewRouter);
//handling unhandled routes
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Cannot find ${req.originalUrl} on this server!!!`
    // });

    // const err = new Error(`Cannot find ${req.originalUrl} on this server!!!`);
    // err.status = 'fail';
    // err.statusCode =404;
    // next(err);

    next(new AppError(`Cannot find ${req.originalUrl} on this server!!!`,404));
});


app.use(globalerrorHandler);

//USER Handlers

// SERVER

module.exports = app;

