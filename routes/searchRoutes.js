const express = require("express");

const router = express.Router();

const {
  searchCoaches,
  getNearbyCoaches,
} = require("../controllers/searchController");

// 🔍 Search coaches by sport, name, and location
// Example: GET /api/coaches/search?sport=Football&search=John&lat=28.6&lon=77.2&maxDistance=50
router.get("/search", searchCoaches);

// 📍 Get all nearby coaches (no filters, location-based only)
// Example: GET /api/coaches/nearby?lat=28.6&lon=77.2&maxDistance=30
router.get("/nearby", getNearbyCoaches);

module.exports = router;
