document.addEventListener('DOMContentLoaded', function() {
    var adCount = document.getElementById('adNumber');
    var adSizeCount = document.getElementById('adFileSize');
    var adWaitCount = document.getElementById('adLoadTime');
    var benchmarkOverview = document.getElementById('benchmarkOverview');
    var newTable;
    
    newTable = "<table id=\"#userData\"><tr><th align=\"left\">Website</th><th align=\"left\">Ad Network</th><th align=\"left\">File Type</th><th align=\"left\">File Size</th><th align=\"left\">Load Time</th></tr>";

    // get the current overview benchmarks
    chrome.runtime.sendMessage({ "getOverview": true }, function (response) {
        var overviewBenchmarks = JSON.parse(response.overviewBenchmarks);
        var count = overviewBenchmarks.assetCount;
        var time = formatMillseconds(overviewBenchmarks.networkTime, 1);
        var size = formatBytes(overviewBenchmarks.fileSize, 1);

        if (count !== 0) {
            adCount.innerHTML = "<p class=\"metric\" id=\"adNumber\">" + count + "</p>";
            adWaitCount.innerHTML = "<p class=\"metric\" id=\"adLoadTime\">" + time + "</p>";
            adSizeCount.innerHTML = "<p class=\"metric\" id=\"adFileSize\">" + size + "</p>";
        } else {
            benchmarkOverview.innerHTML = "To begin viewing ad benchmarks, start browsing and check back with this panel."
        }
    });
});

function formatBytes (bytes, decimals) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    var k = 1024;
    var dm = decimals + 1 || 3;
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
