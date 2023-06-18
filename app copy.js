/* eslint-disable no-var */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-object-spread */
const express = require('express');

const fs = require('fs');

const app = express();
const morgan = require('morgan');

const tourRouter = express.Router();
const userRouter = express.Router();


// app.get('/',(req,res)=>{
//     //res.status(200).send('hello from server');
//     res
//     .status(200)
//     .json({mes:'tan',age:'23',motto:'fuck anushka'});
// });

// app.post('/',(req,res)=>{
//     res.send('you can post to this url');
// });



const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// 1)MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('HEllo from middle ware');
  next();
});

// TOUR HANDLERS
const getAllTours = (req,res)=>{
    res.status(200).json({
        status:'success',
        requestedAt:req.requestTime,
        data:{
            tours
        }
    });
}

const getTour = (req,res)=>{

    console.log(req.params);
    const id = req.params.id*1;
    const tour = tours.find(el=>el.id===id);

    if (id>tours.length) {
        res.status(404).json({
            status:'fail',
            message:'Invalid ID'
        });
    }

    res.status(200).json({
        status:'Success',
        data:{tour}
    })
}

const createTour = (req,res)=>{
    console.log(req.body);
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

const updateTour = (req,res)=>{
    const id = req.params.id*1;
    var newItem = req.body;
    // eslint-disable-next-line no-shadow
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

const deleteTour = (req,res)=>{
    if (req.params.id*1>tours.length) {
        return res.status(404).json({
            status:'fail',
            message:'Invalid ID'
        });
    }

    res.status(204).json({
        status:'success',
        data:null
    });
}
//TOUR ROUTES

// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getTour);
// app.post('/api/v1/tours',createTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour);
app.use('/api/v1/tours',tourRouter);

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);


//USER Handlers

const getAllUsers = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};

const createUser= (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};

const getUser  = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};

const updateUser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};

const deleteUser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    });
};
app.use('/api/v1/users',userRouter);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);
// app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);


userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
// SERVER
const port = 3000;
app.listen(port,()=>{
  console.log(`app is running on port ${port}............`);
});

