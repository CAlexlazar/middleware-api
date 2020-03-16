/**
 * Server module
 */
// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const helpers = require('./helpers');
const handlers = require('./handlers');
let path = require('path');
let util = require('util');


// Instantiate the server module object
let server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res)=>{
	server.unifiedServer(req, res);
});
server.httpsServerOptions = {
	'key'  : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
};
// Instantiate the HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions, (req,res)=>{
	server.unifiedServer(req,res);
});
// All the server logic for both the http and https Create server
server.unifiedServer = function(req,res){

	// Get the URL and parse it
	let parsedUrl = url.parse(req.url,true);

	// Get the path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\?+$/g,'');

	// Get the query string as an object
	let queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	let method = req.method.toLowerCase();

	// Get the headers as an object
	let headers = req.headers;
	// Get the payload if any
	let decoder = new stringDecoder('utf-8');
	let buffer = '';
	req.on('data',function(data){
		buffer+=decoder.write(data);
	});
	req.on('end',function(){
		buffer += decoder.end();
		// console.log(buffer);
		// Choose the handler this request should go to. If one is not found default to the not found handler
		let chosenHandler = typeof(server.router[trimmedPath])!=='undefined'?server.router[trimmedPath]:handlers.ping;

		// Construct the data object to send to the handler
		let data = {
			'trimmedPath':trimmedPath,
			'queryStringObject':queryStringObject,
			'method':method,
			'headers':headers,
			'payload':helpers.parseJsonToObject(buffer)
		};
		// Route the request to the handler specified in the router
		chosenHandler(data,function(statusCode,payload){
			// console.log(payload);
			//    Use the status code called back by the handler, or default to 200
			statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
			//    Use the payload called back by the handler, or default to an empty object
			payload = typeof (payload) == 'object' ? payload : {};

			//    Convert the payload to a string
			let payloadString = JSON.stringify(payload);
			//    Return the response
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader("Access-Control-Allow-Credentials", "true");
			res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
			res.setHeader("Access-Control-Allow-Headers", "*");
			// res.writeHead(statusCode);
			res.end(payloadString);
		});
	});
};

// Define a request router
server.router = {
	'fan': handlers.fan,
	'smartBill': handlers.smartBill,
	'smartBillGet': handlers.smartBillGet,
	'fanGetAwb': handlers.fanGetAwb,
	'ping': handlers.ping,
};

// Server init
server.init = () => {
//	 Start the http server
	// Start the http server on the port defined in the config
	server.httpServer.listen(config.httpPort, function(){
		console.log('\x1b[35m%s\x1b[0m',"The server is listening on port ", config.httpPort);
	});
	server.httpsServer.listen(config.httpsPort, function(){
		console.log('\x1b[35m%s\x1b[0m',"The server is listening on port ", config.httpsPort);
	});
};


// Export the module
module.exports = server;
