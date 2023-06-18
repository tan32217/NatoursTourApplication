const fs = require('fs');
const express = require('express');

const tourController = require("../controller/tourController");
const authController = require("../controller/authController");
const reviewController = require("../controller/reviewController");

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

//router.param('id',tourController.checkID);
router.use('/:tourId/reviews',reviewRouter);

router.route('/top-5-cheap').get(tourController.aliasTopTOur,tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(authController.protect,authController.restrictTo('admin','lead-guide','guide'), tourController.getMontlyPlan);

router.route('/').get(tourController.getAllTours).post(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.createTour);

router.route('/:id').get(tourController.getTour).patch(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.updateTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.deleteTour);

//router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview);
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getTourWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

module.exports=router;


