const express = require('express');
const router = express.Router();
const Travel = require('../models/Travel');
const { firebaseAuth, isAuthenticated } = require('../middlewares/auth');

router.use(firebaseAuth);

// routes
router.get("/", isAuthenticated, (req, res, next) => {
  res.send("Vacation Planner");
});

// index route
router.get("/locations", isAuthenticated, async (req, res, next) => {
  try {
      res.json(await Travel.find({}));
  } catch (error) {
      res.status(400).json(error);
  }
});

// create route
router.post("/locations", isAuthenticated, async (req, res, next) => {
  if (!req.body.name || !req.body.image) {
    return res.status(400).send('Name and Image are required.');
  }
  try {
      res.json(await Travel.create(req.body));
  } catch (error) {
      res.status(400).json(error);
  }
});

// update route
router.put('/locations/:id', isAuthenticated, async (req, res, next) => {
  try {
      const updatedData = await Travel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedData);
  } catch (error) {
      next(error);
  }
});


// delete
router.delete("/locations/:id", isAuthenticated, async (req, res, next) => {
  try {
      res.json(await Travel.findByIdAndDelete(req.params.id));
  } catch (error) {
      res.status(400).json(error);
  }
});

module.exports = router;
