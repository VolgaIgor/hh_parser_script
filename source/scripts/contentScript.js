import browser from 'webextension-polyfill';
import {getDefValue} from './defValue.js';

function runParse() {
    
    // Функция отправки данных
    function sendResume( data ) {
        browser.storage.local.get("endpoint").then( (storage) => {
            var endpoint = (storage.endpoint) ? storage.endpoint : '';
            
            var bodyArr = [];

            // Получаем значения параметров и сопоставляем их с ключами
            for (var key in data) {
                if ( data[key] === null ) continue;
                bodyArr.push( key + '=' + encodeURIComponent( String( data[key] ) ) );
            }

            var body = bodyArr.join('&');

            var xhr = new XMLHttpRequest();

            xhr.open("POST", endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            xhr.send(body);
        });
    };

    // Функция запускающаяся на странице резюме
    function runResumeParse() {
        const params = [
            "resume_selector",
            "resume_selector_name",
            "resume_selector_gender",
            "resume_selector_age",
            "resume_selector_phone",
            "resume_selector_email",
            "resume_selector_image",
            "resume_selector_date"
        ];
        browser.storage.local.get(params).then( (storage) => {
            var data = {
                id: function() {
                    return window.location.pathname.split('/')[2];
                },
                name: function( parentNode ) {
                    var selector = (storage.resume_selector_name) ? storage.resume_selector_name : getDefValue('resume_selector_name');
                    
                    var node = parentNode.querySelector( selector );
                    return ( node !== null ) ? node.textContent : null;
                },
                phone: function( parentNode ) {
                    var selector = (storage.resume_selector_phone) ? storage.resume_selector_phone : getDefValue('resume_selector_phone');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? parseInt(node.textContent.replace(/[^\d]/g, '')) : null;
                },
                email: function( parentNode ) {
                    var selector = (storage.resume_selector_email) ? storage.resume_selector_email : getDefValue('resume_selector_email');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? node.textContent : null;
                },
                image: function( parentNode ) {
                    var selector = (storage.resume_selector_image) ? storage.resume_selector_image : getDefValue('resume_selector_image');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? node.src : null;
                },
                update_date: function( parentNode ) {
                    var selector = (storage.resume_selector_date) ? storage.resume_selector_date : getDefValue('resume_selector_date');
                    
                    var regex = /(\d{1,2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
                    var dateNode = parentNode.querySelector(selector);
                    if ( dateNode === null ) {
                        return null;
                    }
                    
                    var dateStr = dateNode.textContent;
                    var exec = regex.exec( dateStr );
                    var date = new Date( exec[3], exec[2] - 1, exec[1], exec[4], exec[5] );
                    return date.getTime() / 1000; // Переводим дату в Unix-время
                },
                gender: function( parentNode ) {
                    var selector = (storage.resume_selector_gender) ? storage.resume_selector_gender : getDefValue('resume_selector_gender');
                    
                    var node = parentNode.querySelector(selector);
                    if ( node === null ) {
                        return null;
                    } else {
                        return ( node.textContent === 'Мужчина' ) ? 0 : 1;
                    }
                },
                age: function( parentNode ) {
                    var selector = (storage.resume_selector_age) ? storage.resume_selector_age : getDefValue('resume_selector_age');
                    
                    var node = parentNode.querySelector("span[data-qa='resume-personal-age']");
                    return ( node !== null ) ? parseInt( node.textContent ) : null;
                }
            };
            
            var resume_selector = (storage.resume_selector) ? storage.resume_selector : getDefValue('resume_selector');
            var resume = document.querySelector( resume_selector );
            if ( resume !== null ) {
                var sendData = {};
                for (var key in data) {
                    sendData[key] = data[key]( resume );
                }
                sendResume( sendData );
            }
        });
    };

    // Функция запускающаяся на странице списка резюме
    function runResumeListParse() {
        const params = [
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
        
        browser.storage.local.get(params).then( (storage) => {
            var data = {
                id: function( parentNode ) {
                    var selector = (storage.resumes_selector_id) ? storage.resumes_selector_id : getDefValue('resumes_selector_id');
                    
                    var url = new URL( parentNode.querySelector(selector).href );
                    return url.pathname.split('/')[2];
                },
                update_date: function( parentNode ) {
                    var selector = (storage.resumes_selector_date) ? storage.resumes_selector_date : getDefValue('resumes_selector_date');
                    
                    var regex = /(\d{1,2}).([а-я]+).(?:(\d{4}).)?(\d{2}):(\d{2})/;
                    var dateNode = parentNode.querySelector(selector);
                    if ( dateNode === null ) {
                        return null;
                    }
                    
                    var dateStr = dateNode.children[0].textContent;
                    var exec = regex.exec( dateStr );
                    var months = [ 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря' ];
                    var date = new Date(
                        ( (exec[3] !== undefined ) ? exec[3] : (new Date()).getFullYear() ),
                        months.indexOf( exec[2] ),
                        exec[1],
                        exec[4],
                        exec[5]
                    );
                    return date.getTime() / 1000;
                },
                age: function( parentNode ) {
                    var selector = (storage.resumes_selector_age) ? storage.resumes_selector_age : getDefValue('resumes_selector_age');
                    
                    var node = parentNode.querySelector(selector);
                    if ( node === null ) {
                        return null;
                    } else {
                        return parseInt( node.textContent );
                    }
                },
                gender: function( parentNode ) {
                    var selector = (storage.resumes_selector_gender) ? storage.resumes_selector_gender : getDefValue('resumes_selector_gender');
                    
                    var node = parentNode.querySelector(selector);
                    if ( node === null ) {
                        return null;
                    } else {
                        return ( node.textContent === 'Мужчина' ) ? 0 : 1;
                    }
                },
                name: function( parentNode ) {
                    var selector = (storage.resumes_selector_name) ? storage.resumes_selector_name : getDefValue('resumes_selector_name');
                    
                    var node = parentNode.querySelector( selector );
                    return ( node !== null ) ? node.textContent : null;
                },
                phone: function( parentNode ) {
                    var selector = (storage.resumes_selector_phone) ? storage.resumes_selector_phone : getDefValue('resumes_selector_phone');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? parseInt(node.textContent.replace(/[^\d]/g, '')) : null;
                },
                email: function( parentNode ) {
                    var selector = (storage.resumes_selector_email) ? storage.resumes_selector_email : getDefValue('resumes_selector_email');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? node.textContent : null;
                },
                image: function( parentNode ) {
                    var selector = (storage.resumes_selector_image) ? storage.resumes_selector_image : getDefValue('resumes_selector_image');
                    
                    var node = parentNode.querySelector(selector);
                    return ( node !== null ) ? node.src : null;
                }
            };
            
            var resumes_selector = (storage.resumes_selector) ? storage.resumes_selector : getDefValue('resumes_selector');
            var resumes = document.querySelectorAll( resumes_selector );
            if ( resumes.length !== 0 ) {
                resumes.forEach(function(item, i, arr) {
                    var sendData = {};
                    for (var key in data) {
                        sendData[key] = data[key]( item );
                    }
                    sendResume( sendData );
                });
            }
        });
    };
    
    runResumeParse();
    runResumeListParse();
};

// Задержка для прогрузки контактных данных
setTimeout(runParse, 2000);