const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { destinationSchema } = require('../schemas.js');
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

router.get('/new', (req, res) => {
    res.render('destinations/new');
})

router.post('/', validateDestination, catchAsync(async (req, res) => {
    // if (!req.body.destination) throw new ExpressError('Invalid Destination Data', 400);
    const destination = new Destination(req.body.destination);
    await destination.save();
    req.flash('success', 'Successfully made a new destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id).populate('reviews');
    // console.log(destination);
    res.render('destinations/show', { destination });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    res.render('destinations/edit', { destination });
}))

router.put('/:id', validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    res.redirect(`/destinations/${destination._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    res.redirect('/destinations');
}))

module.exports = router;