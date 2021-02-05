import browser from 'webextension-polyfill';

import {getDefValue} from './defValue.js';
import '../styles/options.scss';

const params = [
    "endpoint",
    "resume_selector",
        "resume_selector_name",
        "resume_selector_gender",
        "resume_selector_age",
        "resume_selector_phone",
        "resume_selector_email",
        "resume_selector_image",
        "resume_selector_date",
    "resumes_selector",
        "resumes_selector_id",
        "resumes_selector_name",
        "resumes_selector_gender",
        "resumes_selector_age",
        "resumes_selector_phone",
        "resumes_selector_email",
        "resumes_selector_image",
        "resumes_selector_date"
];

function saveSettings() {
    const storage = browser.storage.local;
    
    var data = {};
    params.forEach(function(item, i, arr) {
        var node = document.getElementById(item);
        if ( node !== null ) {
            data[item] = node.value;
        }
    });
    
    storage.set(data);
    
    console.log('saved');
}

document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get(params).then( (value) => {
        params.forEach(function(item, i, arr) {
            var node = document.getElementById(item);
            if ( node !== null ) {
                node.value = (value[item]) ? value[item] : getDefValue(item);
            }
        });
    });
    
    document.getElementById('save_button').addEventListener('click', (e) => {
        e.preventDefault();
        saveSettings();
    });
});
