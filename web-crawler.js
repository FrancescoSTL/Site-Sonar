/* Node libraries */
var fs = require('fs');
var readline = require('readline');

/* Node Modules */
var cheerio = require('cheerio');
var request = require('request');
var URL = require('url-parse');

var disconnectJSON = require('./data/disconnectList.json');
var disconnectSet = new Set();
var currentAssets = [];
var resultLogs = 'data/resultLogs.txt';

// init readline object
var rl = readline.createInterface({
    terminal: false, 
    input: fs.createReadStream('data/crawl-list')
});

// erase any leftover junk from our results log
fs.writeFile(resultLogs, '');

// parase our blacklist into a set
parseDisconnectJSON();

// read each line in our crawl-list
rl.on('line', function (URL) {
	crawl(URL);
});

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
            //console.log('Error: ' + error);
        }
        // if not, grab all asset urls from the DOM
        else if(response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);

            findAssets($);
            currentAssets = currentAssets.filter(filterAssets);
            testAssets();
        }
    });
}

/**
* Adds all assets from the passed DOM object to the currentAssets array
* @param {object} $ - DOM object for current URL we are crawling
*/
function findAssets($) {
    // compile all script assets
    $('script, img, iframe').each(function() {
        var src = $(this).prop('src');
        if(src !== undefined && src.indexOf('http') !== -1) {
            currentAssets.push(src);
        }
    });

    // compile all object assets
    $('object').each(function() {
        var src = $(this).prop('data');
        if(src !== undefined && src.indexOf('http') !== -1) {
            currentAssets.push(src);
        }
    });
}

/**
* Filter our list of assets based upon Disconnect's list of ad domains
*/
function filterAssets(checkURL) {
	var url = new URL(checkURL);
	console.log(url.host);
	if (disconnectSet.has(url.host)) {
		
		return true;
	} else {
		return false;
	}
}

/**
* Loads all asset URLs currently in the currentAssets array and denotes their time in milliseconds
*/
function testAssets() {
    // currently, it seems as though this is running asynchronously, but we'd like the requests to be syncrhonous.
    // we can attempt this with https://github.com/abbr/deasync

    // loop through all assets we need to time test
    for(var n in currentAssets) {
        // crawl that website
        request({uri: currentAssets[n], time: true}, function(error, response) {
            if(!error) {
                fs.appendFile(resultLogs, '\n' + response.elapsedTime + ' ' +response.request.uri.href);
            }
        });
    }
}

/**
* Parses our disconnect JSON into a set of blacklisted hostname + subdomain urls
*/
function parseDisconnectJSON() {
	// parse our disconnect JSON into a set where we only include the hostname and subdomain urls
	for(var category in disconnectJSON.categories.Advertising) {
		for(var network in disconnectJSON.categories.Advertising[category]) {
			for(var hostname in disconnectJSON.categories.Advertising[category][network]) {
				disconnectSet.add(hostname);
				for(var subDomain in disconnectJSON.categories.Advertising[category][network][hostname]) {
					disconnectSet.add(disconnectJSON.categories.Advertising[category][network][hostname][subDomain]);
				}
			}
		}
	}
}
