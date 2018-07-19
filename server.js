const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const passport = require('passport');
const uaParser = require('ua-parser-js');
const mongoose = require('mongoose');
const proxyCtrl = require('./server/controllers/proxy.js');

// configurations
const config = require('./server/config/app');
const logger = require('./server/config/log');
require('./server/config/mongodb');
require('./server/config/passport');

// get our api routes
const apiRoutes = require('./server/routes/api');

// parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'server/static')));
app.use(express.static(path.join(__dirname, 'dist')));

// enable localhost communication between node and angular
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

// set our routes
app.use('/api', apiRoutes);

// proxy server route
app.get('/proxy/*', proxyCtrl.load);

// Init passport as middleware
app.use(passport.initialize());

// catch unauthorised errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({'error': 1, 'message' : err.name + ': ' + err.message});
    }
});

// catch all other routes and return the index file
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// start app
server.listen(config.appPort);

logger.info('server running');

// visitor tracking

const User = mongoose.model('User');
const Session = mongoose.model('Session');
var users = {};

// somebody has connected
io.on('connection', function(socket) {
    logger.info(socket.handshake.headers);

    var host = socket.handshake.headers.origin ? socket.handshake.headers.origin : socket.handshake.headers.host;
    var referer = socket.handshake.headers.referer;

    // some kind of bot
    if (!referer) return;

    var parse = referer.split(host);
    var url = parse[0] + host;
    var page = parse[1];
    var fullUrl = url + page;
    var host = url;

    if (host.slice(-1) != '/') {
        host += '/';
    }

    logger.info('New connection on url %s, page %s', url, page);

    if (socket.handshake.query.hasOwnProperty('live') && socket.handshake.query.hasOwnProperty('page')) {
        var key = socket.handshake.query.live;
        page = socket.handshake.query.page;

        logger.info('Live tracking has been opened with key ' + key);

        User.findOne({
            'websites.privateKey': key
        }).select('websites').exec(function(err, user) {
            if (err) {
                logger.error(err);
            }

            if (user) {
                logger.info('correct private key');

                // filter website
                var website = user.websites.filter(function (website) {
                    return website.privateKey === key;
                }).pop();

                 // filter page
                var findPage = website.pages.filter(function (p) {
                    return p._id == page;
                }).pop();

                if (!findPage) {
                    logger.info('page %s not found, try again later', page);
                    return;
                }

                fullUrl = website.url + findPage.page.substring(1);

                var room = website._id + fullUrl;
                socket.join(room);

                // send info about connected users to admin
                var keys = Object.keys(users);
                if (website.settings.layout == 1) {
                    // we will not send data about users who have scaled view
                    var match = keys.filter(function(key){ return users[key]['room'] === room && users[key]['width'] >= website.settings.viewportDesktop});
                } else {
                    var match = keys.filter(function(key){ return users[key]['room'] === room});
                }
                var currentPageUsers = match.map(function(key) {
                    var tracking = users[key]['tracking'];
                    if (tracking.length > 0) {
                        var item = tracking.slice(-1)[0];
                        var x = item.x;
                        var y = item.y;
                    } else {
                        var x = -1000;
                        var y = -1000;
                    }

                    return {
                        visitor: key,
                        x: x,
                        y: y,
                        width: users[key]['width'],
                        height: users[key]['height'],
                        scrollX: users[key]['currentScrollX'],
                        scrollY: users[key]['currentScrollY']
                    };
                });

                socket.emit('userList', currentPageUsers);
            } else {
                logger.info('wrong private key');
                return;
            }
        });
    } else if (socket.handshake.query.hasOwnProperty('k') && socket.handshake.query.hasOwnProperty('v')) {
        var key = socket.handshake.query.k;
        var visitor = socket.handshake.query.v;
        
        logger.info('User has connected ' + socket.id + ' on domain ' + host + '(' + referer + ')' + ' with key ' + key);

        User.findOne({
            'websites': {$elemMatch: {'url': host, 'publicKey': key}}
        }).select('websites').exec(function(err, user) {
            if (err) {
                logger.error(err);
            }

            if (user) {
                logger.info('website found');

                // filter website
                var website = user.websites.filter(function (website) {
                    return website.publicKey === key;
                }).pop();

                // filter page
                var findPage = website.pages.filter(function (p, index) {
                    return p.page == page;
                }).pop();

                var ua = uaParser(socket.handshake.headers['user-agent']);

                // save user info
                users[socket.id] = {};
                users[socket.id]['tracking'] = [];
                users[socket.id]['websiteId'] = website._id;
                users[socket.id]['userId'] = user._id;
                users[socket.id]['room'] = website._id  + fullUrl;
                users[socket.id]['visitor'] = visitor;
                users[socket.id]['width'] = socket.handshake.query.w;
                users[socket.id]['height'] = socket.handshake.query.h;
                users[socket.id]['scrollX'] = users[socket.id]['currentScrollX'] = socket.handshake.query.x;
                users[socket.id]['scrollY'] = users[socket.id]['currentScrollY'] = socket.handshake.query.y;
                users[socket.id]['createdAt'] = new Date;
                users[socket.id]['ip'] = socket.handshake.address;
                users[socket.id]['browser'] = ua.browser.name + ' ' + ua.browser.major;
                users[socket.id]['os'] = ua.os.name + ' ' + ua.os.version;
                users[socket.id]['device'] = ua.device.vendor !== undefined && ua.device.model !== undefined ? ua.device.vendor + ' ' + ua.device.model : '';
                users[socket.id]['page'] = page;
                users[socket.id]['ready'] = 1;

                // download page content if its loaded for the first time
                if (!findPage) {
                    logger.info('emiting download from ' + socket.id);
                    users[socket.id]['ready'] = 0;
                    socket.emit('download');
                }

                // we will not send data about user who has scaled view
                var send = true;
                if (website.settings.layout == 1 && users[socket.id]['width'] < website.settings.viewportDesktop) send = false;

                // send info about a new user to the users broadcasting live
                if (send) {
                    socket.to(users[socket.id]['room']).emit(
                        'userConnected',
                        {
                            visitor: socket.id,
                            width: users[socket.id]['width'],
                            height: users[socket.id]['height'],
                            scrollX: users[socket.id]['scrollX'],
                            scrollY: users[socket.id]['scrollY']
                        }
                    );
                }

                // new page has been opened so its content needs to be saved
                socket.on('downloadPage', function(data) {
                    var findUser = users[socket.id];
                    
                    User.findOne(
                        {'_id': findUser.userId, 'websites._id': findUser.websiteId}
                    ).select('websites').exec(function(err, user) {
                        var website = user.websites.id(findUser.websiteId);
                        var findPage = website.pages.filter(function (p) {
                            return p.page == findUser.page;
                        }).pop();

                        if (!findPage) {
                            var parsedData = parseWebsite(data, website.url);
                            var item = website.pages.push({page: findUser.page, content: parsedData});
                            user.save(function(err, result) {
                                console.log(result);
                                console.log(err);
                                console.log(item);

                                users[socket.id]['ready'] = 1;

                                logger.info('page %s downloaded', findUser.page);
                            });
                        }
                    });
                });
                

                // user has done some action [1 - movement, 2 - click, 3 - scroll]
                socket.on('action', function(data) {
                    // save user actions
                    if (typeof users[socket.id]['tracking'] !== 'undefined') {
                        users[socket.id]['tracking'].push(data);
                    }

                    // we need to save current scroll position in case somebody will connect live in the middle of user session
                    if (data.type == 3) {
                        users[socket.id]['currentScrollX'] = data.x;
                        users[socket.id]['currentScrollY'] = data.y;
                    }

                    // broadcast live user actions
                    if (users[socket.id]['ready']) {
                        socket.to(users[socket.id]['room']).emit('action', {visitor: socket.id, data: data});
                    }
                });

                // user has disconnected
                socket.on('disconnect', function(data) {
                    logger.info('user ' + socket.id + ' has disconnected');

                    if (typeof users[socket.id] !== 'undefined') {
                        track(users[socket.id]);
                        
                        socket.to(users[socket.id]['room']).emit('userDisconnected', socket.id);

                        delete users[socket.id];
                    }
                });
            } else {
                logger.info('not found');
            }        
        });
    } else {
        return;
    }
});

