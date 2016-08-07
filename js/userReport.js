document.addEventListener('DOMContentLoaded', function() {
	var userDataTable = document.getElementById('userData');
	var reportSize = document.getElementById('dataUsed');
	var newTable;
	
	newTable = "<table><tr><th>Origin</th><th>Ad Network</th><th>File Type</th><th>File Size</th><th>Load Time</th></tr>";

	chrome.storage.local.get('assetBenchmarks', function (result) {
        var assetBenchmarks = result.assetBenchmarks;
        var lowerLimit;
        if (assetBenchmarks.length <= 99) {
        	lowerLimit = 0;
        } else {
			lowerLimit = assetBenchmarks.length-99;
        }

        for (var record = assetBenchmarks.length-1; record >= lowerLimit; record--) {
        	if(assetBenchmarks[record]["fileSize"]) {
	            newTable += "<tr><td>" + assetBenchmarks[record]["originUrl"] + "</td>";
				newTable += "<td>" + assetBenchmarks[record]["adNetwork"] + "</td>";
				newTable += "<td>" + assetBenchmarks[record]["assetType"] + "</td>";
				newTable += "<td>" + (((assetBenchmarks[record]["fileSize"]/1024) >= 1) ? (Math.round(assetBenchmarks[record]["fileSize"]/1024)) + " kb" : assetBenchmarks[record]["fileSize"] + " bytes") + "</td>";
				newTable += "<td>" + ((assetBenchmarks[record]["assetCompleteTime"]/1000 >= 1) ?  (Math.round(assetBenchmarks[record]["assetCompleteTime"]/1000)) + " s" : assetBenchmarks[record]["assetCompleteTime"] + " ms") + "</td></tr>";
			}
        }

        newTable += "</table>";

        userDataTable.innerHTML = newTable;
	});
});
