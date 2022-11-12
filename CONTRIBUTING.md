# Contributing

## Dependencies

1. Install Polaris or compile your own by following [this guide](https://github.com/agersant/polaris/blob/master/docs/CONTRIBUTING.md)
2. Install [Node.js](https://nodejs.org) version 14 or more

## Workflow

1. Clone the polaris-web repository with `git clone https://github.com/agersant/polaris-web.git`
2. Run Polaris with the `-w` flag pointing to your freshly cloned polaris-web, adding `/dist` at the end. For example on Windows: `polaris.exe -w C:/path/to/polaris-web/dist`
3. Within the polaris-web directory, run `npm install` followed by `npm run dev`
4. Access [http://localhost:5050/](http://localhost:5050/) to open the web UI
5. Changes you make within `polaris-web/src` are visible immediately
6. The test suite can be run with `npm test`
