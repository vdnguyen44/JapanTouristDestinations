const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview } = require('../middleware');
const Destination = require('../models/destination');
const Review = require('../models/review');

const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');


router.post('/', validateReview, catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    const review = new Review(req.body.review);
    destination.reviews.push(review);
    await review.save();
    await destination.save();
    req.flash('success', 'New review created!');
    res.redirect(`/destinations/${destination._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review successfully deleted');
    res.redirect(`/destinations/${id}`);
}))

module.exports = router;