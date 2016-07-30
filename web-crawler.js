/* Global Variables */
var blocklistSet = new Set();
var assetLoadTimes = new Map();
var assetSentTimes = new Map();
var JSONString = "{assets:[";
var xhr = new XMLHttpRequest();

/* Sherlock Resources & JS */
const disconnectJSON = require('./data/disconnectBlacklist.json');
const disconnectEntitylist = require('./data/disconnectEntitylist.json');
var {allHosts, canonicalizeHost} = require('./js/canonicalize');

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
	    // if the asset is from a blacklisted url, start benchmarking by saving the asset details
	    if(isBlacklisted(details)) {
	    	// save the asset details in our sent Map
			assetSentTimes.set(details.requestId, details);
		}
	}, {urls:["*://*/*"]});

	// Listen for HTTP headers recieved
	browser.webRequest.onHeadersReceived.addListener(function(details) {
	    if(isBlacklisted(details)) {
		    // get the asset details from the sent Map
		    var assetDetails = assetSentTimes.get(details.requestId);
		    // remove it from the sent Map
		    assetSentTimes.delete(details.requestId);
		    // set the asset complete time
		    var neededAssetDetails = { assetCompleteTime:  (Date.now() - assetDetails.timeStamp),
		    	originUrl: canonicalizeHost(parseURI(details.originUrl).host),
		    	adNetworkUrl: canonicalizeHost(parseURI(assetDetails.url).host) };

		    // save the asset details
		    assetLoadTimes.set(details.requestId, neededAssetDetails);
		}
	}, {urls:["*://*/*"]});

		// Every 5 minutes, log our results to a db
	browser.alarms.create("dbsend", {periodInMinutes: 5});
	browser.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === "dbsend") {
			// process our Map store into a JSON string we can send via XMLHTTPRequest
			stringifyAssetStore();
			console.log(JSONString);

			// open XMLHTTPRequest
			xhr.open("POST", "https://ultra-lightbeam.herokuapp.com/log");
			//xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			// making sure our client recieved our results
			xhr.onreadystatechange = function () {
		        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
		        	// output the server's response
		            console.log(xhr.responseText);
		            
		            // reset our assets locally for the next data retreival and dump
					JSONString = "{assets:[";
					assetLoadTimes.clear();
					assetSentTimes.clear();
		        }
		    };

			// send our data as a DOMString
			xhr.send(JSONString);
		}
	});
}

function isBlacklisted(details) {
	var privlegedOrigin = false;
	var hostinBlocklist = false;
	var requestHostMatchesMainFrame = false;
	var requestEntityName;
	
	// canonicalize the origin address
	var unparsedOrigin = parseURI(details.originUrl).host;
	origin = canonicalizeHost(unparsedOrigin);

	// if it is originating from firefox, new window, or newtab, it is definitely not blacklisted
	privlegedOrigin = ((typeof origin !== 'undefined' && origin.includes('moz-nullprincipal')) || origin === '');
	if (privlegedOrigin) {
		// so return false
		return false;
	}

	// canoniocalize the host address
	var unparsedHost = parseURI(details.url).host;
	host = canonicalizeHost(unparsedHost);
    // check if any host from lowest-level to top-level is in the blocklist
    var allRequestHosts = allHosts(host);
    for (let requestHost of allRequestHosts) {
      	hostinBlocklist = blocklistSet.has(requestHost);
      	if (hostinBlocklist) {
        	break;
      	}
	}

	// if it is a request to a 3rd party domain which isn't in the blocklist, return false
	if (!hostinBlocklist) {
		return false;
	}

	// if it is a third party request
	if (origin !== host) {
		// if it is a request to the main frame from a sub frame
		requestHostMatchesMainFrame = details.frameId > 0;
      	if (requestHostMatchesMainFrame) {
      		// we should allow it, so return false
        	return false;
		}

		// determine whether the request origin/host is an allowed property/resource of the entity
		for (var entityName in disconnectEntitylist) {
			var entity = disconnectEntitylist[entityName];
			var requestIsEntityResource = false;
			var originIsEntityProperty = false;

			// check if the host is a resource of the entity
			for (var requestHost of allHosts(host)) {
				// if it is an entity
				requestIsEntityResource = entity.resources.indexOf(host) > -1;
				if (requestIsEntityResource) {
					// take note of its name
					requestEntityName = entityName;
					break;
				}
			}

			// check to see if the origin is a property of the entity
			for (var requestOrigin of allHosts(origin)) {
				originIsEntityProperty = entity.properties.indexOf(origin) > -1;
				if(originIsEntityProperty) {
					break;
				}
			}

			// if our origin is a property and host is a resource of the entity, return false
			if (originIsEntityProperty && requestIsEntityResource) {
				return false;
			}
		}

		// if none of the cases above are reached, we have an element we should block, so return true
		return true;
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
				blocklistSet.add(hostname);
				for(var subDomain in disconnectJSON.categories.Advertising[category][network][hostname]) {
					blocklistSet.add(disconnectJSON.categories.Advertising[category][network][hostname][subDomain]);
				}
			}
		}
	}
}

function stringifyAssetStore() {
	assetLoadTimes.forEach(function (entry, key, map) {
		JSONString = JSONString + JSON.stringify(entry) + ",";
	});

	JSONString = JSONString.substring(0, JSONString.length-1) + "]}";
}

function parseURI(url) {
    var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
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

