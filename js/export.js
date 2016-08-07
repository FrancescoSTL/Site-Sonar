document.addEventListener('DOMContentLoaded', function() {
	var dataOutput = document.getElementById('outputArea');
	var copyButton = document.getElementById('copyJSON');

	chrome.storage.local.get('assetBenchmarks', function (result) {
		if(result.assetBenchmarks) {
			var JSONString = "{\"assets\": [";

			// clear anything that may have been in our textarea
			var assetBenchmarks = result.assetBenchmarks;
			for (var record in assetBenchmarks) {
		        JSONString += JSON.stringify(assetBenchmarks[record]) + ",";
	        }
	        JSONString += JSONString.substring(0, JSONString.length-1) + "]}]}";
	        dataOutput.innerHTML = JSONString;

	        copyButton.addEventListener("click", function (event) {
	        	dataOutput.select();

	        	try {
	        		var result = document.execCommand('copy');
	        		if (result) {
	        			copyButton.insertAdjacentHTML("afterend", "<p>Sucessfully Copied!</p>");
	        		} else {
						copyButton.insertAdjacentHTML("afterend", "<p>Copy Unsuccessful :(</p>");
	        		}
	        	} catch (e) {
	        		console.log("Unable to copy to clipboard " + e);
	        	}
	        });
        }
	});
});
