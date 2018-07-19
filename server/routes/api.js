const express = require('express');
const router = express.Router();

// app controllers
var authCtrl = require('../controllers/auth.js');
var websiteCtrl = require('../controllers/website.js');

// auth middleware
var auth = require('../config/jwt').auth;

// authentication routes
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// websites routes
router.get('/websites', auth, websiteCtrl.getWebsites)
router.post('/websites', auth, websiteCtrl.createWebsite);
router.get('/websites/:id', auth, websiteCtrl.getWebsite);
router.put('/websites/:id', auth, websiteCtrl.updateWebsite);
router.delete('/websites/:id', auth, websiteCtrl.deleteWebsite);

// sessions routes
router.get('/websites/:id/sessions', auth, websiteCtrl.getSessions);
router.get('/websites/:id/sessions-count', auth, websiteCtrl.getSessionsCount);
router.get('/websites/:id/sessions/:sid', auth, websiteCtrl.getSession);
router.delete('/sessions/:id', auth, websiteCtrl.deleteSession);
router.get('/websites/:id/pages/', auth, websiteCtrl.getWebsitePages);
router.get('/websites/:id/actions/:width/:height', auth, websiteCtrl.getWebsitePageActions);
router.get('/websites/:id/content/', auth, websiteCtrl.getWebsitePageContent);
router.get('/websites/:id/suggestions/', auth, websiteCtrl.getWebsitePageSuggestions);
router.get('/websites/:id/visitors', auth, websiteCtrl.getWebsiteVisitors);
router.get('/websites/:id/visitor-sessions/:vid', auth, websiteCtrl.getVisitorSessions);

module.exports = router;