const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Client validation
const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client name is required and must not exceed 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  validate
];

// Invoice validation
const validateInvoice = [
  body('client')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required'),
  body('items.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('items.*.rate')
    .isFloat({ min: 0 })
    .withMessage('Rate must be a valid number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  validate
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateClient,
  validateInvoice
};