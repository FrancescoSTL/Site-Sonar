# Sherlock
A tool used to identify ad networks with the slowest loading content on the internet.

Sherlock crawls the web and logs the load time of all advertizing image, script, iframe, and object elements it finds. It does so by utilizing the top 500 Alexa Ranked websites and [Disconnect](https://disconnect.me/)'s list of ad-network domains in order to determine what pages to crawl and what content to benchmark.

## Installing Sherlock

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/sherlock.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Running Sherlock

Once you've cloned the repo and installed Node.js, you can start sherlock by running:
```
node web-crawler.js
```

## Interpreting Results

After Sherlock does its thing, your logs will be located in data/resultLogs.txt. The results are logged using the following pattern:
`pageLoadTime(in milliseconds) pageURL`

So your output file might look something like the following results from CNN.com:
```
582 http://i2.cdn.turner.com/cnnnext/dam/assets/160724155744-debbie-wasserman-schultz-0723-large-tease.jpg
621 http://www.i.cdn.cnn.com/.a/1.283.0/js/cnn-analytics.min.js
884 http://www.i.cdn.cnn.com/.a/1.283.0/js/cnn-header-second.min.js
696 http://www.i.cdn.cnn.com/.a/bundles/cnn-header.5d7f32869d18510c6c0f-first-bundle.js
732 http://a.postrelease.com/serve/load.js?async=true
757 http://z.cdn.turner.com/analytics/cnnexpan/jsmd.min.js
786 http://www.i.cdn.cnn.com/.a/1.283.0/js/cnn-footer-lib.min.js
```
