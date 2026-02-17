import express from 'express';

var router = express.Router();

router.post('/', async function(req, res) {
    try {
        const isAuthenticated = Boolean(req.session?.isAuthenticated);
        if (!isAuthenticated) {
            return res.status(401).json({
                status: "error",
                error: "not logged in"
            });
        }

        const { postID } = req.body;
        const username = req.session?.account?.username;
        const newComment = new req.models.Comment({
            username: username,
            post: postID,
            comment: req.body.newComment,
            created_date: new Date()
        })

        await newComment.save();

        res.json({ "status": "success"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        "status": "error",
        "error": error.message || 'Request failed.' });
  }
})

router.get('/', async function(req, res) {
    try {
        const { postID } = req.query;
        const comments = await req.models.Comment.find({ post: postID}).lean().exec();
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "error",
            error: error.message || String(error)
        });
    }
})

export default router;