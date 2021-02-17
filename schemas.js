const Joi = require('joi');
// not a mongoose schema
module.exports.destinationSchema = Joi.object({
    destination: Joi.object({
        title: Joi.string().required(),
        admissionfee: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});