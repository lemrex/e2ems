// ============================================
// FILE: routes/profileRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/update', profileController.updateProfile);
router.put('/password', profileController.updatePassword);
router.get('/stats', profileController.getUserStats);
router.delete('/account', profileController.deleteAccount);

module.exports = router;


