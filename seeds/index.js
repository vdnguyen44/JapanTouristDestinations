const mongoose = require('mongoose');
const destinations = require('./places');
const { places, descriptors } = require('./seedHelpers');
const Destination = require('../models/destination');

mongoose.connect('mongodb://localhost:27017/japan-travel-destinations', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//create array sample
const sample = array => array[Math.floor(Math.random() * array.length)];

// Delete contents of database, create 50 destinations ith random locations and titles
const seedDB = async () => {
    await Destination.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random16 = Math.floor(Math.random() * 16);
        const admissionfee = Math.floor(Math.random() * 2000) + 1000;
        const site = new Destination({
            author: '6030ce331c53dc2d50443d8d',
            location: `${destinations[random16].city}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/10458133',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat nisi delectus nostrum rem quasi, id iusto, asperiores eligendi reprehenderit ut minus enim ipsa officia consectetur nihil non quo autem dolor. Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat nisi delectus nostrum rem quasi, id iusto, asperiores eligendi reprehenderit ut minus enim ipsa officia consectetur nihil non quo autem dolor.',
            admissionfee
        })
        await site.save();
    }

}

// close database connection
seedDB().then(() => {
    mongoose.connection.close();
})