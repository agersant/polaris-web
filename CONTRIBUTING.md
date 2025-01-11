# Contributing

## Dependencies

1. Install Polaris or compile your own by following [this guide](https://github.com/agersant/polaris/blob/master/docs/CONTRIBUTING.md)
2. Install [Node.js](https://nodejs.org) version 14 or more

## Workflow

1. Clone the polaris-web repository with `git clone https://github.com/agersant/polaris-web.git`
2. Run Polaris on its default port (5050)
3. Within the polaris-web directory, run `npm install` followed by `npm run dev`
4. Open the client by visiting the URL listed in the output of `npm run dev`
5. Changes you make within `polaris-web/src` are visible immediately

## Running tests

1. Run a Polaris server with the following flags: `polaris -f -w ../polaris-web/dist -c ../polaris-web/automated.config.toml`, where `../polaris-web` is this repository
2. Run `npm test`
