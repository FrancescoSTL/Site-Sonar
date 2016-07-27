/* Node libraries */
var fs = require('sdk/fs/path');

/* Add-on SDK Libraries */
let { Cc, Ci, Cu } = require('chrome');
var tabs = require("sdk/tabs");
var {WebRequest} = Cu.import('resource://gre/modules/WebRequest.jsm');

/* Node Modules */
var URL = require('url-parse');

/* Sherlock Resources & I/O */
const {loadLists} = require('./lists');
const disconnectJSON = require('./data/disconnectBlacklist.json');
var resultLogs = 'data/resultLogs.txt';

/* Global Variables */
var disconnectSet = new Set();
var assetLoadTimes = new Map();
var currentAssets = [];
var lastHeaderRecievedTime = Date.now();

// init readline object
/*var rl = readline.createInterface({
    terminal: false, 
    input: fs.createReadStream('data/crawl-list')
});*/

// erase any leftover junk from our results log
//fs.writeFile(resultLogs, '');

// parase our blacklist into a set
parseDisconnectJSON();

// read each line in our crawl-list
/*rl.on('line', function (URL) {
	crawl(URL);
});*/

crawl('http://ksdk.com');

function startListeners(state) {
    //console.log(state);
    // Listen for HTTP headers sent
    this.WebRequest.onSendHeaders.addListener(function(details) {
        // parse our URL so that we can grab the hostname
        var newURL = parseURI(details.url);

        // if the asset is from a blacklisted url, start benchmarking by recording header sent time
        if (isBlacklisted(newURL.host)) {
            assetLoadTimes.set(details.requestId, Date.now());
        }
    });

    // Listen for HTTP headers recieved
    this.WebRequest.onHeadersReceived.addListener(function(details) {
        // parse our URL so that we can grab the hostname
        var newURL = parseURI(details.url);
                console.log(newURL.host);

        console.log(newURL.host);
        console.log(details);
        
        // if the asset is from a blacklisted url, finish benchmarking by recording the time elapsed since we sent the header to the time we recieved it
        if (isBlacklisted(newURL.host)) {
            

            /*var assetSentTime = assetLoadTimes(details.requestId);
            assetLoadTimes.set(details.requestId, (Date.now() - assetSentTime));*/
        }

        // keep logging our assets until there has been more than 1 second since the last header was recieved
        if ((Date.now() - lastHeaderRecievedTime)  >= 1000) {
            // if we've finished loading content on this page, close the current tab and crawl the next page in our list
            console.log("no more");
            //console.log(assetLoadTimes);
        } else {
            // if we haven't finished loading content, check to see if the header we recieved is an ad
            lastHeaderRecievedTime = Date.now();
        }
    });
}

/**
* Crawls the specified URL
* @param {string} URL - url of the site to crawl
*/
function crawl(URL) {
    // reset our current assets if we have any from the last site we crawled
    currentAssets = [];

    // crawl that website
    tabs.open(URL);
}

/**
* Check if a URL is contained within Disconnect's list of ad domains
*/
function isBlacklisted(url) {
	if (disconnectSet.has(url)) {
		return true;
	} else {
		return false;
	}
}

function parseURI(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
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
