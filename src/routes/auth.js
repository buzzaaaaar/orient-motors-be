const router = require('express').Router();
const { login, refresh, logout } = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/login', rateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
