# Setup

The first thing you need to start iterating on the Polaris web interface is a working Polaris executable. You can either use your existing Polaris installation, or compile your own by following [this guide](https://github.com/agersant/polaris/blob/master/CONTRIBUTING.md). Once you have a working Polaris installation, you're almost done! Here is what comes after:

1. Clone the polaris-web repository with `git clone https://github.com/agersant/polaris-web.git`
2. Run Polaris with the `-w` flag indicating where your polaris-web repository is. For example on Windows using your existing Polaris installation, you would run this command: `polaris.exe -w C:/path/to/polaris-web`
3. Do some work in your polaris-web directory
4. Access [http://localhost:5050/](http://localhost:5050/) to see the Web UI and look at your changes!

# Running Unit Tests

Running the unit tests for Polaris web requires installing a few dependencies:

1. [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) (Java Runtime Environment, the JDK is not needed)
2. PhantomJS, the headless browser. Install it via [npm](https://docs.npmjs.com/getting-started/installing-node) with the command `npm install -g phantomjs-prebuilt`
3. Nightwatch, the test harness. Install it via [npm](https://docs.npmjs.com/getting-started/installing-node) with the command `npm install -g nightwatch`
4. Selenium, the browser automation suite. Download from [here](http://selenium-release.storage.googleapis.com/3.4/selenium-server-standalone-3.4.0.jar)

After you've installed all that:

- Run the Selenium server with this command: `java -jar selenium.jar` (selenium.jar being the file you downloaded in step 4)
- Make sure your Polaris server is running
- Execute the command `nightwatch` from your polaris-web directory
- You should start seeing some test reports in your console

For reference, you can look at the Travis CI [configuration file](travis.yml?raw=true) of this project, which runs similar commands to automatically run the test suite on every commit.
