# UltraLightbeam
A web extension used to identify ad networks with the slowest loading content on the internet inspired as an ultra-light version of the [Lightbeam](https://github.com/mozilla/lightbeam) project. 

By utilizing [Disconnect](https://disconnect.me/)'s list of ad-network domains, UltraLightbeam will locate and benchmark network load-time of ad content while you browse.

## Installing UltraLightbeam

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/ultralightbeam.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Running UltraLightbeam

Once you've cloned the repo and installed Node.js, you can start UltraLightbeam by running:

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
5. Select any file in your locally downloaded version of UltraLightbeam


## Interpreting Results

After UltraLightbeam does its thing, ad content load speed will be logged to the console for now. To view, open the web-console in Firefox and filter for only "logging" items.
