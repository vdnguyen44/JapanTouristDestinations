const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, isAuthor, validateDestination } = require('../middleware');

const Destination = require('../models/destination');



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
    destination.author = req.user._id;
    await destination.save();
    req.flash('success', 'Successfully made a new destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id).populate({
        path: 'reviews',
        populate:
        {
            path: 'author'
        }
    }).populate('author');
    console.log(destination);
    if (!destination) {
        req.flash('error', 'Cannot find destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/show', { destination });
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        req.flash('error', 'Cannot find destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/edit', { destination });
}))

router.put('/:id', isLoggedIn, isAuthor, validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    req.flash('success', 'Successfully updated destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success', 'Destination successfully deleted');
    res.redirect('/destinations');
}))

module.exports = router;