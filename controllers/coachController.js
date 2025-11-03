const Coach = require("../models/coach");
const { search } = require("../routes/studentRoutes");

const createCoach = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Check if req.body has data
    const coach = new Coach(req.body);
    console.log("Coach Object:", coach); // Check if coach object is created
    await coach.save();
    res.status(201).json(coach);
  } catch (error) {
    console.error("Error:", error.message); // Log any errors
    res.status(400).json({ error: error.message });
  }
};

// Get a single Coach by userId
const getCoachByUserId = async (req, res) => {
  try {
    const coach = await Coach.findOne({ userId: req.params.userId });
    if (!coach) return res.status(404).json({ message: "Coach not found" });
    res.status(200).json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Update Coach details by userId
const updateCoachByUserId = async (req, res) => {
  try {
    const updatedCoach = await Coach.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );
    if (!updatedCoach)
      return res.status(404).json({ message: "Coach not found" });
    res.status(200).json(updatedCoach);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCoachTimings = async (req, res) => {
  try {
    const { userId } = req.params;
    let { timings } = req.body;

    if (!timings || !Array.isArray(timings)) {
      return res.status(400).json({ message: "Invalid timings data" });
    }

    const updatedTimings = timings.map((timing) => ({
      ...timing,
      date: new Date(timing.date),
      timings: timing.timings.map((t) => ({
        start: new Date(t.start).toISOString(),
        end: new Date(t.end).toISOString(),
      })),
    }));

    const updatedCoach = await Coach.findOneAndUpdate(
      { userId },
      { timings: updatedTimings },
      { new: true }
    );

    if (!updatedCoach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    res.status(200).json(updatedCoach);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//  Delete a Coach by userId
const deleteCoachByUserId = async (req, res) => {
  try {
    const deletedCoach = await Coach.findOneAndDelete({
      userId: req.params.userId,
    });
    if (!deletedCoach)
      return res.status(404).json({ message: "Coach not found" });
    res.status(200).json({ message: "Coach deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchCoaches = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const coaches = await Coach.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { sports: { $regex: query, $options: "i" } },
      ],
    });

    if (!coaches.length) {
      return res
        .status(404)
        .json({ message: "No coaches found matching your search" });
    }

    res.status(200).json(coaches);
  } catch (error) {
    console.error("Error searching coaches:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  deleteCoachByUserId,
  getCoachByUserId,
  updateCoachByUserId,
  createCoach,
  updateCoachTimings,
  searchCoaches
};
