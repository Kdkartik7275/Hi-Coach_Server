const Coach = require("../models/coach");
const { calculateDistance } = require("../utils/distanceCalculation");

/**
 * Smart coach search that prioritizes nearby coaches
 * Supports: sport filter, name search, and location-based sorting
 */
const searchCoaches = async (req, res) => {
  try {
    const { sport, search, lat, lon, maxDistance = 100 } = req.query;

    // Validate user location
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: "User location (lat, lon) is required for search" 
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const maxDist = parseFloat(maxDistance);

    // Build MongoDB query
    const query = {};

    // 1. Filter by sport if provided
    if (sport) {
      query.sports = { $in: [sport] };
    }

    // 2. Filter by name search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch all matching coaches
    const allCoaches = await Coach.find(query);

    if (allCoaches.length === 0) {
      return res.status(200).json({ 
        message: "No coaches found matching your criteria",
        coaches: [],
        areas: []
      });
    }

    // 3. Calculate distance for each coach and filter by proximity
    const coachesWithDistance = allCoaches
      .map((coach) => {
        if (!coach.coachingAreas || coach.coachingAreas.length === 0) {
          return null;
        }

        // Find the nearest coaching area for this coach
        let minDistance = Infinity;
        let nearestArea = null;

        coach.coachingAreas.forEach((area) => {
          const distance = calculateDistance(
            userLat,
            userLon,
            area.latitude,
            area.longitude
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestArea = area;
          }
        });

        // Only include coaches within max distance
        if (minDistance <= maxDist) {
          return {
            ...coach.toObject(),
            distance: minDistance,
            nearestArea: nearestArea,
          };
        }

        return null;
      })
      .filter(Boolean); // Remove null entries

    // 4. Sort by distance (nearest first)
    coachesWithDistance.sort((a, b) => a.distance - b.distance);

    if (coachesWithDistance.length === 0) {
      return res.status(404).json({
        message: `No coaches found within ${maxDist} km`,
        coaches: [],
        areas: []
      });
    }

    // 5. Extract unique areas
    const uniqueAreas = Array.from(
      new Set(
        coachesWithDistance
          .map((coach) => JSON.stringify(coach.nearestArea))
      )
    ).map((area) => JSON.parse(area));

    res.status(200).json({
      coaches: coachesWithDistance,
      areas: uniqueAreas,
      count: coachesWithDistance.length,
      searchRadius: maxDist,
    });
  } catch (error) {
    console.error("Error searching coaches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get nearby coaches (no sport/name filter, just location-based)
 * Useful for "Browse all nearby coaches" feature
 */
const getNearbyCoaches = async (req, res) => {
  try {
    const { lat, lon, maxDistance = 50 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: "lat and lon parameters are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const maxDist = parseFloat(maxDistance);

    // Fetch all coaches
    const allCoaches = await Coach.find({});

    // Calculate distances and filter nearby coaches
    const nearbyCoaches = allCoaches
      .map((coach) => {
        if (!coach.coachingAreas || coach.coachingAreas.length === 0) {
          return null;
        }

        let minDistance = Infinity;
        let nearestArea = null;

        coach.coachingAreas.forEach((area) => {
          const distance = calculateDistance(
            userLat,
            userLon,
            area.latitude,
            area.longitude
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestArea = area;
          }
        });

        if (minDistance <= maxDist) {
          return {
            ...coach.toObject(),
            distance: minDistance,
            nearestArea: nearestArea,
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyCoaches.length === 0) {
      return res.status(404).json({
        message: `No coaches found within ${maxDist} km`,
        coaches: [],
        areas: [],
      });
    }

    // ✅ Extract unique areas (same logic as searchCoaches)
    const uniqueAreas = Array.from(
      new Set(nearbyCoaches.map((coach) => JSON.stringify(coach.nearestArea)))
    ).map((area) => JSON.parse(area));

    // ✅ Unified response structure
    res.status(200).json({
      coaches: nearbyCoaches,
      areas: uniqueAreas,
      count: nearbyCoaches.length,
      searchRadius: maxDist,
    });
  } catch (error) {
    console.error("Error fetching nearby coaches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { 
  searchCoaches, 
  getNearbyCoaches 
};