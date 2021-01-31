import browser from 'webextension-polyfill';

import '../styles/options.scss';

function saveSettings() {
    const storage = browser.storage.local;
    
    storage.set({endpoint: document.getElementById("endpoint").value});
    
    console.log('saved');
}

document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get("endpoint").then( (value) => {
        document.getElementById("endpoint").value = (value.endpoint) ? value.endpoint : '';
    });
    
    document.getElementById('save_button').addEventListener('click', (e) => {
        e.preventDefault();
        saveSettings();
    });
});
