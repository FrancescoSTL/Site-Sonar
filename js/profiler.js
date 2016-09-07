document.addEventListener('DOMContentLoaded', function() {
	// grab all of our DOM objects we'd like to interact with
	var userDataTable = document.getElementById('userData');
	var startButton = document.getElementById('startProfileButton');
	var stopButton = document.getElementById('stopProfileButton');
	var recordingMessage = document.getElementById('recordingText');
	var adCount = document.getElementById('adNum');
	var adSizeCount = document.getElementById('adFile');
	var adWaitCount = document.getElementById('adLoad');
	var tip = document.getElementById('tip');
	var outputArea = document.getElementById('outputArea');
	var copyButton = document.getElementById('copyJSON');
	var numLabel = document.getElementById('numLabel');
	var fileLabel = document.getElementById('fileLabel');
	var loadLabel = document.getElementById('loadLabel');
	var errorDisplayed = false;

	// check to see if we are currently profiling
	chrome.runtime.sendMessage({ "profileCheck": true }, function (response) {
		var profiling = response.isProfiling;

		// if we are profiling
		if(profiling) {
			// add the stop button and "recording" text
			stopButton.classList.remove("hidden");
			recordingMessage.classList.remove("hidden");

			// remove the start button
			startButton.classList.add("hidden");
			tip.classList.add("hidden");
		}
	});

	// ad our start-button click listener
	startButton.addEventListener('click', function (event) {
		// add the stop button and "recording" text
		stopButton.classList.remove("hidden");
		recordingMessage.classList.remove("hidden");

		// hide everything that may not have been hidden already
		outputArea.classList.add("hidden");
		copyButton.classList.add("hidden");
		numLabel.classList.add("hidden");
		fileLabel.classList.add("hidden");
		loadLabel.classList.add("hidden");
		startButton.classList.add("hidden");
		tip.classList.add("hidden");

		if (errorDisplayed) {
			var errorMessage = document.getElementById('errorMsg');
			errorMessage.classList.add("hidden");
			errorDisplayed = false;
		}

		// remove any previous records which might still exist in the DOM
		adSizeCount.innerHTML = "";
	    adWaitCount.innerHTML = "";
	    adCount.innerHTML = "";

	    // start profiling
		chrome.runtime.sendMessage({ profiling: true});
	});

	// add our stop-button click listener
	stopButton.addEventListener('click', function (event) {
		// add the start button
		startButton.classList.remove("hidden");

		// remove the stop button and "recording" text
		stopButton.classList.add("hidden");
		recordingMessage.classList.add("hidden");

		// stop profiling
		chrome.runtime.sendMessage({ profiling: false}, function (response) {
			// now that we've stopped profiling and recieved a response confirming that

			// if we've got benchmarks to display		
			if(typeof response.profiles !== 'undefined' && response.profiles !== "{\"assets\":]}")  {
				// initialize our benchmark counts
				var totalFileSize = 0;
				var totalWaitTime = 0;
				var totalAssetCount = 0;

				// put the JSON in our textarea
			    outputArea.textContent = response.profiles;

			    // unhide all our stat labels and output area + copy button
			   	outputArea.classList.remove("hidden");
				copyButton.classList.remove("hidden");
				numLabel.classList.remove("hidden");
				fileLabel.classList.remove("hidden");
				loadLabel.classList.remove("hidden");

				// initialize our local benchmark data store
	            var profileBenchmarks = JSON.parse(response.profiles).assets;

	            // iterate through our benchmark storage
	            for (var record in profileBenchmarks) {
	            	// if the record is of non-zero file size
	            	if(profileBenchmarks[record]["fileSize"]) {
	                	// record our benchmark counts
	                	totalFileSize += profileBenchmarks[record]["fileSize"];
						totalWaitTime += profileBenchmarks[record]["assetCompleteTime"];
					}
	            }  

	            // calculate our benchmark counts based upon standard units of measurement
	            totalAssetCount = (Object.keys(profileBenchmarks).length || 0);
	            totalFileSize = formatBytes(totalFileSize);
	            totalWaitTime = formatMillseconds(totalWaitTime);

	            // add bechmark counts to the DOM
	            adCount.innerHTML = "<p id=\"adNum\">" + totalAssetCount + "</p>";
	            adSizeCount.innerHTML = "<p id=\"adFile\">" + (totalFileSize || 0) + "</p>";
	            adWaitCount.innerHTML = "<p id=\"adLoad\">" + (totalWaitTime || 0) + "</p>";
	        } else if (!errorDisplayed) {
		        startButton.insertAdjacentHTML("afterend", "<span class=\"label label-danger\" id=\"errorMsg\">Uh, oh, we didn't find any Ads.</span>");
		       	errorDisplayed = true;
		    }
	    });
	});

	copyButton.addEventListener("click", function (event) {
		outputArea.select();
		var result = document.execCommand('copy');

		if (result) {
			copyButton.insertAdjacentHTML("afterend", "<br><span class=\"label label-success\">Successfully copied!</span>");
			copyButton.disabled = true;
		} else {
			copyButton.insertAdjacentHTML("afterend", "<br><span class=\"label label-danger\">Copy Unsuccessful :( " + result+ "</span>");
		}
	});
});

function formatBytes (bytes, decimals) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    var k = 1024;
    var dm = decimals || 3;
    var sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pm', 'eb', 'zb', 'yb'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatMillseconds (millisec, decimals) {
    var seconds = (millisec / 1000).toFixed(decimals);
    var minutes = (millisec / (1000 * 60)).toFixed(decimals);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(decimals);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(decimals);

    if (seconds < 60) {
        return seconds + " sec";
    } else if (minutes < 60) {
        return minutes + " min";
    } else if (hours < 24) {
        return hours + " hrs";
    } else {
        return days + " days"
    }
}


function escapeHTML(str){
	return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
}
