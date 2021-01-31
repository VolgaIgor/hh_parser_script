import browser from 'webextension-polyfill';

function openWebPage(url) {
  return browser.tabs.create({url});
}

document.addEventListener('DOMContentLoaded', () => {
    openWebPage('options.html')
});