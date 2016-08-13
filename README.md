# Ultra-Lightbeam
A web extension used to identify ad networks with the slowest loading content on the internet; built as an ultra-light sister-project of of [Lightbeam](https://github.com/mozilla/lightbeam). 

By utilizing [Disconnect](https://disconnect.me/)'s list of ad-network domains, Ultra-Lightbeam will locate and benchmark network load-time of ad content while you browse.

## Installing Ultra-Lightbeam

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/ultra-lightbeam.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Running Ultra-Lightbeam

Once you've cloned the repo and installed Node.js, you can start Ultra-Lightbeam by running:

1. `npm install`
2. `npm run bundle`

### With `web-ext`

If you're using web-ext, you'll need to do so with a pre-release version of Firefox for now, as it is only supported in Firefox 49 or higher.

3. [Install `web-ext`](https://github.com/mozilla/web-ext/#documentation) if
   you haven't already
4. `web-ext run --firefox-binary=/Path/to/your/FirefoxDeveloperEdition/or/FirefoxBeta/or/FirefoxNightly.app`

OR

### Without `web-ext`

3. Go to `about:debugging`
4. Click "Load Temporary Add-on"
5. Select any file in your locally downloaded version of Ultra-Lightbeam


## Interpreting Results

After Ultra-Lightbeam does its thing, ad content load speed will be logged to the [Ultra-Lightbeam Dashboard](http://ultra-lightbeam.com). Keep checking back for dashboard updates!

![Ultra-Lightbeam Banner](https://cloud.githubusercontent.com/assets/9794516/17311436/345a3c22-5800-11e6-8aec-ee0644d7023d.png)

## Privacy Policy

### Ultra-Lightbeam Privacy Summary
Ultra-Lightbeam is a browser extension currently supported in Firefox, Chrome, and Opera, which silently collects data about how ad's are performing in your browser. After collecting that data, it will be sent to Ultra-Lightbeam's server to aggregate (unless you opt out) and keep ad networks accountable through publicly accessible performance information.

### What you should know

1. Upon installing Ultra-Lightbeam, data will be collected locally and stored in your browser. Unless you opt out, every 2 minutes, that data will be sent to Ultra-Lightbeam servers for aggregation and display on our public dashboard.
2. By default, data collected by Ultra-Lightbeam is sent to us.
3. You can chose to opt out of sending any data to us.
4. If you do contribute Ultra-Lightbeam data to us, your browser will send us your data in a manner which we believe minimizes your risk of being re-identified (you can see a list of the kind of data involved here). We will post your data along with data from others in an aggregated and open database. Opening this data can help users and researchers make more informed decisions based on the collective information.
5. Uninstalling Lightbeam prevents collection of any further Ultra-Lightbeam data and will delete the data stored locally in your browser.
