const Coach = require("../models/coach");
const { calculateDistance } = require("../utils/distanceCalculation");

/**
 * Smart coach search that prioritizes nearby coaches
 * Supports: sport filter, name search, and location-based sorting
 */
const searchCoaches = async (req, res) => {
  try {
    const { sport, search, lat, lon, maxDistance = 100 } = req.query;

    const hasLocation = lat && lon;
    const userLat = hasLocation ? parseFloat(lat) : null;
    const userLon = hasLocation ? parseFloat(lon) : null;
    const maxDist = parseFloat(maxDistance);

    // 🧱 Build MongoDB query
    const query = {};

    // 1️⃣ Filter by sport if provided
    if (sport) {
      query.sports = { $in: [sport] };
    }

    // 2️⃣ Filter by name if provided (search in fullName)
    if (search && search.trim() !== "") {
      query.fullName = { $regex: new RegExp(search.trim(), "i") };
    }

    // 🧭 Fetch all matching coaches
    const allCoaches = await Coach.find(query).lean();

    if (!allCoaches || allCoaches.length === 0) {
      return res.status(200).json({
        message: "No coaches found matching your criteria",
        coaches: [],
        areas: [],
      });
    }

    // 3️⃣ If user location provided → filter by distance
    let coachesWithDistance = allCoaches;

    if (hasLocation) {
      coachesWithDistance = allCoaches
        .map((coach) => {
          if (!coach.coachingAreas || coach.coachingAreas.length === 0) return null;

          let minDistance = Infinity;
          let nearestArea = null;

          coach.coachingAreas.forEach((area) => {
            if (!area.latitude || !area.longitude) return;

            const distance = calculateDistance(
              userLat,
              userLon,
              parseFloat(area.latitude),
              parseFloat(area.longitude)
            );

            if (distance < minDistance) {
              minDistance = distance;
              nearestArea = area;
            }
          });

          if (minDistance <= maxDist) {
            return {
              ...coach,
              distance: parseFloat(minDistance.toFixed(2)),
              nearestArea,
            };
          }

          return null;
        })
        .filter(Boolean);

      // Sort by distance (nearest first)
      coachesWithDistance.sort((a, b) => a.distance - b.distance);
    }

    // 4️⃣ Extract unique nearest areas if location provided
    const uniqueAreas = hasLocation
      ? Array.from(
          new Set(
            coachesWithDistance.map((coach) => JSON.stringify(coach.nearestArea))
          )
        ).map((area) => JSON.parse(area))
      : [];

    // ✅ Send final response
    res.status(200).json({
      success: true,
      message: "Coaches fetched successfully",
      coaches: coachesWithDistance,
      areas: uniqueAreas,
      count: coachesWithDistance.length,
      searchRadius: hasLocation ? maxDist : null,
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