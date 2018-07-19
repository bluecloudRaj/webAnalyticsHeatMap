const mongoose = require('mongoose');
const User = mongoose.model('User');
const Session = mongoose.model('Session');
const crypto = require('crypto');
const helpers = require('./../helpers/helpers');
const logger = require('./../config/log');

module.exports.getWebsites = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findById(req.payload._id)
            .select('websites._id websites.url websites.publicKey websites.privateKey websites.settings')
            .exec(function(err, user) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }

                if (user) {
                    res.status(200).json(user.websites);
                } else {
                    res.status(500).json({'message': 'Unknown user'});
                }
            });
    }
};

module.exports.createWebsite = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findById(req.payload._id).exec(function(err, user) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            var publicKey = crypto.randomBytes(16).toString('hex');
            var privateKey = crypto.randomBytes(48).toString('hex');
            
            if (req.body.url.slice(-1) != '/') {
                req.body.url += '/';
            }

            var item = user.websites.push({
                'url': req.body.url,
                'publicKey': publicKey,
                'privateKey': privateKey
            });
            
            user.save(function (err) {
                if (err) {
                    logger.error(err);
                    res.status(500).send({'message': helpers.errorMessages(err)});
                }
                
                res.status(200).send({'message': 'Website has been sucessfully created', 'id': user.websites[item-1]._id});
            });
        });
    }
};

module.exports.getWebsite = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findOne({'_id': req.payload._id}, {'websites': {$elemMatch: {'_id': req.params.id}}})
            .select('websites._id websites.url websites.publicKey websites.privateKey websites.settings')
            .exec(function(err, user) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }

                if (user.websites.length == 0) {
                    return res.status(500).send({'message': 'Access denied'});
                } else {
                    res.status(200).send({'website': user.websites[0]});
                }
            });
    }
};

module.exports.updateWebsite = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findOne({'_id': req.payload._id, 'websites._id': req.params.id}).exec(function(err, user) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            user.websites.id(req.params.id).settings.viewportDesktop = req.body.viewportDesktop;

            user.save(function (err) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }
                
                res.status(200).send({'message': 'Website has been sucessfully updated'});
            });
        });
    }
};

module.exports.deleteWebsite = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findOne({'_id': req.payload._id, 'websites._id': req.params.id}).exec(function(err, user) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            user.websites.id(req.params.id).remove();
            user.save(function (err) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }
                
                res.status(200).send({'message': 'Website has been sucessfully deleted'});
            });
        });
    }
};

module.exports.getSessions = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var skip = parseInt(req.query.offset);
        var limit = parseInt(req.query.limit);

        // @todo replace with direct Session.find and remove references from user model
        User.aggregate([{
            $match: {
                '_id': userId,
                'websites._id': websiteId 
            }
        }, {
            $unwind: '$websites'
        }, {
            $unwind: '$websites.sessions'
        }, {
            $match: {
                'websites._id': websiteId
            }
        }, {
          $lookup: {
            from: 'sessions',
            localField: 'websites.sessions',
            foreignField: '_id',
            as: 'session'
          }
        }, {
            $unwind: '$session'
        }, {
            $project: {
                _id: '$session._id',
                visitor: '$session.visitor',
                page: '$session.page',
                meta: '$session.meta'
            }
        }, {
            $sort: {
                'meta.createdAt': -1
            }
        }, {
            $skip: parseInt(skip)
        }, {
            $limit: parseInt(limit)
        }], function(err, sessions) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            res.status(200).send({'sessions': sessions})
        });
    }
};

module.exports.getSessionsCount = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);

        User.aggregate([{
            $match: {
                '_id': userId,
                'websites._id': websiteId 
            }
        }, {
            $unwind: '$websites'
        }, {
            $unwind: '$websites.sessions'
        }, {
            $match: {
                'websites._id': websiteId
            }
        }, { 
            $group: {
                _id: 0,
                count: { $sum: 1 }
            }
        }], function(err, data) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            if (data.length == 0) {
                res.status(200).send({'count': 0})
            } else {
                res.status(200).send({'count': data[0].count})
            }
        });
    }
};

module.exports.getSession = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var sessionId = req.params.sid;

        Session.findOne({'_id': sessionId, 'userId': userId})
                .exec(function(err, session) {
                     if (err) {
                        logger.error(err);
                        return res.status(500).send({'message': helpers.errorMessages(err)});
                    }

                    User.findOne({'_id': userId, 'websites': {$elemMatch: {'_id': websiteId}}})
                        .select('websites.$.pages')
                        .exec(function(err, user) {
                            if (err) {
                                logger.error(err);
                                return res.status(500).send({'message': helpers.errorMessages(err)});
                            }

                            var page = user.websites[0].pages.filter(p => p.page === session.page).pop();

                            res.status(200).send({'page': page, 'session': session});
                        });
                });
    }
};

