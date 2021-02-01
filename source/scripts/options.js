import browser from 'webextension-polyfill';

import '../styles/options.scss';

function saveSettings() {
    const storage = browser.storage.local;
    
    storage.set({
        endpoint: document.getElementById("endpoint").value,
        resume_selector: document.getElementById("resume_selector").value,
        resumes_selector: document.getElementById("resumes_selector").value
    });
    
    console.log('saved');
}

document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get("endpoint").then( (value) => {
        document.getElementById("endpoint").value = (value.endpoint) ? value.endpoint : '';
    });
    
    browser.storage.local.get("resume_selector").then( (value) => {
        document.getElementById("resume_selector").value = (value.resume_selector) ? value.resume_selector : '.resume-header';
    });
    
    browser.storage.local.get("resumes_selector").then( (value) => {
        document.getElementById("resumes_selector").value = (value.resumes_selector) ? value.resumes_selector : '.resume-search-item';
    });
    
    document.getElementById('save_button').addEventListener('click', (e) => {
        e.preventDefault();
        saveSettings();
    });
});
