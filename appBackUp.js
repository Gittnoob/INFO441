import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import v1Router from './routes/api/v1/apiv1.js';
import v2Router from './routes/api/v2/apiv2.js';
import v3Router from './routes/api/v3/apiv3.js';

import models from './models.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public 3')));

app.use((req, res, next) => {
  req.models = models;
  next();
});

import session from 'express-session';
import * as MsIdExpress from 'microsoft-identity-express';

const authConfig = {
    auth: {
   	  clientId: process.env.APP_ID,
    	authority: process.env.DIRECTORY,
    	clientSecret: process.env.CLIENT_SECRET,
    	redirectUri: process.env.REDIRECT_URI
    },
	system: {
    	loggerOptions: {
        	loggerCallback(loglevel, message, containsPii) {
            	console.log(message);
        	},
        	piiLoggingEnabled: false,
        	logLevel: 3,
    	}
	}
};

app.enable('trust proxy')
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // set true if using https
    },
  })
);

const appSettings = {
  appCredentials: {
    clientId: process.env.APP_ID,
    tenantId: process.env.DIRECTORY,
    clientSecret: process.env.CLIENT_SECRET,
  },
  authRoutes: {
    redirect: '/auth/redirect',
    unauthorized: '/unauthorized',
  },
};

const msid = new MsIdExpress.WebAppAuthClientBuilder(appSettings).build();

app.use(msid.initialize());

app.get('/signin', msid.signIn({ postLoginRedirect: '/' }));
app.get('/signout', msid.signOut({ postLogoutRedirect: '/' }));

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
app.use('/api/v3', v3Router);

// use this by going to urls like: 
// http://localhost:3000/fakelogin?name=anotheruser
app.get('/fakelogin', (req, res) => {
    let newName = req.query.name;
    let session=req.session;
    session.isAuthenticated = true;
    if(!session.account){
        session.account = {};
    }
    session.account.name = newName;
    session.account.username = newName;
    console.log("set session");
    res.redirect("/api/v3/users/myIdentity");
});

// use this by going to a url like: 
// http://localhost:3000/fakelogout
app.get('/fakelogout', (req, res) => {
    let newName = req.query.name;
    let session=req.session;
    session.isAuthenticated = false;
    session.account = {};
    console.log("you have fake logged out");
    res.redirect("/api/v3/users/myIdentity");
});

export default app;