/**
 * Save session data
 * 
 * @param  object user
 * @return void 
 */
function track(user) {
    if (user && user.tracking && user.tracking.length > 0) {
        Session.collection.insert(
            {
                'visitor': user.visitor,
                'page': user.page,
                'userId': user.userId,
                'websiteId': user.websiteId,
                'meta': {
                    'createdAt': user.createdAt,
                    'width': user.width,
                    'height': user.height,
                    'scrollX': user.scrollX,
                    'scrollY': user.scrollY,
                    'ip': user.ip,
                    'agent': {
                        'browser': user.browser,
                        'os': user.os,
                        'device': user.device
                    }
                },
                'actions': user.tracking
            }, function(err, result) {
            if (err) {
                logger.error(err);
            } else {
                User.findOneAndUpdate({_id: user.userId, 'websites._id': user.websiteId },
                { 
                    $push: {
                        ['websites.$.sessions']: result.ops[0]._id      
                    }
                }, { 'new': true }, function(err, result) {
                    if (err) {
                        logger.error(err);
                    } else {
                        logger.info('tracking inserted');
                    }
                });
            }
        });
    }
}

/**
 * Removes heater load scripts, changes base url for proxy assets loading
 * and converts absolute urls to relative
 * 
 * @param  string data html content
 * @param  string url  url of website
 * @return string      parsed content
 */
function parseWebsite(data, url) {
    var url = url.slice(-1) != '/' ? url + '/' : url;
    var content = data;

    content = content.replace(/\(function\(w,d,u\)[\S\s]*heater\.js'\);/g, '');
    content = content.replace(/heater\('[\S\s]*?'\);/g, '');
    content = content.replace(/<script.*?heater.min.js"><\/script>/, '');
    content = content.replace(/<base.*?>/g, '');
    content = content.replace(/href="\/\//g, 'href="http://');
    content = content.replace(/src="\/\//g, 'src="http://');
    content = content.replace(/src="\//g, 'src="./');
    content = content.replace(/href="\//g, 'href="./');
    content = content.replace(/<head.*?>/, '<head><base href="' + config.appUrl + 'proxy/' + url + '">');

    return content;
}