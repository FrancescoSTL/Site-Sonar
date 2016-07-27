# Sherlock
A web extension used to identify ad networks with the slowest loading content on the internet. 

By utilizing [Disconnect](https://disconnect.me/)'s list of ad-network domains, Sherlock will locate and benchmark network load-time of ad content while you browse.

## Installing Sherlock

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/sherlock.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Running Sherlock

Once you've cloned the repo and installed Node.js, you can start sherlock by running:

1. `npm install`
2. `npm run bundle`

### With `web-ext`

3. [Install `web-ext`](https://github.com/mozilla/web-ext/#documentation) if
   you haven't already
4. `web-ext run`

OR

### Without `web-ext`

3. Go to `about:debugging`
4. Click "Load Temporary Add-on"
5. Select any file in your locally downloaded version of sherlock


## Interpreting Results

After Sherlock does its thing, ad content load speed will be logged to the console for now. To view, open the web-console in Firefox and filter for only "logging" items.
