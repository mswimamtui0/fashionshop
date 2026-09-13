const router = require('express').Router();
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const uploadDir = path.join(__dirname, '..', 'uploads');

router.post(
  '/',
  auth,
  admin,
  upload.array('files', 50),
  async (req, res) => {
    try {
      const urls = [];

      for (const file of req.files) {
        const filePath = path.join(uploadDir, file.filename);
        const isZip = file.mimetype === 'application/zip' ||
                      file.mimetype === 'application/x-zip-compressed' ||
                      file.originalname.toLowerCase().endsWith('.zip');

        if (isZip) {
          // Extract ZIP and grab image files
          const zip = new AdmZip(filePath);
          const entries = zip.getEntries();

          for (const entry of entries) {
            if (entry.isDirectory) continue;
            const ext = path.extname(entry.entryName).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) continue;

            const newName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
            const newPath = path.join(uploadDir, newName);
            fs.writeFileSync(newPath, entry.getData());
            urls.push(`/uploads/${newName}`);
          }

          // Delete the ZIP after extracting
          fs.unlinkSync(filePath);
        } else {
          // Regular image file
          urls.push(`/uploads/${file.filename}`);
        }
      }

      res.json({ urls });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;