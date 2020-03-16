/*
 * Create and export configuration variables
 */


// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
	'httpPort':80,
	'httpsPort':443
};

module.exports = environments.staging;
