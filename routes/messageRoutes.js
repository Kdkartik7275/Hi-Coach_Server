const express = require("express");
const { getMessagesByChatRoom } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");
const { mongoIdValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/:chatRoomId", mongoIdValidation("chatRoomId"), getMessagesByChatRoom);

module.exports = router;
