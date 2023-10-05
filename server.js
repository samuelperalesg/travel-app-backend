//  DEPENDENCIES
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const travelRoutes = require('./routes/travelRoutes');
const { firebaseAuth, isAuthenticated } = require('./middlewares/auth');


// Initalize the express app
const app = express();

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
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000' // Allow only this origin
}));

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
