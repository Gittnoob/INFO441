import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

router.get('/preview', async function(req, res) {
  try {
    const { url } = req.query;
    const previewHTML = await getURLPreview(url);
    res.send(previewHTML);
  } catch (error) {
    console.error(error);
  res.status(500).json({ error: error.message || 'Request failed.' });
  }
});

export default router;
