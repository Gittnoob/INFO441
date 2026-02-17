
// import dotenv from 'dotenv';
// dotenv.config();

import mongoose from 'mongoose';

// const uri = process.env.MONGODB_URI;
const MONGODB_URI="mongodb+srv://pexitang_db_user:xV9uyc9MowPP0Nqy@cluster0.ysjpteu.mongodb.net/?appName=Cluster0"
await mongoose.connect(MONGODB_URI, { dbName: 'websharer' });


const postSchema = new mongoose.Schema({
    url: String,
    description: String,
    username: String,
    likes: Array,
    created_date: Date
});

const commentSchema = new mongoose.Schema({
    username: String, // should be the "username" in the session.account
    comment: String,
    post: String, // object id of a Post
    created_date: Date
})

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

const models = { Post, Comment };
export default models;
