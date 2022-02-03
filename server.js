//  DEPENDENCIES
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");

// Initalize the express app
const app = express();

// configuring server settings
require("dotenv").config();

// expose our config variables
const { MONGODB_URL, PORT = 4000, GOOGLE_CREDENTIALS } = process.env;

const serviceAccount = JSON.parse(GOOGLE_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// connect to mongoDB
mongoose.connect(MONGODB_URL);

// set up our mongoDB event listeners
const db = mongoose.connection;

db
    .on("connected", () => console.log("Connected to MongoDB"))
    .on("disconnected", () => console.log("Disconnected from MongoDB"))
    .on("error", (err) => console.log("MongoDB Error: " + err.message));

// Model
const travelSchema = new mongoose.Schema(
    {
        name: String,
        image: String,
        notes: String,
        uid: String
    },
    {
        timestamps: true,
    }
);

const Travel = mongoose.model("Travel", travelSchema);

// mount middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use(async function (req, res, next) {
    try {
        const token = req.get("Authorization");
        if (!token) return next();

        const user = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
        if (!user) throw new Error("something went wrong");

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json(error);
    }
});

function isAuthenticated(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'you must be logged in first' })
    next();
}

// routes
app.get("/", (req, res) => {
    res.send("Vacation Planner");
});

// index route
app.get("/locations", async (req, res) => {
    try {
        res.json(await Travel.find({}));
    } catch (error) {
        res.status(400).json(error);
    }
});

// create route
app.post("/locations", async (req, res) => {
    try {
        res.json(await Travel.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});

// delete
app.delete("/locations/:id", async (req, res) => {
    try {
        res.json(await Travel.findByIdAndDelete(req.params.id));
    } catch (error) {
        res.status(400).json(error);
    }
});

// tell the app to listen
app.listen(PORT, () => {
    console.log(`Express is istening on port: ${PORT}`);
});
