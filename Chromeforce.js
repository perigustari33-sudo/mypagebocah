(function() {
    function isWebView() {
        if (navigator.userAgentData) {
            const brands = navigator.userAgentData.brands || [];
            if (brands.some(b => b.brand.toLowerCase().includes('webview'))) return true;
        }
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('webview') || ua.includes('wv') || (ua.includes('android') && ua.includes('version/'));
    }

    if (isWebView()) {
        const isChrome = /chrome/i.test(navigator.userAgent) && !/edge|opr|brave/i.test(navigator.userAgent);
        
        if (!isChrome) {
            const currentUrl = window.location.href;
            
            // Android Intent untuk buka URL saat ini di Chrome
            if (/android/i.test(navigator.userAgent)) {
                const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
                window.location.replace(`intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`);
            } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
                window.location.replace(currentUrl.replace(/^https?:\/\//, 'googlechrome://'));
            } else {
                window.location.replace('https://www.google.com/chrome/');
            }
        }
    }
})();
