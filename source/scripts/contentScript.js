import browser from 'webextension-polyfill';

function runParse() {
    
    // Функция отправки данных
    function sendResume( parentNode, data ) {
        browser.storage.local.get("endpoint").then( (storage) => {
            var endpoint = (storage.endpoint) ? storage.endpoint : '';
            
            var bodyArr = [];

            // Получаем значения параметров и сопоставляем их с ключами
            for (var key in data) {
                var value = data[key](parentNode);
                if ( value === null ) continue;
                bodyArr.push( key + '=' + encodeURIComponent( String( value ) ) );
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
        var data = {
            id: function() {
                return window.location.pathname.split('/')[2];
            },
            name: function( parentNode ) {
                var node = parentNode.querySelector("h2[data-qa='resume-personal-name'] span");
                return ( node !== null ) ? node.textContent : null;
            },
            phone: function( parentNode ) {
                var node = parentNode.querySelector("div[data-qa='resume-contacts-phone'] span");
                return ( node !== null ) ? parseInt(node.textContent.replace(/[^\d]/g, '')) : null;
            },
            email: function( parentNode ) {
                var node = parentNode.querySelector("div[data-qa='resume-contact-email'] span");
                return ( node !== null ) ? node.textContent : null;
            },
            image: function( parentNode ) {
                var node = parentNode.querySelector(".resume-photo__image");
                return ( node !== null ) ? node.src : null;
            },
            update_date: function( parentNode ) {
                var regex = /(\d{1,2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
                var dateStr = document.querySelector('.resume-header-additional__update-date').textContent;
                var exec = regex.exec( dateStr );
                var date = new Date( exec[3], exec[2] - 1, exec[1], exec[4], exec[5] );
                return date.getTime() / 1000; // Переводим дату в Unix-время
            },
            gender: function( parentNode ) {
                var node = parentNode.querySelector("span[data-qa='resume-personal-gender']");
                if ( node === null ) {
                    return null;
                } else {
                    return ( node.textContent === 'Мужчина' ) ? 0 : 1;
                }
            },
            age: function( parentNode ) {
                var node = parentNode.querySelector("span[data-qa='resume-personal-age']");
                return ( node !== null ) ? parseInt( node.textContent ) : null;
            }
        };
        sendResume( document.querySelector('.resume-header'), data );
    };

    // Функция запускающаяся на странице списка резюме
    function runResumeListParse() {
        var data = {
            id: function( parentNode ) {
                var url = new URL( parentNode.querySelector('.resume-search-item__name').href );
                return url.pathname.split('/')[2];
            },
            update_date: function( parentNode ) {
                var regex = /(\d{1,2}).([а-я]+).(?:(\d{4}).)?(\d{2}):(\d{2})/;
                var dateStr = parentNode.querySelector('.output__addition').children[0].textContent;
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
                var node = parentNode.querySelector("span[data-qa='resume-serp__resume-age']");
                if ( node === null ) {
                    return null;
                } else {
                    return parseInt( node.textContent );
                }
            }
        };
        var resumeList = document.querySelectorAll('.resume-search-item');
        resumeList.forEach(function(item, i, arr) {
            sendResume( item, data );
        });
    };

    // Определяем на какой странице находимся
    var path = window.location.pathname;
    var section = path.split('/')[1];
    
    switch (section) {
        case 'resume':
            runResumeParse();
            break;
        case 'resumes':
            runResumeListParse();
            break;
        default:
            return;
    }
};

// Задержка для прогрузки контактных данных
setTimeout(runParse, 2000);