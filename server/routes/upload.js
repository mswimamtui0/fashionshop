const router = require('express').Router();
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, admin, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});

module.exports = router;
