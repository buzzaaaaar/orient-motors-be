const router = require('express').Router();
const { listUsers, createUser, updateUser, deactivateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const auditLog = require('../middleware/auditLog');

router.use(auth, requireRole('admin'));

router.get('/', listUsers);
router.post('/', auditLog('created user', 'User'), createUser);
router.patch('/:id', auditLog('updated user', 'User'), updateUser);
router.delete('/:id', auditLog('deactivated user', 'User'), deactivateUser);

module.exports = router;
