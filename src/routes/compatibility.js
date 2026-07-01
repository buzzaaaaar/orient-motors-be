const router = require('express').Router();
const { addCompatibility, removeCompatibility } = require('../controllers/compatibilityController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.post('/', auth, requireRole('admin'), auditLog('added compatibility', 'PartVehicleCompatibility'), addCompatibility);
router.delete('/:id', auth, requireRole('admin'), auditLog('removed compatibility', 'PartVehicleCompatibility'), removeCompatibility);

module.exports = router;
