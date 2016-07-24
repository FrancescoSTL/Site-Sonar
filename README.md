# Sherlock
A web-crawling script utilized in investigating the worst players in slow-loading advertisements on the web.

Utilizing the top 500 Alexa Ranked websites on the internet and [Disconnect](https://disconnect.me/)'s list of ad-network domains, Sherlock logs load time for all advertizing image, script, iframe, and object elements on each page it crawls. In its current implementation, this tool is written in Javascript using Node.js.

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
