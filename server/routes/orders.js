const router = require('express').Router();
const c = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, c.create);
router.get('/my', auth, c.myOrders);
router.get('/all', auth, admin, c.listAll);

module.exports = router;