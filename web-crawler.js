/* Node libraries */
var fs = require('fs');
var readline = require('readline');

/* Node Modules */
var cheerio = require('cheerio');
var request = require('request');
var URL = require('url-parse');

var disconnectList = require('./disconnectList.json');
var currentAssets = [];
var resultLogs = 'resultLogs.txt'

// init readline object
var rl = readline.createInterface({
    terminal: false, 
    input: fs.createReadStream('crawl-list')
});

fs.writeFile(resultLogs, '');

// read each line in our crawl-list
/*rl.on('line', function (URL) {
	crawl(URL);
});*/

crawl('http://www.redtube.com/');

/**
* Crawls the specified URL
* @param {string} URL - url of the site to crawl
*/
function crawl(URL) {
	// reset our current assets if we have any from the last site we crawled
	currentAssets = [];

	// crawl that website
	request({uri: URL, time: true}, function(error, response, body) {
		// in the event that we are thrown an error, log it
		if(error) {
     		console.log("Error: " + error);
   		}
   		// if not, grab all asset urls from the DOM
   		else if(response.statusCode === 200) {
		    // Parse the document body
		    var $ = cheerio.load(body);

		    findAssets($);
		    //filterAssets();
		    testAssets();
		    
		    //console.log(currentAssets);
	    }
	});
}

/**
* Adds all assets from the passed DOM object to the currentAssets array
* @param {object} $ - DOM object for current URL we are crawling
*/
function findAssets($) {
	// compile all image assets
	$('img').each(function(i, elem) {
		var src = $(this).prop('src');
		if(src !== undefined && src.indexOf("http") !== -1) {
			currentAssets.push(src);
		}
	});

	// compile all script assets
	$('script').each(function(i, elem) {
		var src = $(this).prop('src');
		if(src !== undefined && src.indexOf("http") !== -1) {
			currentAssets.push(src);
		}
	});

	// compile all iframe assets
	$('iframe').each(function(i, elem) {
		var src = $(this).prop('src');
		if(src !== undefined && src.indexOf("http") !== -1) {
			currentAssets.push(src);
		}
	});

	// compile all object assets
	$('object').each(function(i, elem) {
		var src = $(this).prop('data');
		if(src !== undefined && src.indexOf("http") !== -1) {
			currentAssets.push(src);
		}
	});
}

/**
* Filter our list of assets based upon Disconnect's list of ad domains
*/
function filterAssets() {

}

/**
* Loads all asset URLs currently in the currentAssets array and denotes their time in milliseconds
*/
function testAssets() {
	// currently, it seems as though this is running asynchronously, but we'd like the requests to be syncrhonous.
	// we can attempt this with https://github.com/abbr/deasync

	// loop through all assets we need to time test
	for(n in currentAssets) {
		// crawl that website
		request({uri: currentAssets[n], time: true}, function(error, response, body) {
			if(!error) {
				fs.appendFile(resultLogs, "\n" + response.elapsedTime + " " +response.request.uri.href);
			}
		});
	}
}
