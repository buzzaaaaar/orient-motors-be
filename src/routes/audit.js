const router = require('express').Router();
const { getAuditLog } = require('../controllers/auditController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/', auth, requireRole('admin'), getAuditLog);

module.exports = router;
