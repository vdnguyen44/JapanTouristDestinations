const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const DestinationSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    admissionfee: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

DestinationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//Turns schema into model, a model is a class with which we construct documents, every document will be a destination with the specified properties
module.exports = mongoose.model('Destination', DestinationSchema);