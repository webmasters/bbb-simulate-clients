const {Builder, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');

const by = require('selenium-webdriver/lib/by');
const webdriver = require('selenium-webdriver/lib/webdriver'),
    Condition = webdriver.Condition,
    WebElementCondition = webdriver.WebElementCondition;

const options = new firefox.Options();
//https://stackoverflow.com/questions/38234576/how-to-use-fake-web-cam-on-mozilla-firefox-using-selenium-java
options.setPreference('media.navigator.permission.disabled', true);
options.setPreference('media.navigator.streams.fake', true);
options.setPreference('intl.accept_languages', 'en-US, en');


const room = process.env.ROOM;
const join_user = process.env.JOIN_USER;
const host = process.env.HOST;
const no_headless = process.env.NO_HEADLESS;
const listenOnly = true;

if(!no_headless) {
  options.addArguments('--headless');
}

const joinUserLocator = By.css('input.form-control.join-form');
const joinUserButtonLocator = By.css('button.form-control.join-form');

const audioModalLocator = By.css('div[aria-label="Join audio modal"]');
const closeAudioModalLocator = By.css('button[aria-label="Close Join audio modal"]');
const selectMicrophoneLocator = By.css('button[aria-label="Microphone"]');
const selectListenOnlyLocator = By.css('button[aria-label="Listen only"]');
const echoIsAudileLocator = By.css('button[aria-label="Echo is audible"]');
const joinAudioLocator = By.css('button[aria-label="Join audio"]');

const shareWebcamLocator = By.css('button[aria-label="Share webcam"]');
const setQualityLocator = By.css('select#setQuality');
const startSharingWebcamLocator = By.css('button[aria-label="Start sharing"]');

const echoOrMicrolocator = By.css([echoIsAudileLocator, selectMicrophoneLocator].map(x => x.value).join(','));

until.elementNotLocated = function(locator) {
  locator = by.checkedLocator(locator);
  let locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';
  return new Condition('for element to be not located ' + locatorStr,
    function(driver) {
      return driver.findElements(locator).then(function(elements) {
        return elements.length == 0;
      });
    });
};

(async function example() {
  let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

  try {
    await driver.get(host + '/b/' + room);

    //console.log('Waiting for join user');

    await driver.wait(until.elementLocated(joinUserLocator));
    await driver.findElement(joinUserLocator).sendKeys(join_user);
    await driver.findElement(joinUserButtonLocator).click();

    //console.log('Waiting for room');

    if(listenOnly) {
        await driver.wait(until.elementLocated(selectListenOnlyLocator));
        await driver.findElement(selectListenOnlyLocator).click();

        await driver.wait(until.elementNotLocated(closeAudioModalLocator));
    } else {
      let ariaLabel = '';
      do {
        await driver.wait(until.elementLocated(selectMicrophoneLocator));
        await driver.findElement(selectMicrophoneLocator).click();

        //console.log('click to run echo test');

        await driver.wait(until.elementTextContains(driver.findElement(audioModalLocator), 'Connecting to echo test'));

        //console.log('echo test');

        await driver.wait(until.elementLocated(echoOrMicrolocator));

        //console.log('echo test - finished');

        let element = await driver.findElement(echoOrMicrolocator);
        //console.log(element);
        ariaLabel = await element.getAttribute('aria-label');
        //console.log(ariaLabel);

        if(ariaLabel == 'Echo is audible') {
          //console.log('echo test - good');
          await element.click();
        } else {
          //console.log('echo test - wrong');
          await driver.findElement(closeAudioModalLocator).click();

          //console.log('echo test - restart');
          await driver.findElement(joinAudioLocator).click();
          //console.log('echo test - restarted');
        }
      } while(ariaLabel != 'Echo is audible');
    }

    await driver.wait(until.elementLocated(shareWebcamLocator));
    await driver.findElement(shareWebcamLocator).click();

    await driver.wait(until.elementLocated(setQualityLocator));

    let selectElement = await driver.findElement(setQualityLocator);
    let optionElements = await selectElement.findElements(By.css('option'));

    //low,medium,high,hd
    await driver.findElement(setQualityLocator).findElement(By.css('option[value="medium"]')).click();
    await driver.findElement(startSharingWebcamLocator).click();

    let wait = function() {
      if(fs.existsSync('/tmp/test.exit')) {
        //console.log('true');
        return driver.quit();
      } else {
        //console.log('retry');
        setTimeout(wait, 3000);
      }
    };

    await wait();
  } finally {
    //await driver.quit();
  }
})();
