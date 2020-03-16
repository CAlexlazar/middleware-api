/**
 * Main app entry
 */

// Dependency req
const server = require('./lib/server');

// Declare the app container
let app ={};

// Init Function
app.init = ()=>{
	server.init();
};

// Execute
app.init();

// Export the app
module.exports = app;

