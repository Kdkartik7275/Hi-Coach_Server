const { body, param, query, validationResult } = require("express-validator");

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: errors.array() 
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body("fullname")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2-100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number"),
  body("userType")
    .notEmpty().withMessage("User type is required")
    .isIn(["Student", "Coach"]).withMessage("Invalid user type"),
  validate,
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validate,
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("resetToken")
    .notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number"),
  validate,
];

// ID validations
const mongoIdValidation = (paramName) => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .isMongoId().withMessage(`Invalid ${paramName}`),
  validate,
];

const userIdValidation = [
  param("userId")
    .notEmpty().withMessage("User ID is required")
    .matches(/^(Student|Coach)-\d+$/).withMessage("Invalid user ID format"),
  validate,
];

// Search validation
const searchValidation = [
  query("query")
    .trim()
    .notEmpty().withMessage("Search query is required")
    .isLength({ min: 1, max: 100 }).withMessage("Query must be between 1-100 characters")
    .escape(),
  validate,
];

// Booking validation
const enrollmentValidation = [
  body("studentId")
    .notEmpty().withMessage("Student ID is required")
    .matches(/^Student-\d+$/).withMessage("Invalid student ID format"),
  body("programId")
    .notEmpty().withMessage("Program ID is required")
    .isMongoId().withMessage("Invalid program ID"),
  body("startDate")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Invalid date format"),
  body("slot")
    .notEmpty().withMessage("Slot is required"),
  body("paymentType")
    .notEmpty().withMessage("Payment type is required")
    .isIn(["full_advance", "per_session"]).withMessage("Invalid payment type"),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  mongoIdValidation,
  userIdValidation,
  searchValidation,
  enrollmentValidation,
};
