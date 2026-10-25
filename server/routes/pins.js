const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Pin = require("../models/Pin");

// @route   GET api/pins
// @desc    Get all pins
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const pins = await Pin.find().populate("addedBy", "name email").sort({ createdAt: -1 });
    res.json(pins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/pins
// @desc    Add new pin
// @access  Private
router.post("/", auth, async (req, res) => {
  const { title, description, category, budgetEstimate, coordinates } = req.body;

  try {
    const newPin = new Pin({
      title,
      description,
      category,
      budgetEstimate,
      coordinates,
      addedBy: req.user.id,
    });

    const pin = await newPin.save();
    
    // Populate addedBy before returning so the frontend has the user name
    await pin.populate("addedBy", "name email");
    
    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/pins/:id
// @desc    Delete a pin
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ msg: "Pin not found" });
    }

    // Make sure user owns pin
    if (pin.addedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await pin.deleteOne();

    res.json({ msg: "Pin removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Pin not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
