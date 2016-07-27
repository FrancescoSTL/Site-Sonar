/* Global Variables */
var blacklistSet = new Set();
var assetLoadTimes = new Map();
var currentAssets = [];
var lastHeaderReceivedTime = Date.now();

/* Sherlock Resources & I/O */
const disconnectJSON = require('./data/disconnectBlacklist.json');
const disconnectEntitylist = require('./data/disconnectEntitylist.json');

// parse our blacklist
parseDisconnectJSON();

// general flow:
// 1. trigger page load
// 2. when page is requested, start listeners and log results
// 3. when page is completed via tabs onupdated, remove sendheaders listener, stop logging results, and set timeout for checking for uncompleted requests
// 4. when timeout completes, remove onheadersrecieved listener, iterate through the logged results, and log them as errors/timeouts
// 5. trigger new page load

// start our listeners
startRequestListeners();

function startRequestListeners() {
	// Listen for HTTP headers sent
	browser.webRequest.onSendHeaders.addListener(function(details) {
	    // parse our URL so that we can grab the hostname
	    var newURL = parseURI(details.url);

	    // if the asset is from a blacklisted url, start benchmarking by saving the asset details
		assetLoadTimes.set(details.requestId, details);
		//console.log(assetLoadTimes.get(details.requestId));
	}, {urls:["*://*/*"]});

	// Listen for HTTP headers recieved
	browser.webRequest.onHeadersReceived.addListener(function(details) {
	    // parse our URL so that we can grab the hostname
	    var newURL = parseURI(details.url);

	    // get the asset details
	    var assetDetails = assetLoadTimes.get(details.requestId);
	    // set the asset complete time
	    assetDetails.assetCompleteTime = (Date.now() - assetDetails.timeStamp);
	    // save the asset details
	    assetLoadTimes.set(details.requestId, assetDetails);
	}, {urls:["*://*/*"]});

	// Listen for page load completion
	browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
		if(changeInfo.status == 'complete') {
			console.log("DONE");
			console.table([...assetLoadTimes].map(function(item) {
				return item[1];
			}));
		}
	});
}

function removeRequestListeners() {
}

/**
* Crawls the specified URL
* @param {string} URL - url of the site to crawl
*/
function crawl() {
    // reset our current assets if we have any from the last site we crawled
    currentAssets = [];

    console.log("DONE");
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
				blacklistSet.add(hostname);
				for(var subDomain in disconnectJSON.categories.Advertising[category][network][hostname]) {
					blacklistSet.add(disconnectJSON.categories.Advertising[category][network][hostname][subDomain]);
				}
			}
		}
	}
}

