const router = require('express').Router();
const c = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, admin, c.dashboard);

module.exports = router;