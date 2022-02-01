//  DEPENDENCIES
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

// Initalize the express app
const app = express();

// configuring server settings
require('dotenv').config();

// expose our config variables
const { MONGODB_URL, PORT = 4000} = process.env;

// connect to mongoDB
mongoose.connect(MONGODB_URL);

// set up our mongoDB event listeners
const db = mongoose.connection;

db
.on('connected', () => console.log('Connected to MongoDB'))
.on('disconnected', () => console.log('Disconnected from MongoDB'))
.on('error', (err) => console.log('MongoDB Error: ' + err.message))

// Model
const travelSchema = new mongoose.Schema({
    name: String,
    image: String,
    notes: String
}, { timestamps: true });

const Travel = mongoose.model('Travel', travelSchema);

// mount middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// routes
app.get('/', (req, res) => {
    res.send('Vacation Planner');
})

// index route
app.get('/locations', async (req, res) => {
    try {
        res.json(await Travel.find({}));
    } catch (error) {
        res.status(400).json(error)
    }
});

// create route
app.post('/locations', async (req, res) => {
    try {
        res.json(await Travel.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});

// tell the app to listen
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});