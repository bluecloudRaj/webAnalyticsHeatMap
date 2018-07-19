const http = require('http');
const config = require('./../config/app');
const logger = require('./../config/log');

module.exports.load = function(req, res) {
    if (!req.params[0]) res.status(401).send({'error': 'Url not found'});

    var parser = getLocation(req.params[0]);
    var options = {
        host: parser.hostname,
        port: parser.port,
        path: parser.pathname
    };

    http.get(options, function(response) {
        var data = [];

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            var buffer = Buffer.concat(data);

            if (response.headers['content-type'] == 'text/css') {
                buffer = buffer.toString();
                buffer = buffer.replace(/url\("\//g, 'url(' + config.appUrl + 'proxy/' + parser.protocol + '//' + options.host + '/');
                buffer = buffer.replace(/url\(\//g, 'url(' + config.appUrl + 'proxy/' + parser.protocol + '//' + options.host + '/');
            }

            res.set({
              'Content-Type': response.headers['content-type'],
              'Content-Length': response.headers['content-length']
            }).status(200).send(buffer);
        });
    }).on('error', function(e) {
        logger.error(e);
        res.status(404).send('not found');
    });
};

function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}