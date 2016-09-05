/* Global Variables */
var blocklistSet = new Set();
var assetLoadTimes = new Map();
var assetSentTimes = new Map();
var profileStorage = new Map();
var mainFrameOriginTopHosts = {};
var totalAssetCount = 0;
var totalFileSize = 0;
var totalNetworkTime = 0;
var lastAssetCount = 0;
var lastFileSize = 0;
var lastNetworkTime = 0;
var profiling = false;

/* Sherlock Resources & JS */
const disconnectJSON = require('./data/disconnectBlacklist.json');
const disconnectEntitylist = require('./data/disconnectEntitylist.json');
var {allHosts, canonicalizeHost} = require('./js/canonicalize');

// parse our blacklist
parseDisconnectJSON();

// start our request listeners
startRequestListeners();

// initialize our previously stored benchmark vars
initStorage();

function initStorage() {
    chrome.storage.local.get({ overviewBenchmarks: {} }, function (benchmarks) {
        var overviewBenchmarks = benchmarks.overviewBenchmarks;

        // update the batch's overview bechmarks
        totalFileSize = (typeof overviewBenchmarks.fileSize !== 'undefined') ? overviewBenchmarks.fileSize : totalFileSize;
        totalNetworkTime = (typeof overviewBenchmarks.networkTime !== 'undefined') ? overviewBenchmarks.networkTime : totalNetworkTime;
        totalAssetCount = (typeof overviewBenchmarks.assetCount !== 'undefined') ? overviewBenchmarks.assetCount : totalAssetCount;
    });
}

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
        if(assetSentTimes.get(details.requestId) && assetSentTimes.get(details.requestId).url && assetSentTimes.get(details.requestId).originUrl) {
            // get the asset details from the sent Map
            var assetDetails = assetSentTimes.get(details.requestId);
            var assetAdHost = canonicalizeHost(parseURI(assetDetails.url).hostname);
            var assetBenchmark = (details.timeStamp - assetDetails.timeStamp);
            var assetOriginUrl = canonicalizeHost(parseURI(details.originUrl).hostname);
            var asset;
            var assetSize;
            var assetAdNetwork;

            // get the size of the asset we loaded
            details.responseHeaders.forEach(function(headItem){
                if(headItem.name == 'Content-Length') {
                    assetSize = headItem.value;
                }
            });

            // filter out all 0's as nulls, and parse all non-zero filesizes as integers
            assetSize = (parseInt(assetSize) === 0 || !parseInt(assetSize)) ? null : parseInt(assetSize);

            //get the ad network for the ad host in our request
            assetAdNetwork = getAdNetwork(assetAdHost);

            // remove it from the sent Map
            assetSentTimes.delete(details.requestId);
            
            browser.tabs.get(details.tabId, function (tab) {
                var host = canonicalizeHost(parseURI(tab.url).hostname);

                // filter out www. from domains
                if (host.startsWith("www.")) {
                    host = host.substring(4, host.length);
                }

                // filter out www. from domains
                if (assetOriginUrl.substring(0, 4) === "www.") {
                    assetOriginUrl = assetOriginUrl.substring(4, assetOriginUrl.length);
                }

                // so long as the domain isn't a locally hosted domain
                if (!host.includes("localhost")) {
                    // set the asset complete time
                    var neededAssetDetails = { assetCompleteTime: assetBenchmark,
                        originUrl: assetOriginUrl,
                        hostUrl: host,
                        adNetworkUrl: assetAdHost,
                        assetType: details.type,
                        fileSize: assetSize,
                        timeStamp: details.timeStamp,
                        method: details.method,
                        statusCode: details.statusCode,
                        adNetwork: assetAdNetwork };

                    // save the asset details
                    assetLoadTimes.set(details.requestId, neededAssetDetails);

                    // increment the high level benchmarks for this batch
                    totalAssetCount++;
                    totalFileSize += assetSize;
                    totalNetworkTime += assetBenchmark;

                    // if we are supposed to be profiling currently, add this record to our profiling Map
                    if (profiling) {
                        profileStorage.set(details.requestId, neededAssetDetails);
                    }
                }
            });
        }
    }, {urls:["*://*/*"]}, ["responseHeaders"]);

    // Every 5 minutes, log our results to a db
    browser.alarms.create("dbsend", {periodInMinutes: 2});
    browser.alarms.onAlarm.addListener(function (alarm) {
        /*** Deal with our locally stored benchmark data dump ***/

        // get our current locally stored asset benchmarks
        chrome.storage.local.get({ assetBenchmarks: [], overviewBenchmarks: {} }, function (benchmarks) {
            var assetBenchmarks = benchmarks.assetBenchmarks;

            // add all individual benchmarks since our last storage to the array of local benchmarks
            assetLoadTimes.forEach(function (value, key, map) {
                assetBenchmarks.push(value);                    
            });

            var overviewBenchmarks = benchmarks.overviewBenchmarks;

            // update the batch's overview bechmarks
            overviewBenchmarks.fileSize = (typeof overviewBenchmarks.fileSize === 'undefined') ? totalFileSize : overviewBenchmarks.fileSize + totalFileSize;
            overviewBenchmarks.networkTime = (typeof overviewBenchmarks.networkTime === 'undefined') ? totalNetworkTime : overviewBenchmarks.networkTime + totalNetworkTime;
            overviewBenchmarks.assetCount = (typeof overviewBenchmarks.assetCount === 'undefined') ? totalAssetCount : overviewBenchmarks.assetCount + totalAssetCount;

            lastFileSize += totalFileSize;
            lastNetworkTime += totalNetworkTime;
            lastAssetCount += totalAssetCount;

            totalAssetCount = 0;
            totalFileSize = 0;
            totalNetworkTime = 0;

            // store the batch's overview bechmarks and  the newly enlarged array
            chrome.storage.local.set({ assetBenchmarks, overviewBenchmarks });
        });

        /*** Deal with our remotely stored benchmark data dump ***/

        // get user-set sendData preference
        chrome.storage.local.get('sendData', function (result) {
            var sendData = result.sendData;

            // if they want to send their data (default)
            if (sendData || typeof result.sendData === 'undefined') {
                // initialize our xmlhttprequest
                var xhr = new XMLHttpRequest({mozAnon: true});

                if (alarm.name === "dbsend" && assetLoadTimes.size > 0) {

                    // process our Map store into a JSON string we can send via XMLHTTPRequest
                    var JSONString = stringifyAssetStore(assetLoadTimes, true);

                    // open XMLHTTPRequest
                    xhr.open("POST", "https://ultra-lightbeam.herokuapp.com/log/", true);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhr.setRequestHeader("User-Agent", "Anonymous");
                    xhr.setRequestHeader("Accept-Language", "Anonymous");
                    // making sure our client recieved our results
                    xhr.onreadystatechange = function () {
                        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                            // we need to output the server's response for debugging purposes
                            // so users can detect whether or not their data is being sent to Site Sonar Servers
                            console.log(xhr.responseText);

                            // reset our assets locally for the next data retreival and dump
                            assetLoadTimes.clear();
                            assetSentTimes.clear();
                        }
                    };

                    // send our data as a DOMString
                    xhr.send(JSONString);
                } else {
                    // reset our assets locally so that memory build up doesn't happen
                    assetLoadTimes.clear();
                    assetSentTimes.clear();
                }
            }
        });
    });

    // listen for a change in the open tabs so we can grab all currently open tabs
    browser.tabs.onUpdated.addListener(function (tabID, changeInfo) {
        if (changeInfo.status === 'loading') {
            mainFrameOriginTopHosts[tabID] = null;
        }
    });

    // start our port listener
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            var profileCheck;

            // if we've got a profiling command
            if (typeof request.profiling !== 'undefined') {
                // note the new profiling flag
                profiling = request.profiling;
            }

            if (request.getOverview) { // if we're requested to return overview benchmarks
                var overviewBenchmarks = { 
                    fileSize: (totalFileSize+lastFileSize),
                    networkTime: (totalNetworkTime+lastNetworkTime),
                    assetCount: (totalAssetCount+lastAssetCount)
                };

                overviewBenchmarks = JSON.stringify(overviewBenchmarks);

                // if we're also checking to see if we're currenlty profiling
                if(request.profileCheck) {
                    // send the value of profiling and overviewBenchmarks
                    sendResponse({ "overviewBenchmarks": overviewBenchmarks, "isProfiling": profiling });

                    return;
                }

                sendResponse({ "overviewBenchmarks": overviewBenchmarks });
            }

            // if we're only checking to see if we're currenlty profiling
            if(request.profileCheck) {
                sendResponse({ "isProfiling": profiling });
            }

            if (request.deleteOverview) {
                totalAssetCount = 0;
                totalFileSize = 0;
                totalNetworkTime = 0;

                lastAssetCount = 0;
                lastFileSize = 0;
                lastNetworkTime = 0;

                sendResponse({ "deletedOverview": true});
            }

            if (!profiling) { // if we are supposed to stop profiling
                var JSONString = stringifyAssetStore(profileStorage, false);
                // send the profiling data
                sendResponse({ "profiles": JSONString });

                // and clear the profiling storage
                profileStorage.clear();
            }

            if(request.openTab) {
                browser.tabs.create({ url: request.openUrl });

                return;
            }
    });
}

