import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

router.post('/', async function(req, res) {
    try {
        const isAuthenticated = Boolean(req.session?.isAuthenticated);
        if (!isAuthenticated) {
            return res.status(401).json({
                status: "error",
                error: "not logged in"
            });
        }

        const { url, description } = req.body;
        const username = req.session?.account?.username;
        const newPost = new req.models.Post({
            username: username,
            url: url,
            description: description,
            created_date: new Date()
        })

        await newPost.save();

        res.json({ "status": "success"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
        "status": "error",
        "error": error.message || 'Request failed.' });
  }
})

router.delete('/', async function(req, res) {
    try {
        const isAuthenticated = Boolean(req.session?.isAuthenticated);
        if (!isAuthenticated) {
            return res.status(401).json({
                status: "error",
                error: "not logged in"
            });
        }

        const { postID } = req.body;
        const user = req.session?.account?.username;
        const post = await req.models.Post.findById(postID);

        if(post.username != user) return res.status(401).json({status: 'error',
            error: "you can only delete your own posts"});

        await req.models.Post.deleteOne({_id: postID});
        await req.models.Comment.deleteMany({post: postID});

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
        const { username } = req.query;
        const query = username ? { username: username } : {};
        const posts = await req.models.Post.find(query).lean().exec();
        const postData = await Promise.all(
            posts.map(async post => { 
                try{
                    const htmlPreview = await getURLPreview(post.url);
                    return { id: post._id, username: post.username, description: post.description, 
                        likes: post.likes, comments: post.comments, htmlPreview };
                }catch(error){
                    return {
                        username: post.username,
                        description: post.description,
                        htmlPreview: error.message || String(error)
                    };
                }
            })
        );
        res.json(postData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "error",
            error: error.message || String(error)
        });
    }
})

router.post('/like', async function(req, res) {
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
        const post = await req.models.Post.findById(postID);
        if(!post) return res.status(404).json({status: "error", error: "post not found"});

        await req.models.Post.updateOne(
            {_id: post._id},
            {$addToSet: { likes: username} }
        );

        res.json({"status": "success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "error",
            error: error.message || String(error)
        });
    }
})

router.post('/unlike', async function(req, res) {
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
        const post = await req.models.Post.findById(postID);
        if(!post) return res.status(404).json({status: "error", error: "post not found"});

        await req.models.Post.updateOne(
            {_id: post._id},
            {$pull: { likes: username} }
        );

        res.json({"status": "success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "error",
            error: error.message || String(error)
        });
    }
})

export default router;
