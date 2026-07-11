// ============================================
// DETEKSI REFERER, INAPP BROWSER, DAN WEBVIEW
// MENGGUNAKAN METODE AKSES TERBATAS
// ============================================

(function() {
    
    // 1. DETEKSI REFERER
    function detectReferer() {
        const referer = document.referrer || '';
        
        if (referer.length > 0) {
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

    // 2. DETEKSI AKSES TERBATAS (CORE METHOD)
    function detectLimitedAccess() {
        const results = {
            isLimited: false,
            reasons: [],
            details: {}
        };

        try {
            // 2.1 CEK AKSES KE window.opener
            // Di Chrome Custom Tab / InApp, akses ke opener terbatas
            if (window.opener) {
                try {
                    const openerOrigin = window.opener.location.origin;
                    results.details.openerOrigin = openerOrigin;
                    if (openerOrigin !== window.location.origin) {
                        results.isLimited = true;
                        results.reasons.push('Cross-origin opener (akses terbatas)');
                    }
                } catch(e) {
                    // Tidak bisa akses opener = terbatas
                    results.isLimited = true;
                    results.reasons.push('Tidak bisa akses window.opener (security restriction)');
                    results.details.openerError = e.message;
                }
            }

            // 2.2 CEK AKSES KE window.parent (iframe)
            if (window.parent !== window.self) {
                try {
                    const parentOrigin = window.parent.location.origin;
                    results.details.parentOrigin = parentOrigin;
                    if (parentOrigin !== window.location.origin) {
                        results.isLimited = true;
                        results.reasons.push('Cross-origin iframe (akses terbatas)');
                    }
                } catch(e) {
                    // Tidak bisa akses parent = terbatas
                    results.isLimited = true;
                    results.reasons.push('Tidak bisa akses window.parent (security restriction)');
                    results.details.parentError = e.message;
                }
            }

            // 2.3 CEK AKSES KE window.top
            if (window.top !== window.self) {
                try {
                    const topOrigin = window.top.location.origin;
                    results.details.topOrigin = topOrigin;
                    if (topOrigin !== window.location.origin) {
                        results.isLimited = true;
                        results.reasons.push('Cross-origin top frame (akses terbatas)');
                    }
                } catch(e) {
                    results.isLimited = true;
                    results.reasons.push('Tidak bisa akses window.top (security restriction)');
                    results.details.topError = e.message;
                }
            }

            // 2.4 CEK AKSES KE localStorage (di WebView sering terbatas)
            try {
                const testKey = '_test_access_' + Date.now();
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                results.details.localStorageAccess = true;
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('localStorage tidak dapat diakses');
                results.details.localStorageError = e.message;
            }

            // 2.5 CEK AKSES KE sessionStorage
            try {
                const testKey = '_test_access_' + Date.now();
                sessionStorage.setItem(testKey, 'test');
                sessionStorage.removeItem(testKey);
                results.details.sessionStorageAccess = true;
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('sessionStorage tidak dapat diakses');
                results.details.sessionStorageError = e.message;
            }

            // 2.6 CEK AKSES KE cookies
            try {
                document.cookie = '_test_cookie=test; path=/';
                const cookieAccess = document.cookie.indexOf('_test_cookie') > -1;
                document.cookie = '_test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                results.details.cookieAccess = cookieAccess;
                if (!cookieAccess) {
                    results.isLimited = true;
                    results.reasons.push('Cookies tidak dapat diakses');
                }
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('Error mengakses cookies');
                results.details.cookieError = e.message;
            }

            // 2.7 CEK AKSES KE navigator.clipboard
            if (navigator.clipboard) {
                try {
                    navigator.clipboard.readText().then(
                        () => { results.details.clipboardAccess = true; },
                        () => { 
                            results.isLimited = true;
                            results.reasons.push('Clipboard tidak dapat diakses (permission denied)');
                        }
                    );
                } catch(e) {
                    results.isLimited = true;
                    results.reasons.push('Clipboard tidak dapat diakses');
                    results.details.clipboardError = e.message;
                }
            }

            // 2.8 CEK AKSES KE window.open (popup)
            try {
                const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
                if (testPopup) {
                    testPopup.close();
                    results.details.popupAccess = true;
                } else {
                    results.isLimited = true;
                    results.reasons.push('Popup tidak dapat dibuka (blocked)');
                }
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('Error membuka popup');
                results.details.popupError = e.message;
            }

            // 2.9 CEK AKSES KE history
            try {
                const historyLength = history.length;
                results.details.historyAccess = true;
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('History tidak dapat diakses');
                results.details.historyError = e.message;
            }

        } catch(e) {
            results.isLimited = true;
            results.reasons.push('Error umum: ' + e.message);
            results.details.generalError = e.message;
        }

        return results;
    }

    // 3. DETEKSI INAPP BROWSER (MENGGUNAKAN LIMITED ACCESS)
    function detectInApp() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const limitedAccess = detectLimitedAccess();
        let appName = '';
        let detectionMethod = '';

        // 3.1 CEK DARI USER AGENT (Metode cepat)
        if (userAgent.indexOf('Instagram') > -1) {
            appName = 'Instagram';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1) {
            appName = 'Facebook';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('TikTok') > -1) {
            appName = 'TikTok';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('Twitter') > -1 || userAgent.indexOf('X') > -1) {
            appName = 'Twitter/X';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('Line') > -1) {
            appName = 'LINE';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('WhatsApp') > -1) {
            appName = 'WhatsApp';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('Telegram') > -1) {
            appName = 'Telegram';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('Snapchat') > -1) {
            appName = 'Snapchat';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('MicroMessenger') > -1) {
            appName = 'WeChat';
            detectionMethod = 'User Agent';
        }

        // 3.2 CEK DARI LIMITED ACCESS (Metode utama untuk CCT)
        if (!appName && limitedAccess.isLimited) {
            // Deteksi dari pola akses terbatas
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari) {
                // Ini kemungkinan Chrome Custom Tab
                appName = 'Chrome Custom Tab (InApp)';
                detectionMethod = 'Limited Access Pattern';
            } else if (isMobile && (isChrome || isSafari)) {
                appName = 'InApp Browser (Unknown)';
                detectionMethod = 'Limited Access Pattern';
            }
        }

        // 3.3 CEK DARI REFERER (Tambahan)
        if (!appName && document.referrer) {
            const ref = document.referrer.toLowerCase();
            if (ref.indexOf('instagram.com') > -1) {
                appName = 'Instagram';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('facebook.com') > -1) {
                appName = 'Facebook';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('t.me') > -1 || ref.indexOf('telegram.org') > -1) {
                appName = 'Telegram';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('whatsapp.com') > -1) {
                appName = 'WhatsApp';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('twitter.com') > -1 || ref.indexOf('x.com') > -1) {
                appName = 'Twitter/X';
                detectionMethod = 'Referer';
            }
        }

        // 3.4 DETEKSI CHROME CUSTOM TAB DARI POLA AKSES TERBATAS
        if (!appName) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari && limitedAccess.isLimited) {
                appName = 'Chrome Custom Tab';
                detectionMethod = 'Limited Access (Chrome Pattern)';
            }
        }

        // 3.5 TAMPILKAN ALERT JIKA TERDETEKSI
        if (appName) {
            const alertMessage = `📱 INAPP BROWSER DETECTED\n\n` +
                `Aplikasi: ${appName}\n` +
                `Metode: ${detectionMethod}\n\n` +
                `Akses Terbatas:\n` +
                limitedAccess.reasons.map(r => `• ${r}`).join('\n');
            
            alert(alertMessage);
            
            return {
                isInApp: true,
                appName: appName,
                detectionMethod: detectionMethod,
                message: `Dibuka dari aplikasi: ${appName}`,
                limitedAccess: limitedAccess
            };
        } else {
            return {
                isInApp: false,
                appName: '',
                detectionMethod: '',
                message: 'Dibuka dari browser normal',
                limitedAccess: limitedAccess
            };
        }
    }

    // 4. DETEKSI WEBVIEW
    function detectWebView() {
        const userAgent = navigator.userAgent || '';
        const limitedAccess = detectLimitedAccess();
        let webViewType = '';

        // Deteksi dari User Agent
        if (/wv\)/i.test(userAgent) || /WebView/i.test(userAgent)) {
            webViewType = 'Android WebView';
        }
        else if (/UIWebView/i.test(userAgent) || /WKWebView/i.test(userAgent)) {
            webViewType = 'iOS WebView';
        }
        else if (window.TelegramWebview !== undefined || window.Telegram !== undefined) {
            webViewType = 'Telegram WebView';
        }
        // Deteksi dari limited access (WebView biasanya lebih terbatas)
        else if (limitedAccess.isLimited && limitedAccess.reasons.length >= 3) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari) {
                webViewType = 'Chrome Custom Tab / WebView';
            } else if (isMobile && (isChrome || isSafari)) {
                webViewType = 'Generic WebView';
            }
        }
        else if (/wv/.test(userAgent)) {
            webViewType = 'Generic WebView';
        }

        if (webViewType) {
            alert(`🌐 WEBVIEW DETECTED\n\nWebView terdeteksi: ${webViewType}`);
            
            return {
                isWebView: true,
                webViewType: webViewType,
                message: `WebView terdeteksi: ${webViewType}`,
                limitedAccess: limitedAccess
            };
        } else {
            return {
                isWebView: false,
                webViewType: '',
                message: 'Bukan WebView (browser normal)',
                limitedAccess: limitedAccess
            };
        }
    }

    // 5. EKSEKUSI DETEKSI
    const refererResult = detectReferer();
    const inAppResult = detectInApp();
    const webViewResult = detectWebView();
    const limitedAccessResult = detectLimitedAccess();

    // 6. TAMPILKAN DI KONSOLE
    function showConsoleLog() {
        console.log('========== DETEKSI BROWSER ==========');
        console.log('Referer:', refererResult);
        console.log('InApp:', inAppResult);
        console.log('WebView:', webViewResult);
        console.log('Limited Access:', limitedAccessResult);
        console.log('User Agent:', navigator.userAgent);
        console.log('Referer URL:', document.referrer);
        console.log('=======================================');
    }

    // 7. EXPOSE FUNGSI KE GLOBAL
    window.detectReferer = detectReferer;
    window.detectInApp = detectInApp;
    window.detectWebView = detectWebView;
    window.detectLimitedAccess = detectLimitedAccess;
    window.showConsoleLog = showConsoleLog;
    window.getDetectionResults = function() {
        return {
            referer: detectReferer(),
            inApp: detectInApp(),
            webView: detectWebView(),
            limitedAccess: detectLimitedAccess()
        };
    };

    // 8. JALANKAN
    showConsoleLog();

})();
