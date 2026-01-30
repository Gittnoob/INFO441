
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
    created_date: Date
});

const Post = mongoose.model('Post', postSchema);

const models = { Post };
export default models;
