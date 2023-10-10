const express = require("express");
const router = express.Router();
const Travel = require("../models/Travel");
const { firebaseAuth, isAuthenticated } = require("../middlewares/auth");

router.use(firebaseAuth);

// routes

// index route
router.get("/locations", isAuthenticated, async (req, res, next) => {
  try {
    const locations = await Travel.find({});
    if (!locations) {
      return res.status(404).json({ error: "No locations found." });
    }
    res.json(locations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// create route
router.post("/locations", isAuthenticated, async (req, res, next) => {

  if (!req.body.name || !req.body.image) {
    return res.status(400).send("Name and Image are required.");
  }

  const locationToSave = {
    ...req.body,
    uid: req.user.uid, // Add the user's UID to the location data
  };

  try {
    const savedLocation = await Travel.create(locationToSave);
    res.json(savedLocation);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(400).json(error);
  }
});

// update route
router.put("/locations/:id", isAuthenticated, async (req, res, next) => {
  try {
    const location = await Travel.findById(req.params.id);
    if (!location) return res.status(404).send("Location not found");

    // Check if the UID in the entry matches the UID from the token
    if (location.uid !== req.user.uid) {
      return res.status(403).send("Permission denied");
    }

    const updatedData = await Travel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    next(error);
  }
});

// delete route
router.delete("/locations/:id", isAuthenticated, async (req, res, next) => {
  try {
    const location = await Travel.findById(req.params.id);

    // Check if the location with the provided ID exists
    if (!location) {
      return res.status(404).send("Location not found");
    }

    // Check if the UID in the entry matches the UID from the token
    if (location.uid !== req.user.uid) {
      return res.status(403).send("Permission denied");
    }

    // Attempt to delete the location
    await location.remove();

    res.json({ message: "Location deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error in DELETE /locations/:id:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
