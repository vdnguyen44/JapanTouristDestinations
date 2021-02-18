const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DestinationSchema = new Schema({
    title: String,
    image: String,
    admissionfee: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//Turns schema into model, a model is a class with which we construct documents, every document will be a destination with the specified properties
module.exports = mongoose.model('Destination', DestinationSchema);