const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Destination = require('../models/destination');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;