module.exports.deleteSession = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findOneAndUpdate({_id: req.payload._id, 'websites.sessions': req.params.id},
            { 
                $pull: {
                    ['websites.$.sessions']: req.params.id
                }
            }
        , function(err, result) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            if (!result) {
                res.status(500).send({'message': 'An error has occured'});
            } else {
                Session.findOne({_id: req.params.id}).remove(function(err , result) {
                    res.status(200).send({'message': 'Session has been sucessfully deleted'});
                });
            }
        });
    }
};

module.exports.getWebsitePages = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        User.findOne({'_id': req.payload._id}, {'websites': {$elemMatch: {'_id': req.params.id}}})
            .select('websites.settings websites.privateKey websites.pages._id websites.pages.page')
            .exec(function(err, user) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }

                res.status(200).send({'website': user.websites[0]});
            });
    }
};

module.exports.getWebsitePageActions = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var page = req.query.page;
        const dimension = 25;

        User.findOne({'_id': req.payload._id}, {'websites': {$elemMatch: {'_id': req.params.id}}})
            .select('websites.settings')
            .exec(function(err, user) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send({'message': helpers.errorMessages(err)});
                }

                var website = user.websites[0];

                if (website.settings.layout == 1) {
                    Session.find({'page': page, 'websiteId': websiteId, $where: "this.meta.width >= " + website.settings.viewportDesktop})
                        .exec(function(err, sessions) {
                            if (err) {
                                logger.error(err);
                                return res.status(500).send({'message': helpers.errorMessages(err)});
                            }

                            const data = [];
                            const matrix = [];
                            var maxMovement = 0;
                            var maxClick = 0;

                            // create matrix of movements and clicks
                            for (let i = 0; i < sessions.length; i++) {
                                const session = sessions[i];

                                let scaleX = 1;
                                let scaleY = 1;

                                let scrollX = session.meta.scrollX;
                                let scrollY = session.meta.scrollY;

                                for (let j = 0; j < session.actions.length; j++) {
                                    const action = session.actions[j];

                                    if (action.type !== 3) {
                                        action.x += (req.params.width - session.meta.width) / 2;

                                        const x = Math.floor(( (action.x + scrollX) * scaleX ) / dimension);
                                        const y = Math.floor(( (action.y + scrollY) * scaleY ) / dimension);

                                        if (!matrix[x]) matrix[x] = [];
                                        if (!matrix[x][y]) matrix[x][y] = [0, 0];

                                        if (action.type == 1) {
                                            matrix[x][y][0]++;
                                            if (matrix[x][y][0] > maxMovement) maxMovement = matrix[x][y][0];
                                        } else if (action.type == 2) {
                                            matrix[x][y][1]++;
                                            if (matrix[x][y][1] > maxClick) maxClick = matrix[x][y][1];
                                        }
                                    } else {
                                        scrollX = action.x;
                                        scrollY = action.y;
                                    }
                                }
                            }

                            const output = [];
                            for (let i = 0; i < matrix.length; i++) {
                                if (matrix[i]) {
                                    for (let j = 0; j < matrix[i].length; j++) {
                                        if (matrix[i][j] && (matrix[i][j][0] != 0 || matrix[i][j][1] != 0)) {
                                            data.push({x: i * dimension, y: j * dimension, m: matrix[i][j][0] / maxMovement, c: matrix[i][j][1] / maxClick});
                                        }
                                    }
                                }
                            }
                            
                            res.status(200).json({'sessions': data})
                    });
                } else {
                    Session.find({'page': page, 'websiteId': websiteId})
                        .exec(function(err, sessions) {
                            if (err) {
                                logger.error(err);
                                return res.status(500).send({'message': helpers.errorMessages(err)});
                            }

                            const data = [];
                            const matrix = [];
                            var maxMovement = 0;
                            var maxClick = 0;

                            // create matrix of movements and clicks
                            for (let i = 0; i < sessions.length; i++) {
                                const session = sessions[i];

                                let scaleX = req.params.width / session.meta.width;
                                let scaleY = req.params.height / session.meta.height;

                                let scrollX = session.meta.scrollX;
                                let scrollY = session.meta.scrollY;

                                for (let j = 0; j < session.actions.length; j++) {
                                    const action = session.actions[j];

                                    if (action.type !== 3) {
                                        action.x += (req.params.width - session.meta.width) / 2;

                                        const x = Math.floor(( (action.x + scrollX) * scaleX ) / dimension);
                                        const y = Math.floor(( (action.y + scrollY) * scaleY ) / dimension);

                                        if (!matrix[x]) matrix[x] = [];
                                        if (!matrix[x][y]) matrix[x][y] = [0, 0];

                                        if (action.type == 1) {
                                            matrix[x][y][0]++;
                                            if (matrix[x][y][0] > maxMovement) maxMovement = matrix[x][y][0];
                                        } else if (action.type == 2) {
                                            matrix[x][y][1]++;
                                            if (matrix[x][y][1] > maxClick) maxClick = matrix[x][y][1];
                                        }
                                    } else {
                                        scrollX = action.x;
                                        scrollY = action.y;
                                    }
                                }
                            }

                            const output = [];
                            for (let i = 0; i < matrix.length; i++) {
                                if (matrix[i]) {
                                    for (let j = 0; j < matrix[i].length; j++) {
                                        if (matrix[i][j] && (matrix[i][j][0] != 0 || matrix[i][j][1] != 0)) {
                                            data.push({x: i * dimension, y: j * dimension, m: matrix[i][j][0] / maxMovement, c: matrix[i][j][1] / maxClick});
                                        }
                                    }
                                }
                            }
                            
                            res.status(200).send({'sessions': data})
                        });
                }
            });
    }
};

