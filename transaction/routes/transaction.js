// ===================================
// 7. ROUTES (routes/transactions.js)
// ===================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStats,
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getComparisonAnalytics,
  getTopIncomeSources,
  getTopExpenseSources
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Date must be valid'),
  body('description').optional().trim()
];

router.use(authMiddleware);

router.get('/', getTransactions);
router.get('/stats', getStats);
router.get('/stat/daily', getDailyAnalytics);
router.get('/stat/weekly', getWeeklyAnalytics);
router.get('/stat/monthly', getMonthlyAnalytics);
router.get('/stat/comparison', getComparisonAnalytics);
router.get('/topin', getTopIncomeSources);
router.get('/topex', getTopExpenseSources);
router.get('/:id', getTransaction);
router.post('/', transactionValidation, createTransaction);
router.put('/:id', transactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;