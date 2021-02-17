// Import express module and create express application. Object app has methods for routing HTTP requests, configuring middleware, etc.
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { destinationSchema } = require('./schemas.js');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const Destination = require('./models/destination');

// minimum needed to connect japan-travel-destinations db running locally to default port 27017
mongoose.connect('mongodb://localhost:27017/japan-travel-destinations',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });

// Lets us know if the connection is successful or failed
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// establishing Express app object that corresponds to HTTP methods
/* These routing methods specify a callback function (sometimes called “handler functions”) called when the application receives a request to the specified route (endpoint) and HTTP method. In other words, the application “listens” for requests that match the specified route(s) and method(s), and when it detects a match, it calls the specified callback function. */
const app = express();

app.engine('ejs', ejsMate);

// Render template files

// set template engine to use
app.set('view engine', 'ejs');
// set directory where templates are located
app.set('views', path.join(__dirname, 'views'));

// anything inside 'use' runs
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateDestination = (req, res, next) => {
    const { error } = destinationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// route definition
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/destinations', catchAsync(async (req, res) => {
    const destinations = await Destination.find({});
    res.render('destinations/index', { destinations })
}))

app.get('/destinations/new', (req, res) => {
    res.render('destinations/new');
})

app.post('/destinations', validateDestination, catchAsync(async (req, res) => {
    // if (!req.body.destination) throw new ExpressError('Invalid Destination Data', 400);
    const destination = new Destination(req.body.destination);
    await destination.save();
    res.redirect(`/destinations/${destination._id}`)
}))

app.get('/destinations/:id', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    res.render('destinations/show', { destination });
}))

app.get('/destinations/:id/edit', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    res.render('destinations/edit', { destination });
}))

app.put('/destinations/:id', validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    res.redirect(`/destinations/${destination._id}`)
}))

app.delete('/destinations/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    res.redirect('/destinations');
}))

// * = every path, only runs if no other route is matched first
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// destructure statusCode and message from error passed in
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})