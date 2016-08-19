document.addEventListener('DOMContentLoaded', function() {
	// grab all of our DOM objects we'd like to interact with
	var userDataTable = document.getElementById('userData');
	var startButton = document.getElementById('startProfileButton');
	var stopButton = document.getElementById('stopProfileButton');
	var recordingMessage = document.getElementById('recordingText');
	var adCount = document.getElementById('adNum');
	var adSizeCount = document.getElementById('adFile');
	var adWaitCount = document.getElementById('adLoad');
	var newTable;

	// check to see if we are currently profiling
	chrome.runtime.sendMessage({ "profileCheck": true }, function (response) {
		var profiling = response.isProfiling;

		// if we are profiling
		if(profiling) {
			// add the stop button and "recording" text
			stopButton.style.display = "block";
			recordingMessage.style.display = "block";

			// remove the start button
			startButton.style.display = "none";

			// set the table header string locally
		    newTable = "<table id=\"#userData\"><tr><th align=\"left\">Website</th><th align=\"left\">Ad Network</th><th align=\"left\">File Type</th><th align=\"left\">File Size</th><th align=\"left\">Load Time</th></tr>";
		}
	});

	// ad our start-button click listener
	startButton.addEventListener('click', function (event) {
		// remove the start button
		startButton.style.display = "none";

		// add the stop button and "recording" text
		stopButton.style.display = "block";
		recordingMessage.style.display = "block";

		// remove any previous records which might still exist in the DOM
		adSizeCount.innerHTML = "";
	    adWaitCount.innerHTML = "";
	    adCount.innerHTML = "";
	    userDataTable.innerHTML = "";

	    // reset the local table string
	    newTable = "<table id=\"#userData\"><tr><th align=\"left\">Website</th><th align=\"left\">Ad Network</th><th align=\"left\">File Type</th><th align=\"left\">File Size</th><th align=\"left\">Load Time</th></tr>";

	    // start profiling
		chrome.runtime.sendMessage({ profiling: true});
	});

	// add our stop-button click listener
	stopButton.addEventListener('click', function (event) {
		// add the start button
		startButton.style.display = "block";

		// remove the stop button and "recording" text
		stopButton.style.display = "none";
		recordingMessage.style.display = "none";

		// stop profiling
		chrome.runtime.sendMessage({ profiling: false}, function (response) {
			// now that we've stopped profiling and recieved a response confirming that

			// if we've got benchmarks to display		
			if(typeof response.profiles !== 'undefined')  {
				// initialize our benchmark counts
				var totalFileSize = 0;
				var totalWaitTime = 0;

				// initialize our local benchmark data store
	            var profileBenchmarks = JSON.parse(response.profiles);
	            var profileBenchmarks = profileBenchmarks.assets;

	            // set the total ad count in the DOM
	            adCount.innerHTML = "<p id=\"adNum\"><b>Assets Benchmarked: </b> " + Object.keys(profileBenchmarks).length + "</p>";

	            // iterate through our benchmark storage
	            for (var record in profileBenchmarks) {
	            	// if the record is of non-zero file size
	                if(profileBenchmarks[record]["fileSize"]) {
	                	// record our benchmark counts
	                	totalFileSize += profileBenchmarks[record]["fileSize"];
	                	totalWaitTime += profileBenchmarks[record]["assetCompleteTime"];

	                	// and add the asset to our table
	                    newTable += "<tr><td>" + escapeHTML(profileBenchmarks[record]["hostUrl"]) + "</td>";
	                    newTable += "<td>" + escapeHTML(profileBenchmarks[record]["adNetwork"]) + "</td>";
	                    newTable += "<td>" + escapeHTML(profileBenchmarks[record]["assetType"]) + "</td>";
	                    newTable += "<td>" + (((parseInt(profileBenchmarks[record]["fileSize"])/1024) >= 1) ? (Math.round(parseInt(profileBenchmarks[record]["fileSize"])/1024)) + " kb" : parseInt(profileBenchmarks[record]["fileSize"]) + " bytes") + "</td>";
	                    newTable += "<td>" + ((parseInt(profileBenchmarks[record]["assetCompleteTime"])/1000 >= 1) ?  (Math.round(parseInt(profileBenchmarks[record]["assetCompleteTime"])/1000)) + " s" : parseInt(profileBenchmarks[record]["assetCompleteTime"]) + " ms") + "</td></tr>";
	                }
	            }

	            // calculate our benchmark counts based upon standard units of measurement
	            totalFileSize = (((totalFileSize/1024) >= 1) ? (Math.round(totalFileSize/1024)) + " kb" : totalFileSize + " bytes");
	            totalWaitTime = ((totalWaitTime/1000 >= 1) ?  (Math.round(totalWaitTime/1000)) + " seconds" : totalWaitTime + " milliseconds");

	            // add bechmark counts to the DOM
	            adSizeCount.innerHTML = "<p id=\"adFile\"><b>Asset Size: </b> " + totalFileSize + "</p>";
	            adWaitCount.innerHTML = "<p id=\"adLoad\"><b>Network Time: </b> " + totalWaitTime + "</p>";

	            // close the table
	            newTable += "</table>";

	            // add the table to the DOM
	            userDataTable.innerHTML = newTable;
	        }
	    });
	});
});

function escapeHTML(str) {
	return str.replace(/[&"'<>]/g, function (m) ({ "&": "&amp;", '"': "&quot;", "'": "&quot;", "<": "&lt;", ">": "&gt;" })[m]);
}