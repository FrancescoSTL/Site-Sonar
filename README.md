![Site Sonar Header Image](https://cloud.githubusercontent.com/assets/9794516/18351352/66d0704c-759f-11e6-9e4d-7c8dff4b89e9.png)

# Site Sonar
A project aimed at identifying ad networks with the fastest and slowest performing ad's on the internet through crowd-sourced, easy to understand, and openly accessible benchmarking data. Inspired by [Lightbeam](https://github.com/mozilla/lightbeam), the Site Sonar browser extension (hosted in this repository) locates and benchmarks ad content silently while you browse. It is then sent to Site-Sonar's servers, where the data is aggregated and displayed on our [public dashboard](http://Site-Sonar.com/dashboard) ([repo](https://github.com/francescostl/site-sonar-dashboard/)).

## Index
* [Installing ULB](https://github.com/FrancescoSTL/Site-Sonar#installing-Site-Sonar)
  * [For Firefox](https://github.com/FrancescoSTL/Site-Sonar#for-firefox)
  * [For Chrome](https://github.com/FrancescoSTL/Site-Sonar#for-chrome)
  * [For Opera](https://github.com/FrancescoSTL/Site-Sonar#for-opera)
* [Privacy Policy](https://github.com/FrancescoSTL/Site-Sonar#privacy-policy)
* [FAQ](https://github.com/FrancescoSTL/Site-Sonar#faq)

## Installing Site-Sonar

### For Firefox

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/Site-Sonar.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

Once you've cloned the repo and installed Node.js, you can start Site-Sonar by running:

1. `npm install`
2. `npm run bundle`

##### With `web-ext`

If you're using web-ext, you'll need to do so with a pre-release version of Firefox for now, as it is only supported in Firefox 49 or higher.

3. [Install `web-ext`](https://github.com/mozilla/web-ext/#documentation) if
   you haven't already
4. `web-ext run --firefox-binary=/Path/to/your/FirefoxDeveloperEdition/or/FirefoxBeta/or/FirefoxNightly.app`

OR

#### Without `web-ext`

3. Go to `about:debugging`
4. Click "Load Temporary Add-on"
5. Select any file in your locally downloaded version of Site-Sonar

### For Chrome

1. Clone the repository by running:

```
git clone -b Chrome-and-Opera-Version https://github.com/FrancescoSTL/Site-Sonar.git
```

2. Download and install [Node.js](https://nodejs.org/en/download/)
3. Go to `chrome://extensions`
2. Click "Load Unpacked Extension"
3. Navigate to the folder where you downloaded Site-Sonar
4. Click "Select"

### For Opera

1. Clone the repository by running:

```
git clone -b Chrome-and-Opera-Version https://github.com/FrancescoSTL/Site-Sonar.git
```

2. Download and install [Node.js](https://nodejs.org/en/download/)
3. Go to `extensions`
2. Click "Load Unpacked Extension"
3. Navigate to the folder where you downloaded Site-Sonar
4. Click "Select"

## Data Site-Sonar Collects
Using Disconnect's Blacklist of ad domains, Site-Sonar will benchmark and collect the following information about each ad asset in your browser:

1. **assetCompleteTime** `Integer` Amount of time (in milliseconds) that the network took to respond to the HTTP request for the asset. This is calculated using a time diff between [onSendHeaders](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onSendHeaders) and [onHeadersReceived](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived).

2. **originUrl** `String` The URL from which the HTTP request originated. In many cases, this will be the hostUrl, however, sometimes ads will trigger their own HTTP requests. For example, checkout the following example from some real world data we pulled in [Site-Sonar Issue #17](https://github.com/FrancescoSTL/Site-Sonar/issues/17#issue-168984693)

3. **hostUrl** `String` The top level host URL from which the HTTP request originated. For example, if you have 3 tabs open and one request originates from the first tab (lets say, `youtube.com`), the top level host would always be said tab's url (`youtube.com`).

4. **adNetworkUrl** `String` The host URL of the ad asset.

5. **assetType** `String` Can be anything recieved by [webRequest.ResourceType](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/WebRequest/ResourceType).

6. **fileSize** `Integer` File size in octets of bits.

7. **timeStamp** `Integer` Time when the asset was requested (in milliseconds) since the [epoch](https://en.wikipedia.org/wiki/Epoch_(reference_date))

8. **method** `String` Either "GET" or "POST".

9. **statusCode** `Integer` Standard HTTP status code returned by the server. Ex: `200`, `404`, `301`, etc

10. **adNetwork** `String` The Ad Network for which the asset belongs.

## Privacy Policy

### Site-Sonar Privacy Summary
Site-Sonar is a browser extension currently supported in Firefox, Chrome, and Opera, which silently collects data about how ad's are performing in your browser. After collecting that data, it will be sent to Site-Sonar's server to aggregate (unless you opt out) and keep ad networks accountable through publicly accessible performance information.

### What you should know

1. Upon installing Site-Sonar, data will be collected locally and stored in your browser. Unless you opt out, every 2 minutes, that data will be sent to Site-Sonar servers for aggregation and display on our public dashboard.
2. By default, data collected by Site-Sonar is sent to us.
3. You can chose to opt out of sending any data to us.
4. If you do contributeSite-Sonar data to us, your browser will send us your data in a manner which we believe minimizes your risk of being re-identified (you can see a list of the kind of data involved here). We will post your data along with data from others in an aggregated and open database. Opening this data can help users and researchers make more informed decisions based on the collective information.
5. Uninstalling Site-Sonar prevents collection of any further Site-Sonarm data and will delete the data stored locally in your browser.

## FAQ

### Will Site-Sonar track my browsing history?
Sort of. Once installed, Site-Sonar collects the host url of any website you browse that hosts ad content. Read more in our [Privacy Policy](https://github.com/FrancescoSTL/Site-Sonar#privacy-policy) or [Summary of Data Collection](https://github.com/FrancescoSTL/Site-Sonar#data-Site-Sonar-collects).

### How can I contribute?
Check out our installation instructions and then head to our Github Issues page for either the [Site-Sonar web extension](http://github.com/francescostl/Site-Sonar/issues) (this repo), or the [Site-Sonar Dashboard](http://github.com/francescostl/Site-Sonar-dashboard/issues).

### Who are you?
A group of humans interested in making the internet a better place through a pragmatic approach to problems on the web.

Specifically:
* [Francesco Polizzi](http://www.francesco.tech)
* [Asa Dotzler](https://asadotzler.com/)
* [Purush Kaushik](https://www.linkedin.com/in/purukaushik)
* [Justin Potts](https://twitter.com/PottsJustin/)

### How can we contact you?
Visit our [Contact Page](http://Site-Sonar.com/contact).
