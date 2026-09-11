const router = require('express').Router();
const c = require('../controllers/smsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/send', auth, admin, c.sendBulk);
router.get('/logs', auth, admin, c.logs);

module.exports = router;