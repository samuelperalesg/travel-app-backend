const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
    name: String,
    image: String,
    notes: String,
    uid: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('Travel', travelSchema);
