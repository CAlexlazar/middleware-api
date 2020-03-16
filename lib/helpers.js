/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
const helpers = {};

// Helpers hash function (SHA256)
helpers.hash = function(str){
	if(typeof (str)=='string'  && str.length > 0){
		let hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
		return hash;
	}else{
		return false;
	}
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject=(str)=>{
	try{
		return JSON.parse(str);
	}catch(e){
		return {};
	}
};

// Create a string of random alphanumeric caracters, of a given length
helpers.createRandomString = (strLength)=>{
	strLength = typeof (strLength)=='number' && strLength>0 ? strLength : false;
	if(strLength){
		//	Define all the possible characters that could go into a string
		let possibleCharacters = 'abcdefghijklmnoprstuvwxyz0123456789';

		// Start the final string
		let str = '';
		for(let i=1;i<=strLength;i++){
			// Get a random character from the possibleCharacters string
			let randomCharacter  = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
			// Append the character to the final string
			str+=randomCharacter;
		}
		return str;
	}else{
		return false;
	}
};

module.exports = helpers;
