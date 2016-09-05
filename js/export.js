document.addEventListener('DOMContentLoaded', function() {
	var dataOutput = document.getElementById('outputArea');
	var copyButton = document.getElementById('copyJSON');
	var populateButton = document.getElementById('populateJSON');

	copyButton.addEventListener("click", function (event) {
		dataOutput.select();
		var result = document.execCommand('copy');

		if (result) {
			copyButton.insertAdjacentHTML("afterend", "<span class=\"label label-success\">Successfully copied!</span>");
			copyButton.disabled = true;
		} else {
			copyButton.insertAdjacentHTML("afterend", "<span class=\"label label-danger\">Copy Unsuccessful :( " + result+ "</span>");
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
	        	copyButton.insertAdjacentHTML("afterend", "<span class=\"label label-danger\">No data to export. Benchmarks are batched in 2 minute intervals. Check back soon!</span>");
	        	populateButton.disabled = true;
	        }
		});
	});
});
