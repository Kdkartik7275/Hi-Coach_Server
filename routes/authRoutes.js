const express = require("express");
const { register, login, getAllUsers, verifyToken } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.get("/verify-token", verifyToken);

module.exports = router;
