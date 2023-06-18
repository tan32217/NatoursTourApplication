const fs = require('fs');
const express = require('express');

const viewController = require('../controller/viewController')

const router = express.Router();

router.get('/',viewController.getOverview);
router.get('/tour/:slug',viewController.getTour);


// router.get('/tour',(req,res)=>{
//     res.status(200).render('tour',{
//         title:'sikkim'
//     });
// })

module.exports=router;