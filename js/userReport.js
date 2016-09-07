document.addEventListener('DOMContentLoaded', function() {
    var adCount = document.getElementById('adNumber');
    var adSizeCount = document.getElementById('adFileSize');
    var adWaitCount = document.getElementById('adLoadTime');
    var benchmarkOverview = document.getElementById('benchmarkOverview');
    var dashboardLink = document.getElementById('openUrl');

    // link to the dashboard link click
    dashboardLink.addEventListener('click', function (e) {
        // open the dashboard in a new tab
        chrome.runtime.sendMessage({ "openTab": true, "openUrl": "http://site-sonar.com/dashboard?utm_source=site-sonar&utm_medium=add-on&utm_campaign=site-sonar-v1" });
    });

    getOverview();
    
    setInterval(getOverview, 1000);

    function getOverview() {
        // get the current overview benchmarks
        chrome.runtime.sendMessage({ "getOverview": true, "profileCheck": true }, function (response) {
            var profiling = response.isProfiling;
            if (profiling) {
                window.location = "/views/profiler.html";
            } else {
                var overviewBenchmarks = JSON.parse(response.overviewBenchmarks);
                var count = overviewBenchmarks.assetCount;
                var time = formatMillseconds(overviewBenchmarks.networkTime, 1);
                var size = formatBytes(overviewBenchmarks.fileSize, 1);

                if (count !== 0) {
                    adCount.innerHTML = "<p class=\"metric\" id=\"adNumber\">" + count + "</p>";
                    adWaitCount.innerHTML = "<p class=\"metric\" id=\"adLoadTime\">" + time + "</p>";
                    adSizeCount.innerHTML = "<p class=\"metric\" id=\"adFileSize\">" + size + "</p>";
                } else {
                    window.location = "/views/welcome.html";
                }
            }
        });
    }
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
