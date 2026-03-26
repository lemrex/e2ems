
// ===================================
// TRANSACTION CONTROLLER (controllers/transactionController.js)
// ===================================
const pool = require('../utils/db');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [req.userId];
    let paramCount = 1;

    if (type && (type === 'income' || type === 'expense')) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (startDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
      [req.userId]
    );

    logger.debug('Transactions fetched', { 
      userId: req.userId,
      count: result.rows.length,
      filters: { type, category, startDate, endDate }
    });

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Get transactions error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching transactions' 
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      logger.warn('Transaction not found', { 
        transactionId: id,
        userId: req.userId 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      data: {
        transaction: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Get transaction error', error, { 
      transactionId: req.params.id,
      userId: req.userId 
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching transaction' 
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Transaction creation validation failed', { 
        userId: req.userId,
        errors: errors.array() 
      });
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { type, amount, category, date, description } = req.body;

    const result = await pool.query(
      'INSERT INTO transactions (user_id, type, amount, category, date, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, type, amount, category, date, description || null]
    );

    logger.info('Transaction created', { 
      userId: req.userId,
      transactionId: result.rows[0].id,
      type,
      amount,
      category 
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Create transaction error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating transaction' 
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Transaction update validation failed', { 
        userId: req.userId,
        transactionId: req.params.id,
        errors: errors.array() 
      });
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { type, amount, category, date, description } = req.body;

    const checkResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      logger.warn('Transaction update failed - not found', { 
        transactionId: id,
        userId: req.userId 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const result = await pool.query(
      'UPDATE transactions SET type = $1, amount = $2, category = $3, date = $4, description = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
      [type, amount, category, date, description || null, id, req.userId]
    );

    logger.info('Transaction updated', { 
      userId: req.userId,
      transactionId: id,
      type,
      amount,
      category 
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        transaction: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update transaction error', error, { 
      transactionId: req.params.id,
      userId: req.userId 
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating transaction' 
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      logger.warn('Transaction deletion failed - not found', { 
        transactionId: id,
        userId: req.userId 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    logger.info('Transaction deleted', { 
      userId: req.userId,
      transactionId: id 
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    logger.error('Delete transaction error', error, { 
      transactionId: req.params.id,
      userId: req.userId 
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting transaction' 
    });
  }
};


exports.getStats = async (req, res) => {
  try {
    const { timeScope, startDate, endDate } = req.query;
    let dateFilter = '';
    const queryParams = [req.userId];
    let paramIndex = 2;

    // Build date filter based on timeScope (same as before)
    if (timeScope) {
      const now = new Date();
      let startDateTime, endDateTime;

      switch (timeScope) {
        case 'current-month':
          startDateTime = new Date(now.getFullYear(), now.getMonth(), 1);
          endDateTime = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last-week':
          endDateTime = new Date(now);
          startDateTime = new Date(now);
          startDateTime.setDate(now.getDate() - 7);
          break;
        case 'last-two-weeks':
          endDateTime = new Date(now);
          startDateTime = new Date(now);
          startDateTime.setDate(now.getDate() - 14);
          break;
        case 'last-month':
          startDateTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDateTime = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateTime = new Date(startDate);
            endDateTime = new Date(endDate);
          }
          break;
        default:
          break;
      }

      if (startDateTime && endDateTime) {
        startDateTime.setHours(0, 0, 0, 0);
        endDateTime.setHours(23, 59, 59, 999);

        dateFilter = `AND date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(startDateTime.toISOString().split('T')[0]);
        queryParams.push(endDateTime.toISOString().split('T')[0]);
        paramIndex += 2;
      }
    }

    // Get income
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = $1 AND type = 'income' ${dateFilter}`,
      queryParams
    );

    // Get expense
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = $1 AND type = 'expense' ${dateFilter}`,
      queryParams
    );

    // Get expense by category
    const expenseCategoryResult = await pool.query(
      `SELECT category, SUM(amount) as total FROM transactions 
       WHERE user_id = $1 AND type = 'expense' ${dateFilter}
       GROUP BY category ORDER BY total DESC`,
      queryParams
    );

    // Get income by category
    const incomeCategoryResult = await pool.query(
      `SELECT category, SUM(amount) as total FROM transactions 
       WHERE user_id = $1 AND type = 'income' ${dateFilter}
       GROUP BY category ORDER BY total DESC`,
      queryParams
    );

    // Get daily breakdown
    const dailyResult = await pool.query(
      `SELECT 
        date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions 
       WHERE user_id = $1 ${dateFilter}
       GROUP BY date 
       ORDER BY date ASC`,
      queryParams
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total);
    const totalExpense = parseFloat(expenseResult.rows[0].total);
    const netBalance = totalIncome - totalExpense;

    // Calculate period info
    let periodInfo = {};
    if (dateFilter) {
      periodInfo = {
        startDate: queryParams[queryParams.length - 2],
        endDate: queryParams[queryParams.length - 1],
        timeScope: timeScope || 'custom'
      };
    }

    logger.debug('Stats fetched', { 
      userId: req.userId,
      timeScope: timeScope || 'all-time',
      periodInfo,
      totalIncome,
      totalExpense,
      netBalance 
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate: totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(2) : 0,
        expenseByCategory: expenseCategoryResult.rows.map(row => ({
          category: row.category,
          total: parseFloat(row.total)
        })),
        incomeByCategory: incomeCategoryResult.rows.map(row => ({
          category: row.category,
          total: parseFloat(row.total)
        })),
        dailyBreakdown: dailyResult.rows.map(row => ({
          date: row.date,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense),
          net: parseFloat(row.income) - parseFloat(row.expense)
        })),
        periodInfo
      }
    });
  } catch (error) {
    logger.error('Get stats error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching statistics' 
    });
  }
};



// @desc    Get daily analytics (last 30 days)
// @route   GET /api/transactions/analytics/daily
// @access  Private
exports.getDailyAnalytics = async (req, res) => {
  try {
    const dailyData = await pool.query(
      `SELECT 
        date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date DESC`,
      [req.userId]
    );

    logger.debug('Daily analytics fetched', { 
      userId: req.userId,
      dataPoints: dailyData.rows.length 
    });

    res.json({
      success: true,
      data: {
        daily: dailyData.rows.map(row => ({
          date: row.date,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense),
          net: parseFloat(row.income) - parseFloat(row.expense),
          transactionCount: parseInt(row.transaction_count)
        }))
      }
    });
  } catch (error) {
    logger.error('Get daily analytics error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching daily analytics' 
    });
  }
};

// @desc    Get weekly analytics (last 12 weeks)
// @route   GET /api/transactions/analytics/weekly
// @access  Private
exports.getWeeklyAnalytics = async (req, res) => {
  try {
    const weeklyData = await pool.query(
      `SELECT 
        DATE_TRUNC('week', date) as week_start,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week_start DESC`,
      [req.userId]
    );

    logger.debug('Weekly analytics fetched', { 
      userId: req.userId,
      dataPoints: weeklyData.rows.length 
    });

    res.json({
      success: true,
      data: {
        weekly: weeklyData.rows.map(row => ({
          weekStart: row.week_start,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense),
          net: parseFloat(row.income) - parseFloat(row.expense),
          transactionCount: parseInt(row.transaction_count)
        }))
      }
    });
  } catch (error) {
    logger.error('Get weekly analytics error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching weekly analytics' 
    });
  }
};

// @desc    Get monthly analytics (last 12 months)
// @route   GET /api/transactions/analytics/monthly
// @access  Private
exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const monthlyData = await pool.query(
      `SELECT 
        DATE_TRUNC('month', date) as month_start,
        TO_CHAR(date, 'Mon YYYY') as month_label,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date), TO_CHAR(date, 'Mon YYYY')
      ORDER BY month_start DESC`,
      [req.userId]
    );

    logger.debug('Monthly analytics fetched', { 
      userId: req.userId,
      dataPoints: monthlyData.rows.length 
    });

    res.json({
      success: true,
      data: {
        monthly: monthlyData.rows.map(row => ({
          monthStart: row.month_start,
          monthLabel: row.month_label,
          income: parseFloat(row.income),
          expense: parseFloat(row.expense),
          net: parseFloat(row.income) - parseFloat(row.expense),
          transactionCount: parseInt(row.transaction_count)
        }))
      }
    });
  } catch (error) {
    logger.error('Get monthly analytics error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching monthly analytics' 
    });
  }
};

// @desc    Get comparison analytics (today vs week vs month)
// @route   GET /api/transactions/analytics/comparison
// @access  Private
// exports.getComparisonAnalytics = async (req, res) => {
//   try {
//     const todayResult = await pool.query(
//       `SELECT 
//         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
//         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
//         COUNT(*) as transaction_count
//       FROM transactions 
//       WHERE user_id = $1 AND date = CURRENT_DATE`,
//       [req.userId]
//     );

//     const weekResult = await pool.query(
//       `SELECT 
//         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
//         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
//         COUNT(*) as transaction_count
//       FROM transactions 
//       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'`,
//       [req.userId]
//     );

//     const monthResult = await pool.query(
//       `SELECT 
//         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
//         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
//         COUNT(*) as transaction_count
//       FROM transactions 
//       WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'`,
//       [req.userId]
//     );

//     const formatStats = (row) => ({
//       income: parseFloat(row.income || 0),
//       expense: parseFloat(row.expense || 0),
//       net: parseFloat(row.income || 0) - parseFloat(row.expense || 0),
//       transactionCount: parseInt(row.transaction_count || 0)
//     });

//     logger.debug('Comparison analytics fetched', { userId: req.userId });

//     res.json({
//       success: true,
//       data: {
//         today: formatStats(todayResult.rows[0]),
//         thisWeek: formatStats(weekResult.rows[0]),
//         thisMonth: formatStats(monthResult.rows[0])
//       }
//     });
//   } catch (error) {
//     logger.error('Get comparison analytics error', error, { userId: req.userId });
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error fetching comparison analytics' 
//     });
//   }
// };


/**
 * Get top income sources (grouped by category)
 */
exports.getTopIncomeSources = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `
      SELECT
        category AS name,
        SUM(amount) AS value
      FROM transactions
      WHERE user_id = $1
        AND type = 'income'
      GROUP BY category
      ORDER BY value DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.log("USER ID:", req.userId || req.user?.id);

    console.error("Top income sources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top income sources",
    });
  }
};


exports.getTopExpenseSources = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `
      SELECT
        category AS name,
        SUM(amount) AS value
      FROM transactions
      WHERE user_id = $1
        AND type = 'expense'
      GROUP BY category
      ORDER BY value DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.log("USER ID:", req.userId || req.user?.id);

    console.error("Top income sources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top income sources",
    });
  }
};




/**
 * Utility: calculate percentage change safely
 */
const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Utility: aggregate transactions
 */
const aggregate = async (userId, start, end) => {
  const { rows } = await pool.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense,
      COUNT(*)::INT AS transaction_count
    FROM transactions
    WHERE user_id = $1
      AND date BETWEEN $2 AND $3
    `,
    [userId, start, end]
  );

  const income = Number(rows[0].income);
  const expense = Number(rows[0].expense);

  return {
    income,
    expense,
    net: income - expense,
    transactionCount: rows[0].transaction_count,
  };
};

exports.getComparisonAnalytics = async (req, res) => {
  const userId = req.userId;

  try {
    const now = new Date();

    // ----- Date boundaries -----
    const today = new Date(now.toISOString().slice(0, 10));
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(monthStart);
    lastMonthEnd.setDate(0);

    // ----- Aggregations -----
    const todayData = await aggregate(userId, today, today);
    const yesterdayData = await aggregate(userId, yesterday, yesterday);

    const thisWeek = await aggregate(userId, weekStart, today);
    const lastWeek = await aggregate(userId, lastWeekStart, new Date(weekStart - 1));

    const thisMonth = await aggregate(userId, monthStart, today);
    const lastMonth = await aggregate(userId, lastMonthStart, lastMonthEnd);

    // ----- Response -----
    res.json({
      success: true,
      data: {
        daily: {
          current: { label: "Today", ...todayData },
          previous: { label: "Yesterday", ...yesterdayData },
          change: {
            income: todayData.income - yesterdayData.income,
            expense: todayData.expense - yesterdayData.expense,
            net: todayData.net - yesterdayData.net,
            incomePct: percentChange(todayData.income, yesterdayData.income),
            expensePct: percentChange(todayData.expense, yesterdayData.expense),
            netPct: percentChange(todayData.net, yesterdayData.net),
          },
        },

        weekly: {
          current: { label: "This Week", ...thisWeek },
          previous: { label: "Last Week", ...lastWeek },
          change: {
            income: thisWeek.income - lastWeek.income,
            expense: thisWeek.expense - lastWeek.expense,
            net: thisWeek.net - lastWeek.net,
            incomePct: percentChange(thisWeek.income, lastWeek.income),
            expensePct: percentChange(thisWeek.expense, lastWeek.expense),
            netPct: percentChange(thisWeek.net, lastWeek.net),
          },
        },

        monthly: {
          current: { label: "This Month", ...thisMonth },
          previous: { label: "Last Month", ...lastMonth },
          change: {
            income: thisMonth.income - lastMonth.income,
            expense: thisMonth.expense - lastMonth.expense,
            net: thisMonth.net - lastMonth.net,
            incomePct: percentChange(thisMonth.income, lastMonth.income),
            expensePct: percentChange(thisMonth.expense, lastMonth.expense),
            netPct: percentChange(thisMonth.net, lastMonth.net),
          },
        },
      },
    });
  } catch (error) {
    console.error("Comparison analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load comparison analytics",
    });
  }
};
