const router = require('express').Router();
const c = require('../controllers/variantController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/product/:productId', c.listByProduct);
router.post('/', auth, admin, c.create);
router.put('/:id', auth, admin, c.update);
router.delete('/:id', auth, admin, c.remove);

module.exports = router;