//  DEPENDENCIES
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const travelRoutes = require('./routes/travelRoutes');
const { firebaseAuth, isAuthenticated } = require('./middlewares/auth');
const fetch = require('node-fetch');


// Initalize the express app
const app = express();

const corsOptions = {
    origin: 'https://worldtraveler.onrender.com', // or a list of valid origins
    optionsSuccessStatus: 200
};

// configuring server settings
require("dotenv").config();

const { MONGODB_URL, PORT, GOOGLE_CREDENTIALS } = process.env;

if (!MONGODB_URL || !PORT || !GOOGLE_CREDENTIALS) {
    throw new Error('Missing critical environment variables.');
}

const serviceAccount = JSON.parse(GOOGLE_CREDENTIALS);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


// connect to mongoDB
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// set up our mongoDB event listeners
const db = mongoose.connection;
db
    .on("connected", () => console.log("Connected to MongoDB"))
    .on("disconnected", () => console.log("Disconnected from MongoDB"))
    .on("error", (err) => console.log("MongoDB Error: " + err.message));

// mount middleware
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());


app.get('/api/unsplash/random', async (req, res) => {
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=vacation,beach,tropical,paradise&count=5&client_id=${process.env.ACCESS_KEY}`;
    
    try {
        const response = await fetch(unsplashUrl, {
            method: 'GET',
            headers: {
                'Accept-Version': 'v1',
                'Authorization': `Client-ID ${process.env.ACCESS_KEY}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        res.status(500).json({ error: 'Failed to fetch from Unsplash' });
    }
});

app.use(firebaseAuth);
app.use(isAuthenticated);

app.use(travelRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// tell the app to listen
app.listen(PORT, () => {
    console.log(`Express is istening on port: ${PORT}`);
});
