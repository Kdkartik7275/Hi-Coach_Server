const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);

    let { fullname, email, password, userType } = req.body;

    if (!email || !password || !fullname || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = userType + "-" + Date.now();

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      userId,
      userType,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser.userId, userType: newUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userId: decoded.userId, userType: decoded.userType });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({ 
        message: "If the email exists, a reset token has been sent" 
      });
    }

    // Generate reset token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store token with expiry (10 minutes)
    resetTokens.set(hashedToken, {
      userId: user.userId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // TODO: Send email with resetToken
    // For now, return it (REMOVE IN PRODUCTION)
    console.log("Reset token for", email, ":", resetToken);

    res.status(200).json({ 
      message: "If the email exists, a reset token has been sent",
      // REMOVE THIS IN PRODUCTION - only for testing
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Password Reset Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ 
        message: "Email, reset token, and new password are required" 
      });
    }

    // Hash the provided token
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Check if token exists and is valid
    const tokenData = resetTokens.get(hashedToken);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      resetTokens.delete(hashedToken);
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Find user
    const user = await User.findOne({ email, userId: tokenData.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used token
    resetTokens.delete(hashedToken);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  register, 
  login, 
  getAllUsers, 
  verifyToken, 
  requestPasswordReset, 
  resetPassword 
};
