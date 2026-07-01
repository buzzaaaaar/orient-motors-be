const router = require('express').Router();
const { searchVehicles, suggestVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getVehicleParts } = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.get('/search', auth, searchVehicles);
router.get('/suggest', auth, suggestVehicles);
router.get('/:id', auth, getVehicle);
router.post('/', auth, requireRole('admin'), auditLog('created vehicle', 'Vehicle'), createVehicle);
router.patch('/:id', auth, requireRole('admin'), auditLog('updated vehicle', 'Vehicle'), updateVehicle);
router.delete('/:id', auth, requireRole('admin'), auditLog('deleted vehicle', 'Vehicle'), deleteVehicle);
router.get('/:vehicleId/parts', auth, getVehicleParts);

module.exports = router;
