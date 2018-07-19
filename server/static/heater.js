// const appUrl = 'http://heater.dev.ebase.sk:5001/';
const appUrl = 'http://localhost:5001/';

function loadScripts(scripts, callback) {
    var load = function(item) {
        if (!item[1]) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = item[0];

            var next = scripts.shift();
            if ( next ) {
                script.onload = load(next);
            } else {
                script.onload = script.onreadystatechange = function() {
                    callback();
                }
            }

            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            var next = scripts.shift();
            if ( next ) {
                load(next);
            } else {
                callback();
            }
        }
    }

    load(scripts.shift());
}

loadScripts([
    ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min.js', window.jQuery],
    // ['https://cdn.socket.io/socket.io-1.7.3.js', window.io]
    [appUrl + 'socket.io/socket.io.js', window.io]
], function() {
    var visitor = localStorage.getItem('heaterId');
    if (!visitor) {
        visitor = 'xxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        localStorage.setItem('heaterId', visitor);
    }

    // make sure chrome is not only trying to prerender page
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === 'complete' && document.visibilityState != 'prerender') {
            clearInterval(readyStateCheckInterval);
            init(visitor);
        }
    }, 10);
});

function init(visitor) {
    setTimeout(function() {
        var socket = io.connect(
            appUrl,
            {query: 'k=' + heater.key + '&v=' + visitor + '&w=' + $(window).width() + '&h=' + $(window).height() + '&x=' + $(window).scrollLeft() + '&y=' + $(window).scrollTop()}
        );

        socket.on('connect', function() {

            socket.on('download', function() {
                var node = document.doctype;
                if (node) {
                    var doctype = "<!DOCTYPE "
                         + node.name
                         + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                         + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
                         + (node.systemId ? ' "' + node.systemId + '"' : '')
                         + '>';
                } else {
                    var doctype = '';
                }
                

                socket.emit('downloadPage', doctype + document.documentElement.outerHTML);
            });
            

            var lastUpdated = Date.now();
            var lastX = 0;
            var lastY = 0;
            var timeout = null;

            $(document).mousemove(function(e) {
                var posX = e.pageX - $(window).scrollLeft();
                var posY = e.pageY - $(window).scrollTop();

                if (Date.now() - lastUpdated > 100 && (lastX != posX || lastY != posY)) {
                    lastUpdated = Date.now();

                    socket.emit('action', {
                        'type': 1,
                        'x': posX,
                        'y': posY,
                        'createdAt': new Date()
                    });

                    lastX = posX;
                    lastY = posY;
                }
            });

            $(document).click(function(e) {
                socket.emit('action', {
                    'type': 2,
                    'x': e.pageX - $(window).scrollLeft(),
                    'y': e.pageY - $(window).scrollTop(),
                    'createdAt': new Date()
                });
            });

            $(window).scroll(function(e) {
                if (!timeout) {
                    timeout = setTimeout(function () {          
                        clearTimeout(timeout);
                        timeout = null;
                        socket.emit('action', {
                            'type': 3,
                            'x': $(window).scrollLeft(),
                            'y': $(window).scrollTop(),
                            'createdAt': new Date()
                        });
                    }, 250);
                }
            });
        });
    
    }, 100);
}