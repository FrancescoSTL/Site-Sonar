document.addEventListener('DOMContentLoaded', function() {
	var dataOutput = document.getElementById('outputArea');
	var copyButton = document.getElementById('copyJSON');
	var populateButton = document.getElementById('populateJSON');

	copyButton.addEventListener("click", function (event) {
		dataOutput.select();
		var result = document.execCommand('copy');

		if (result) {
			copyButton.insertAdjacentHTML("afterend", "<p class=\"errorMsg\">Sucessfully Copied!</p>");
			copyButton.disabled = true;
		} else {
			copyButton.insertAdjacentHTML("afterend", "<p class=\"errorMsg\">Copy Unsuccessful :( " + result+ "</p>");
		}
	});

	populateButton.addEventListener("click", function (event) {
		chrome.storage.local.get('assetBenchmarks', function (result) {
			if(result.assetBenchmarks) {
				populateButton.classList.add("hidden");
				copyButton.classList.remove("hidden");


				// clear anything that may have been in our textarea
				var dict = { "assets": result.assetBenchmarks}
		        dataOutput.textContent = JSON.stringify(dict);

	        } else {
	        	copyButton.insertAdjacentHTML("afterend", "<p class=\"errorMsg\">No data to export. Note: benchmarks are batched in 2 minute intervals. Check back soon!</p>");
	        	populateButton.disabled = true;
	        }
		});
	});
});
