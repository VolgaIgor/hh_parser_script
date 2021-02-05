function getDefValue(value) {
    var defValue = {
        endpoint: "",
        resume_selector: ".resume-header",
            resume_selector_name: "h2[data-qa='resume-personal-name'] span",
            resume_selector_gender: "span[data-qa='resume-personal-gender']",
            resume_selector_age: "span[data-qa='resume-personal-age']",
            resume_selector_phone: "div[data-qa='resume-contacts-phone'] span",
            resume_selector_email: "div[data-qa='resume-contact-email'] span",
            resume_selector_image: ".resume-photo__image",
            resume_selector_date: ".resume-header-additional__update-date",
        resumes_selector: ".resume-search-item",
            resumes_selector_id: ".resume-search-item__name",
            resumes_selector_age: "span[data-qa='resume-serp__resume-age']",
            resumes_selector_date: ".output__addition",
    };
    
    return ( defValue[value] !== undefined ) ? defValue[value] : ':not(*)';
}

export {getDefValue};