const router = require('express').Router();
const c = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

router.get('/', auth, c.list);
router.get('/check/:productId', auth, c.check);
router.post('/', auth, c.add);
router.delete('/:productId', auth, c.remove);

module.exports = router;