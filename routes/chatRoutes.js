const express = require("express");
const { createChatRoom, getUserChatRooms } = require("../controllers/chatRoomController");
const authMiddleware = require("../middleware/authMiddleware");
const { userIdValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/create", createChatRoom);
router.get("/:userId", userIdValidation, getUserChatRooms);

module.exports = router;