function isBlacklisted(details) {
    var privlegedOrigin = false;
    var hostinBlocklist = false;
    var requestHostMatchesMainFrame = false;
    var requestTabID = details.tabId;
    var requestEntityName;
    var unparsedOrigin;
    var origin;
    
    // canonicalize the origin address
    if (details.originUrl) {
        unparsedOrigin = parseURI(details.originUrl).hostname;
        origin = canonicalizeHost(unparsedOrigin);

        if (details.frameId === 0) {
            mainFrameOriginTopHosts[requestTabID] = origin;
        }
    }

    // if it is originating from firefox, new window, or newtab, it is definitely not blacklisted
    privlegedOrigin = ((typeof origin !== 'undefined' && origin.includes('moz-nullprincipal')) || origin === '');
    if (privlegedOrigin) {
        // so return false
        return false;
    }

    // canoniocalize the host address
    var unparsedHost = parseURI(details.url).hostname;
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
        requestHostMatchesMainFrame = (details.frameId > 0 && host === mainFrameOriginTopHosts[requestTabID]);
        if (requestHostMatchesMainFrame) {
            // we should allow it, so return false
            return false;
        }

        // determine whether the request origin/host is an allowed property/resource of the entity
        for (var entityName in disconnectEntitylist) {
            var entity = disconnectEntitylist[entityName];
            var requestIsEntityResource = false;
            var originIsEntityProperty = false;
            var mainFrameOriginIsEntityProperty = false;

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

            // check to see if the origin is a property of the entity
            for (var requestMainFame of allHosts(mainFrameOriginTopHosts[requestTabID])) {
                mainFrameOriginIsEntityProperty = entity.properties.indexOf(mainFrameOriginTopHosts[requestTabID]) > -1;
                if(mainFrameOriginIsEntityProperty) {
                    break;
                }
            }

            // if our origin is a property and host is a resource of the entity, return false
            if ((originIsEntityProperty || mainFrameOriginIsEntityProperty) && requestIsEntityResource) {
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
    // remove un-needed categories per disconnect
    delete disconnectJSON.categories['Content']
    delete disconnectJSON.categories['Legacy Disconnect']
    delete disconnectJSON.categories['Legacy Content']

    // parse our disconnect JSON into a set where we only include the hostname and subdomain urls
    for(var category in disconnectJSON.categories) {
        for(var network in disconnectJSON.categories[category]) {
            for(var hostname in disconnectJSON.categories[category][network]) {
                blocklistSet.add(hostname);
                for(var subDomain in disconnectJSON.categories[category][network][hostname]) {
                    for(var entitySubDomain in disconnectJSON.categories[category][network][hostname][subDomain]) {
                        blocklistSet.add(disconnectJSON.categories[category][network][hostname][subDomain][entitySubDomain]);
                    }
                }
            }
        }
    }
}

/**
* Gets the ad network for any given ad host
*/
function getAdNetwork(assetAdHost) {
    var assetAdNetwork;

    // parse our disconnect JSON into a set where we only include the hostname and subdomain urls
    for(var category in disconnectJSON.categories) {
        for(var network in disconnectJSON.categories[category]) {
            for(var hostname in disconnectJSON.categories[category][network]) {
                for(var subDomain in disconnectJSON.categories[category][network][hostname]) {
                    for(var entitySubDomain in disconnectJSON.categories[category][network][hostname][subDomain]) {
                        if (assetAdHost.includes(disconnectJSON.categories[category][network][hostname][subDomain][entitySubDomain])) {
                            assetAdNetwork = Object.keys(disconnectJSON.categories[category][network])[0];
                            break;
                        }
                    }
                }
            }
        }
    }

    return assetAdNetwork;
}

/**
* Turns a map of passed asset information into a JSON string and takes 1 in 5 records when minimize is true
*/
function stringifyAssetStore(stringifyStore, minimize) {
    var JSONString = "{\"assets\":[";

    // if we're wanting to minify our JSON
    if (minimize) {
        stringifyStore.forEach(function (entry, key, map) {
            // generate a random number between 1 and 5
            var randomNum = Math.floor(Math.random() * 5) + 1;

            // if that number is 3, add it to our JSON string
            if (randomNum === 3) {
                JSONString = JSONString + JSON.stringify(entry) + ",";
            }            
        });
    } else {
        stringifyStore.forEach(function (entry, key, map) {
            JSONString = JSONString + JSON.stringify(entry) + ",";
        });
    }
       
    // add the closing bracket
    JSONString = JSONString.substring(0, JSONString.length-1) + "]}";

    return JSONString
}

/**
* Parses a url for the various parts (host, protocol, hostname, etc)
*/
function parseURI(url) {
    var match = url.match(/^((https|http)?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
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

