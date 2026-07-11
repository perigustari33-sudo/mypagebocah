// ============================================
// DETEKSI REFERER, INAPP BROWSER, DAN WEBVIEW
// ============================================

(function() {
    
    // 1. DETEKSI REFERER
    function detectReferer() {
        const referer = document.referrer || '';
        
        if (referer.length > 0) {
            // ALERT DI DALAM BLOK TRUE
            alert(`🔗 REFERER DETECTED\n\nReferer terdeteksi: ${referer}`);
            
            return {
                isReferer: true,
                refererUrl: referer,
                message: `Referer terdeteksi: ${referer}`
            };
        } else {
            return {
                isReferer: false,
                refererUrl: '',
                message: 'Tidak ada referer (direct access)'
            };
        }
    }

    // 2. DETEKSI INAPP BROWSER (Browser internal aplikasi)
    function detectInApp() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let appName = '';

        // Deteksi Instagram
        if (userAgent.indexOf('Instagram') > -1) {
            appName = 'Instagram';
        }
        // Deteksi Facebook
        else if (userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1) {
            appName = 'Facebook';
        }
        // Deteksi TikTok
        else if (userAgent.indexOf('TikTok') > -1) {
            appName = 'TikTok';
        }
        // Deteksi Twitter/X
        else if (userAgent.indexOf('Twitter') > -1 || userAgent.indexOf('X') > -1) {
            appName = 'Twitter/X';
        }
        // Deteksi LINE
        else if (userAgent.indexOf('Line') > -1) {
            appName = 'LINE';
        }
        // Deteksi WhatsApp
        else if (userAgent.indexOf('WhatsApp') > -1) {
            appName = 'WhatsApp';
        }
        // Deteksi Telegram
        else if (userAgent.indexOf('Telegram') > -1) {
            appName = 'Telegram';
        }
        // Deteksi Snapchat
        else if (userAgent.indexOf('Snapchat') > -1) {
            appName = 'Snapchat';
        }
        // Deteksi WeChat
        else if (userAgent.indexOf('MicroMessenger') > -1) {
            appName = 'WeChat';
        }
        // Deteksi Chrome
        else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
            appName = 'Chrome';
        }
        // Deteksi Safari
        else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            appName = 'Safari';
        }
        // Deteksi Firefox
        else if (userAgent.indexOf('Firefox') > -1) {
            appName = 'Firefox';
        }
        // Deteksi Edge
        else if (userAgent.indexOf('Edg') > -1) {
            appName = 'Edge';
        }
        // Deteksi Opera
        else if (userAgent.indexOf('OPR') > -1) {
            appName = 'Opera';
        }

        if (appName) {
            // ALERT DI DALAM BLOK TRUE
            alert(`📱 INAPP BROWSER DETECTED\n\nDibuka dari aplikasi: ${appName}`);
            
            return {
                isInApp: true,
                appName: appName,
                message: `Dibuka dari aplikasi: ${appName}`
            };
        } else {
            return {
                isInApp: false,
                appName: '',
                message: 'Dibuka dari browser normal'
            };
        }
    }

    // 3. DETEKSI WEBVIEW
    function detectWebView() {
        const userAgent = navigator.userAgent || '';
        let webViewType = '';

        // Deteksi Android WebView
        if (/wv\)/i.test(userAgent) || /WebView/i.test(userAgent)) {
            webViewType = 'Android WebView';
        }
        // Deteksi iOS UIWebView atau WKWebView
        else if (/UIWebView/i.test(userAgent) || /WKWebView/i.test(userAgent)) {
            webViewType = 'iOS WebView';
        }
        // Deteksi Chrome WebView
        else if (/Chrome\/(?:[0-9]+)\.(?:[0-9]+)\.(?:[0-9]+)\.(?:[0-9]+)/i.test(userAgent) && 
                 /Mobile/i.test(userAgent) && 
                 !/Safari/i.test(userAgent)) {
            webViewType = 'Chrome WebView';
        }
        // Deteksi generic WebView
        else if (/wv/.test(userAgent)) {
            webViewType = 'Generic WebView';
        }

        if (webViewType) {
            // ALERT DI DALAM BLOK TRUE
            alert(`🌐 WEBVIEW DETECTED\n\nWebView terdeteksi: ${webViewType}`);
            
            return {
                isWebView: true,
                webViewType: webViewType,
                message: `WebView terdeteksi: ${webViewType}`
            };
        } else {
            return {
                isWebView: false,
                webViewType: '',
                message: 'Bukan WebView (browser normal)'
            };
        }
    }

    // 4. EKSEKUSI DETEKSI (alert akan muncul otomatis di dalam fungsi masing-masing jika true)
    const refererResult = detectReferer();
    const inAppResult = detectInApp();
    const webViewResult = detectWebView();

    // 5. TAMPILKAN DI KONSOLE (untuk debugging)
    function showConsoleLog() {
        console.log('========== DETEKSI BROWSER ==========');
        console.log('Referer:', refererResult);
        console.log('InApp:', inAppResult);
        console.log('WebView:', webViewResult);
        console.log('User Agent:', navigator.userAgent);
        console.log('=======================================');
    }

    // 6. EXPOSE FUNGSI KE GLOBAL
    window.detectReferer = detectReferer;
    window.detectInApp = detectInApp;
    window.detectWebView = detectWebView;
    window.showConsoleLog = showConsoleLog;
    window.getDetectionResults = function() {
        return {
            referer: detectReferer(),
            inApp: detectInApp(),
            webView: detectWebView()
        };
    };

    // 7. JALANKAN
    showConsoleLog();

})();
