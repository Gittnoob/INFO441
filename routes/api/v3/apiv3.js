import express from 'express';
var router = express.Router();

import postsRouter from './controllers/posts.js';
import urlsRouter from './controllers/urls.js';
import usersRouter from './controllers/users.js';
import commentsRouter from './controllers/comments.js';
import userInfoRouter from './controllers/userInfo.js';

router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/urls', urlsRouter);
router.use('/users', usersRouter);
router.use('/userInfo', userInfoRouter);

export default router;
