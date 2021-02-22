const express = require('express');
const router = express.Router();
const destinations = require('../controllers/destinations');
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, isAuthor, validateDestination } = require('../middleware');

const Destination = require('../models/destination');


router.get('/', catchAsync(destinations.index));

router.get('/new', isLoggedIn, destinations.renderNewForm);

router.post('/', isLoggedIn, validateDestination, catchAsync(destinations.createDestination));

router.get('/:id', catchAsync(destinations.showDestination));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(destinations.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, validateDestination, catchAsync(destinations.updateDestination));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(destinations.deleteDestination));

module.exports = router;