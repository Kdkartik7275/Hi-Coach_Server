const express = require("express");
const { createChatRoom, getUserChatRooms } = require("../controllers/chatRoomController");

const router = express.Router();

router.post("/create", createChatRoom);
router.get("/:userId", getUserChatRooms);

module.exports = router;
