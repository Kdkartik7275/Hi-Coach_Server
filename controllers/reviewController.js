const Review = require("../models/review");

exports.createReview = async (req, res) => {
    try {
        const { coachId, userId, userName, userProfileUrl, rating, content } = req.body;

        if (!coachId || !userId || !userName || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingReview = await Review.findOne({ coachId, userId });
        if (existingReview) {
            return res.status(200).json({ message: "You have already reviewed this coach" });
        }

        const newReview = new Review({
            coachId,
            userId,
            userName,
            userProfileUrl,
            rating,
            content,
        });

        await newReview.save();

        res.status(201).json({
            message: "Review added successfully",
            review: newReview,
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getReviewsByCoach = async (req, res) => {
    try {
        const { coachId } = req.params;

        if (!coachId) {
            return res.status(400).json({ message: "Coach ID is required" });
        }

        const reviews = await Review.find({ coachId }).sort({ createdAt: -1 });

        res.status(200).json({
            total: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
