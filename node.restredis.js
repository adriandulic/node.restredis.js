var fs = require('fs'),
    sys = require('sys'),
    url = require('url'),
    util = require('util'),
    http = require('http'),
    redis = require('./redis'),
    client = redis.createClient();

// start server
http.createServer(dispatch).listen(8080, '127.0.0.1');

// parse request params
function getParams(request){
    return url.parse(request.url, true);
}

// dispatch request by http method
function dispatch(request, response){
    switch(request.method){
        case 'POST':
            doPost(request, response);
            break;
        case 'GET':
            doGet(request, response);
            break;
        case 'PUT':
            doPut(request, response);
            break;
        case 'DELETE':
            doDelete(request, response);
            break;
        default:
            respond(request, response, 500);
    }
}

// handle get request
function doGet(request, response){
    var key = scope(request);
    var host = request.headers['host'];
    var params = getParams(request);
    var pathname = params.pathname.substr(1);
    switch(pathname){
        case '':
            fs.readFile('./public/index.html', function (err, data) {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(data);
            });
            break;
        default:
            client.get(key, function(err, val){
                if(val === null){
                    respond(request, response, 404, 'Specified key does not exists.');
                } else {
                    respond(request, response, 200, val);
                }
            });
    }
}

// handle post request
function doPost(request, response){
    var data = []
    var key = scope(request);
    request.on('data', function(chunk){
        data.push(chunk);
    });
    request.on('end', function(){
        data = data.join('');
        client.exists(key, function(err, val){
            if(val === 0){
                client.set(key, data, function(err, val){
                    if(val === 'OK'){
                        respond(request, response, 200, val);
                    } else {
                        respond(request, response, 500);
                    }
                });
            } else {
                respond(request, response, 400, 'Specified key already exists.');
            }
        });
    });
}

// handle put request
function doPut(request, response){
    var data = []
    var key = scope(request);
    request.on('data', function(chunk){
        data.push(chunk);
    });
    request.on('end', function(){
        data = data.join('');
        client.exists(key, function(err, val){
            if(val === 1){
                client.set(key, data, function(err, val){
                    if(val === 'OK'){
                        respond(request, response, 200, val);
                    } else {
                        respond(request, response, 500);
                    }
                });
            } else {
                respond(request, response, 404, 'Specified key does not exist.');
            }
        });
    });
}

// handle delete request
function doDelete(request, response){
    var key = scope(request);
    client.exists(key, function(err, val){
        if(val === 1){
            client.del(key, function(err, val){
                if(val === 1){
                    respond(request, response, 200, val);
                } else {
                    respond(request, response, 500);
                }
            });
        } else {
            respond(request, response, 404, 'Specified key does not exist.');
        }
    });
}

function respond(request, response, code, msg){
    response.writeHead(code === undefined ? 400 : code, {'Content-Type': 'text/plain'});
    response.end(msg === undefined ? code.toString() : msg + '\n');
}

function scope(request){
    var params = getParams(request);
    var host = request.headers["host"];
    var pathname = params.pathname.substr(1);
    return host + ':' + pathname;
}
