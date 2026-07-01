const router = require('express').Router();
const { searchParts, suggestParts, getPart, createPart, updatePart, deletePart, getPartVehicles } = require('../controllers/partController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.get('/search', auth, searchParts);
router.get('/suggest', auth, suggestParts);
router.get('/:id', auth, getPart);
router.post('/', auth, requireRole('admin'), auditLog('created part', 'Part'), createPart);
router.patch('/:id', auth, requireRole('admin'), auditLog('updated part', 'Part'), updatePart);
router.delete('/:id', auth, requireRole('admin'), auditLog('deleted part', 'Part'), deletePart);
router.get('/:partId/vehicles', auth, getPartVehicles);

module.exports = router;
