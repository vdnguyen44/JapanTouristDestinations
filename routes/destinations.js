const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { destinationSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utilities/ExpressError');
const Destination = require('../models/destination');

const validateDestination = (req, res, next) => {
    const { error } = destinationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const destinations = await Destination.find({});
    res.render('destinations/index', { destinations })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('destinations/new');
})

router.post('/', isLoggedIn, validateDestination, catchAsync(async (req, res) => {
    // if (!req.body.destination) throw new ExpressError('Invalid Destination Data', 400);
    const destination = new Destination(req.body.destination);
    await destination.save();
    req.flash('success', 'Successfully made a new destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id).populate('reviews');
    if (!destination) {
        req.flash('error', 'Cannot find destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/show', { destination });
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        req.flash('error', 'Cannot find destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/edit', { destination });
}))

router.put('/:id', isLoggedIn, validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    req.flash('success', 'Successfully updated destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success', 'Destination successfully deleted');
    res.redirect('/destinations');
}))

module.exports = router;