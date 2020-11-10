const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    photo: {
        type: String,
        required: true
    },
    categories: [{
        type: String,
        required: true
    }],
    representation: [{
        word: {
            type: String,
            require: true
        },
        allocation: {
            type: String,
            required: true
        }
    }],
    styleRepresentation: [{
        word: {
            type: String,
            required: true
        },
        allocation: {
            type: String,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

const Photo = mongoose.model('Photo', photoSchema);
module.exports = Photo;