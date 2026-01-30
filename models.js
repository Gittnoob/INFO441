
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
await mongoose.connect(uri, { dbName: 'websharer' });


const postSchema = new mongoose.Schema({
    url: String,
    description: String,
    username: String,
    created_date: Date
});

const Post = mongoose.model('Post', postSchema);

const models = { Post };
export default models;
