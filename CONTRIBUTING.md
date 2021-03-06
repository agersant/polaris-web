# Setup

The first thing you need to start iterating on the Polaris web interface is a working Polaris executable. You can either use your existing Polaris installation, or compile your own by following [this guide](https://github.com/agersant/polaris/blob/master/CONTRIBUTING.md). Once you have a working Polaris installation, you're almost done! Here is what comes after:

1. Clone the polaris-web repository with `git clone https://github.com/agersant/polaris-web.git`
2. Run Polaris with the `-w` pointing to your freshly cloned polaris web, adding `/dist` at the end. For example: `polaris.exe -w C:/path/to/polaris-web/dist`
3. Install [Node.js](https://nodejs.org) version `14.16.0`
4. Within the polaris-web directory, run `npm install` and then `npm run watch`
5. Access [http://localhost:5050/](http://localhost:5050/) to open the web UI
6. Changes you make within `polaris-web/src` are visible immediately

The test suite can be run with `npm test`
