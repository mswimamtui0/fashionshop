const router = require('express').Router();
const c = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', c.list);
router.get('/trending', c.trending);
router.get('/latest', c.latest);
router.get('/categories', c.categories);
router.get('/:id', c.getOne);
router.post('/', auth, admin, c.create);
router.put('/:id', auth, admin, c.update);
router.delete('/:id', auth, admin, c.remove);

module.exports = router;