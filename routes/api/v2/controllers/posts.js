import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

router.post('/', async function(req, res) {
    try {
        const { url,description,username } = req.body;
        const newPost = new req.models.Post({
            username: username + ": ",
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

router.get('/', async function(req, res) {
    try {
        const posts = await req.models.Post.find().lean().exec();
        const postData = await Promise.all(
            posts.map(async post => { 
                try{
                    const htmlPreview = await getURLPreview(post.url);
                    return { username: post.username, description: post.description, htmlPreview };
                }catch(error){
                    return {
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

export default router;
