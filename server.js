const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path:'./config.env'});
const app = require('./app');

const DB = process.env.DATABASE;


mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    //console.log(con.connections);
    console.log('db connection successful');
});

const Tour = require('./models/tourModel');

process.on('uncaughtException',err=>{
    process.exit(1);
})
// const testTour = new Tour({
//     name:'himachal pradesh',
//     price:600
// });

// testTour.save().then(doc=>{
//     console.log(doc);
// }).catch(err=>{
//     console.log(err);
// });

const port = process.env.PORT ||3000;//3000;
//console.log(process.env);
const server = app.listen(port,()=>{
    console.log(`app is running on port ${port}............`);
});

process.on('unhandledRejection',err=>{
    server.close(()=>{
        process.exit(1);
    })
})
