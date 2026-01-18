// Google Translate setup with cookie persistence
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,fr',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
    }, 'google_translate_element');
}

// Cookie handler for translation persistence
function setCookie(key, value, expiry) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

// Language switcher that uses Google's API directly
function changeLanguage(langCode) {
    if (langCode === 'fr') {
        doGTranslate('en|fr');
        setCookie('googtrans', '/en/fr', 1);
    } else {
        doGTranslate('fr|en');
        setCookie('googtrans', '/en/en', 1);
    }
    
    // Force translation of dynamic content
    setTimeout(() => {
        const googleFrame = document.getElementsByClassName('goog-te-menu-frame')[0];
        if (googleFrame) {
            googleFrame.contentDocument.getElementById('gt-sl-gms').value = langCode;
            googleFrame.contentDocument.getElementById('gt-submit').click();
        }
    }, 100);
}

// Translate any dynamically loaded content
function translateNewContent(element) {
    if (window.google && window.google.translate) {
        const iframe = document.getElementsByClassName('goog-te-menu-frame')[0];
        if (iframe) {
            const currentLang = iframe.contentDocument.getElementById('gt-sl-gms').value;
            if (currentLang !== 'en') {
                google.translate.TranslateElement.getInstance().translateElement(element);
            }
        }
    }
}

// Listen for accordion changes to translate new content
document.addEventListener('DOMContentLoaded', () => {
    const accordion = document.getElementById('whyChooseAccordion');
    if (accordion) {
        accordion.addEventListener('shown.bs.collapse', (e) => {
            translateNewContent(e.target);
        });
    }
});
