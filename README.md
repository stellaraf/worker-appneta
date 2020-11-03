<div align="center">
  <br/>
  <img src="https://res.cloudinary.com/stellaraf/image/upload/v1604277355/stellar-logo-gradient.svg" />
  <br/>
  <h3>Cloudflare worker for handling <a href="https://docs.appneta.com/event-integration.html" rel="noopener noreferrer">AppNeta Event Notifications</a></h3>
  <br/>  
</div>

This repository contains source code for receiving an [AppNeta](https://appneta.com) event notification through their [Observer API](https://docs.appneta.com/event-integration.html) and posting its contents to a [Slack](https://slack.com) channel as an [Incoming Web Hook](https://api.slack.com/messaging/webhooks).

_This is **NOT** official AppNeta software. While anyone is welcome to use it per the [license](https://github.com/stellaraf/worker-appneta/blob/main/LICENSe.md), this is neither supported nor sanctioned by AppNeta in any way._

# How it Works

Typically, an AppNeta observer event looks like this:

```json
{
  "type": "SQA_EVENT",
  "description": "Measured Data Loss (0.0000%) clears condition Data Loss > 2 %",
  "eventTime": 1602675084,
  "sequencerName": "example.domain.tld",
  "sequencerHost": "example.domain.tld",
  "orgId": 12345,
  "orgName": "Organization",
  "deepLink": "https://app.pm.appneta.com/pvc/pathdetail.html?st=12345&pathid=12345&timeStamp=1602675084537",
  "target": "target.domain.tld",
  "measuredParam": "DATA_LOSS",
  "measuredValue": 0,
  "pathId": 12345,
  "pathName": "Path between two things",
  "pathServiceQuality": "SQA_VIOLATED",
  "importance": 5,
  "tags": []
}
```

This doesn't exactly translate to a useful Slack message, so the worker consumes this data and turns it into something like this:

<img src="https://github.com/stellaraf/worker-appneta/blob/main/screenshot.png" alt="Screenshot" />

## Production

If forking this worker, simply set the environment variable `SLACK_ENDPOINT` to the Incoming Webhook URL for your Slack channel of choice, modify the [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler) config files to fit your environment, and have a great day ahead.

You'll use the Cloudflare Worker Route/URL you choose as the `url` when adding an observer URL via the AppNeta API. For example, the POST payload would be something like:

```json
[
  {
    "url": "https://your.cloudflare.worker",
    "testEvents": true,
    "seqEvents": true,
    "sqaEvents": true,
    "webAlertEvents": true,
    "networkChangeEvents": true,
    "blacklisted": false
  }
]
```

## Development

The entire codebase is written in [**TypeScript**](https://www.typescriptlang.org/), which means it should be easy to contribute to this project or fork and modify it as you see fit.

To run the development server, create a `dev.wrangler.toml` file that looks something like this:

```toml
account_id = "<cloudflare_account_id>"
api_token = "<cloudflare_api_token>"
entry-point = "build"
name = "appneta-alerts"
type = "webpack"
vars = {ENVIRONMENT = "development", RUST_BACKTRACE = 1, SLACK_ENDPOINT = "https://hooks.slack.com/services/<your slack channel>"}
webpack_config = "webpack.config.js"
workers_dev = true
zone_id = "<cloudflare_zone_id>"
```

Then, you can run `wrangler dev -c dev.wrangler.toml` and test the worker locally prior to pushing into production.

### AppNeta Typings

Since AppNeta doesn't have public type definitions available (ok, to be fair, I didn't look first), the typings located at [`types/appneta.d.ts`](https://github.com/stellaraf/worker-appneta/blob/main/types/appneta.d.ts) were created based off AppNeta's [API documentation](https://docs.appneta.com/event-integration.html). Since we don't control these docs, the types could change at any time, rendering the worker useless. We will aim to keep this worker up to date with the most current AppNeta API documentation.