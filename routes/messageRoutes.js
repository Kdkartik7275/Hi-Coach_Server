const express = require("express");
const { getMessagesByChatRoom } = require("../controllers/messageController");

const router = express.Router();

router.get("/:chatRoomId", getMessagesByChatRoom);

module.exports = router;
