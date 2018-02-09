"use strict";

// PORT definition
const PORT = 3000;

// Import the HTTP library
const http = require('http');

// Import the fs library 
const fs = require('fs');

// Import the path library
const path = require('path');

function serveIndex(originalPath, requestedPath, res) {
    fs.exists(path.join(requestedPath, 'index.html'), function(exists){
        if (exists) {
            res.writeHead(302,
                {Location: path.join(originalPath, 'index.html')}
            );
            res.end();
        } else {
            fs.readdir(requestedPath, function(err, files) {
                if(err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end("Server Error");
                }
                var html = "<p>Index of " + originalPath + "</p>";
                html += "<ul>";
                html += files.map(function(item){
                    return "<li><a href='" + path.join(originalPath,item) + "'>" + item + "</a></li>";
                }).join("");
                html += "</ul>";
                res.end(html);
            });
        }
    });
}

/** @function serveFile
 * Serves the specified file with the provided response object
 * @param {string} requestedPath - specifies the file requestedPath to read
 * @param {http.serverResponse} res - the http response object
 */
function serveFile(requestedPath, res) {
    fs.readFile(requestedPath, function(err, data) {
        if(err) {
          console.error(err);
          res.statusCode = 500;
          res.end("Server Error: Could not read file");
          return;
        }
        //Send back the mime type.
        var extension = path.extname('requestedPath');
        switch(extension) {
            case 'html': {
                res.setHeader('Content-Type', 'text/html');
            } break;
            case 'css': {
                res.setHeader('Content-Type', 'text/css');
            } break;
            case 'js': {
                res.setHeader('Content-Type', 'text/js');
            } break;
            case 'jpeg': {
                res.setHeader('Content-Type', 'image/jpeg');
            } break;
            case 'png': {
                res.setHeader('Content-Type', 'image/png');
            } break;
            case 'gif': {
                res.setHeader('Content-Type', 'image/gif');
            } break;
        }
        res.end(data);
    });
}

/** @function handleRequest 
 * Request handler for our http server 
 * @param {http.ClientRequest} req - the http request object
 * @param {http.ServerResponse} res - the http response object
 */
function handleRequest(req, res) {
    //Create requestedPath to the requested item
    var originalPath = req.url;
    var requestedPath = path.join('public', req.url);
    fs.lstat(requestedPath, function (err, stats) {
        if(err) {
            res.statusCode = 404;
            res.end("File Not Found");
            return;
        }
        if (stats.isDirectory()) {
            serveIndex(originalPath, requestedPath, res);
        } else if (stats.isFile()) {
            serveFile(requestedPath, res);
        } else {
            console.error(err);
            res.statusCode = 500;
            res.end("Server Error: Could not read file");
        }
    });
}

// Create the web server
var server = http.createServer(handleRequest);

// Start listening on port PORT
server.listen(PORT, function(){
    console.log("Listening on port " + PORT);
});