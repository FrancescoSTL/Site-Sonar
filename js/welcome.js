document.addEventListener('DOMContentLoaded', function() {
    var dashboardLink = document.getElementById('openUrl');
    var main = document.getElementById('main');
    var navigateAttemptNum = 0;
    var showedError = false;

    // link to the dashboard link click
    dashboardLink.addEventListener('click', function (e) {
    	// open cnn.com in a new tab
    	chrome.runtime.sendMessage({ "openTab": true, "openUrl": "http://cnn.com" });

    	// check to see if we've collected ad's in the last 
    	window.setInterval(navigateHome, 500);
    });

    function navigateHome () {
    	navigateAttemptNum++;
    	chrome.runtime.sendMessage({ "getOverview": true }, function (response) {
    		var overviewBenchmarks = JSON.parse(response.overviewBenchmarks);
            var count = overviewBenchmarks.assetCount;

            if (count !== 0) {
    		    window.location = "/views/userReport.html";
    		} else if (navigateAttemptNum >= 10 && !showedError) {
    			main.insertAdjacentHTML('beforeend', '<div class="alert alert-danger"><strong>Uh, oh.</strong> We aren\'t finding any ads. Do you have an Ad Blocker enabled?</div>');
    			showedError = true;
    		}
    	});
    }
});