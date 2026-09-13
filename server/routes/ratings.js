const router = require('express').Router();
const c = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.get('/product/:productId', c.listByProduct);
router.get('/summary', c.summary);
router.get('/my/:productId', auth, c.myRating);
router.post('/', auth, c.create);

module.exports = router;