module.exports.getWebsitePageContent = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var page = req.query.page;

        User.aggregate([{
            $match: {
                '_id': userId,
                'websites._id': websiteId,
                'websites.pages.page': page,
            }
        }, {
            $unwind: '$websites'
        }, {
            $unwind: '$websites.pages'
        }, {
            $match: {
                'websites._id': websiteId,
                'websites.pages.page': page
            }
        }, {
            $project: {
                content: '$websites.pages.content'}
        }], function(err, data) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }
            
            if (data.length == 0) {
                logger.error('page content error' + data);
            } else {
                res.status(200).send({'content': data[0].content})
            }
        });
    }
};

module.exports.getWebsitePageSuggestions = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var page = req.query.page;
        var suggestions = [];

        Session.aggregate([{
            $match: {
                'userId': userId,
                'websiteId': websiteId,
                'page': page,
            }
        }, {
            $project: {
                _id: '$_id',
                visitor: '$wvisitor',
                page: '$page',
                meta: '$meta',
                actions: '$actions',
            }
        }], function(err, sessions) {
            if (err) {
                logger.error(err);
                return res.status(500).send({'message': helpers.errorMessages(err)});
            }

            var total = sessions.length;
            if (total > 0) {
                var time = 0;
                var clicks = 0;
                var scrolls = 0;
                sessions.forEach(function(session) {
                    var length = session.actions.length;
                    if (length > 1) {
                        var start = new Date(session.actions[0].createdAt).getTime();
                        var end = new Date(session.actions[length-1].createdAt).getTime()
                        time += (end - start) / 1000;

                        var click = 0;
                        var scroll = 0;
                        session.actions.some(function(action) {
                            if (action.type == 2) {
                                click = 1;
                            } else if (action.type == 3) {
                                scroll = 1;
                            }

                            return click == 1 && scroll == 1;
                        });

                        if (click) clicks++;
                        if (scroll) scrolls++;
                    }
                });

                if (time / total <= 10) {
                    suggestions.push('Your visitors don\'t spent much time on your page. Try to attract them more with graphics, texts and more interesting content.');
                }

                if (clicks == 0 || clicks / total <= 0.4) {
                    suggestions.push('Your visitors don\'t click much on links. Try to make them more visible and improve your navigation.');
                }

                if (scrolls == 0 || scrolls / total <= 0.4) {
                    suggestions.push('Your visitors don\'t scroll much. Don\'t be afraid of putting some secondary content to the middle/bottom of your page.');
                }
            }

            res.status(200).send({'suggestions': suggestions});
        });
    }
};

module.exports.getWebsiteVisitors = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var websiteId = mongoose.Types.ObjectId(req.params.id);

        Session.aggregate([{
            $match: {
                'userId': userId,
                'websiteId': websiteId
            }
        }, {
            $group: {
                _id: '$visitor',
            }
        }], function(err, data) {
            if (err) {
                logger.error(err);
                res.status(500).send({'message': helpers.errorMessages(err)});
            } else {
                res.status(200).send({'visitors': data});
            }
        });
    }
};

module.exports.getVisitorSessions = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({'message': 'UnauthorizedError: private data'});
    } else {
        var userId = mongoose.Types.ObjectId(req.payload._id);
        var websiteId = mongoose.Types.ObjectId(req.params.id);
        var visitorId = req.params.vid;

        Session.aggregate([{
            $match: {
                'userId': userId,
                'websiteId': websiteId,
                'visitor': visitorId
            }
        }, {
            $project: {
                _id: '$_id',
                visitor: '$visitor',
                page: '$page',
                meta: '$meta',
                actionFirst: {$slice: ['$actions', 1]},
                actionLast: {$slice: ['$actions', -1]},
            }
        }, {
            $sort: {
                '_id': -1
            }
        }], function(err, data) {
            if (err) {
                logger.error(err);
                res.status(500).send({'message': helpers.errorMessages(err)});
            } else {
                res.status(200).send({'sessions': data});
            }
        });
    }
};
