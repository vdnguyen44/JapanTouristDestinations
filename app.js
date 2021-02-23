if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import express module and create express application. Object app has methods for routing HTTP requests, configuring middleware, etc.
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const destinationRoutes = require('./routes/destinations');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// minimum needed to connect japan-travel-destinations db running locally to default port 27017
mongoose.connect('mongodb://localhost:27017/japan-travel-destinations',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
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

// anything inside 'use' runs, parses request body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/destinations', destinationRoutes);
app.use('/destinations/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// route definition
app.get('/', (req, res) => {
    res.render('home')
})

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