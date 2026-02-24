import express from 'express';

var router = express.Router();

// Load user info by username
router.get('/', async function(req, res) {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ status: "error", error: "username required" });

    const info = await req.models.UserInfo.findOne({ username }).lean().exec();
    // Return empty object if none exists yet
    return res.json(info || { username, bio: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message || String(error) });
  }
});

// Save/update current user's info
router.post('/', async function(req, res) {
  try {
    const isAuthenticated = Boolean(req.session?.isAuthenticated);
    if (!isAuthenticated) {
      return res.status(401).json({ status: "error", error: "not logged in" });
    }

    const username = req.session?.account?.username;
    const { bio } = req.body;

    const update = { username, bio, updated_date: new Date() };

    await req.models.UserInfo.updateOne(
      { username },
      { $set: update },
      { upsert: true }
    );

    res.json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message || String(error) });
  }
});

export default router;