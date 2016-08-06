document.addEventListener('DOMContentLoaded', function() {
	var userDataTable = document.getElementById('userData');
	var reportSize = document.getElementById('dataUsed');
	var index = 0;
	var newTable;
	
	newTable = "<table><tr><th>Origin</th><th>Ad Network</th><th>File Type</th><th>File Size</th><th>Load Time</th></tr>";

	chrome.storage.local.get('assetBenchmarks', function (result) {
        var assetBenchmarks = result.assetBenchmarks;

        for (var record in assetBenchmarks) {
            newTable += "<tr><td>" + assetBenchmarks[record]["originUrl"] + "</td>";
			newTable += "<td>" + assetBenchmarks[record]["adNetwork"] + "</td>";
			newTable += "<td>" + assetBenchmarks[record]["assetType"] + "</td>";
			newTable += "<td>" + assetBenchmarks[record]["fileSize"] + "</td>";
			newTable += "<td>" + assetBenchmarks[record]["assetCompleteTime"] + "</td></tr>";
        }

        newTable += "</table>";

        userDataTable.innerHTML = newTable;
	});
});