# Sherlock
A tool used to identify ad networks with the slowest loading content on the internet.

Sherlock crawls the web and logs the load time of all advertizing image, script, iframe, and object elements it finds. It does so by utilizing the top 500 Alexa Ranked websites and [Disconnect](https://disconnect.me/)'s list of ad-network domains in order to determine what pages to crawl and what content to benchmark.

## Installing Sherlock

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/sherlock.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Installing Sherlock

Once you've cloned the repo and installed Node.js, you can start sherlock by running:
```
node web-crawler.js
```
