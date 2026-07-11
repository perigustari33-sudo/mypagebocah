// ============================================
// DETEKSI REFERER, INAPP BROWSER, DAN WEBVIEW
// DENGAN DETEKSI KHUSUS TELEGRAM
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

    // 2. DETEKSI KHUSUS TELEGRAM (METODE UTAMA)
    function detectTelegram() {
        const userAgent = navigator.userAgent || '';
        const referer = document.referrer || '';
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        let isTelegram = false;
        let detectionMethods = [];
        let confidence = 0;

        // 2.1 CEK DARI URL PARAMETER (PALING AKURAT)
        // Telegram sering menambahkan parameter saat membuka link
        const tgParams = ['tg', 'telegram', 'start', 'startapp', 'tgWebApp', 'tgWebAppData', 'tgWebAppVersion', 'tgWebAppPlatform'];
        let foundParams = [];
        
        urlParams.forEach((value, key) => {
            if (tgParams.some(p => key.toLowerCase().includes(p))) {
                foundParams.push(key);
                confidence += 25;
            }
        });
        
        hashParams.forEach((value, key) => {
            if (tgParams.some(p => key.toLowerCase().includes(p))) {
                foundParams.push(key);
                confidence += 25;
            }
        });

        if (foundParams.length > 0) {
            isTelegram = true;
            detectionMethods.push(`URL parameter Telegram: ${foundParams.join(', ')}`);
        }

        // 2.2 CEK DARI REFERER
        if (referer) {
            if (referer.indexOf('t.me') > -1 || 
                referer.indexOf('telegram.org') > -1 || 
                referer.indexOf('tg://') > -1) {
                isTelegram = true;
                confidence += 30;
                detectionMethods.push(`Referer Telegram: ${referer}`);
            }
        }

        // 2.3 CEK DARI WINDOW OBJECT (WebApp API)
        if (window.Telegram !== undefined || 
            window.TelegramWebApp !== undefined || 
            window.TelegramGameProxy !== undefined) {
            isTelegram = true;
            confidence += 40;
            detectionMethods.push('Telegram WebApp API terdeteksi');
        }

        // 2.4 CEK DARI PERFORMANCE TIMING
        try {
            const perf = performance.getEntriesByType('navigation');
            if (perf.length > 0) {
                // Telegram sering menggunakan redirect
                if (perf[0].redirectCount > 0) {
                    // Cek apakah redirect dari t.me
                    const nav = performance.getEntriesByType('navigation')[0];
                    if (nav && nav.name && nav.name.indexOf('t.me') > -1) {
                        isTelegram = true;
                        confidence += 20;
                        detectionMethods.push('Redirect dari t.me');
                    }
                }
            }
        } catch(e) {}

        // 2.5 CEK DARI USER AGENT (Deteksi tidak langsung)
        // Telegram di Android: Chrome + Mobile + (tidak ada indikasi khusus)
        // Tapi kita bisa gunakan kombinasi
        if (!isTelegram) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari) {
                // Cek apakah ada indikasi lain
                // 1. Tidak ada referer
                // 2. Tidak ada window.opener
                // 3. Berasal dari external (bukan bookmark)
                if (!referer && !window.opener) {
                    // Ini bisa Telegram atau CCT lain
                    // Tingkatkan confidence sedikit
                    confidence += 10;
                    
                    // Cek apakah ada parameter tg
                    if (foundParams.length === 0) {
                        // Cek dari DOM: apakah ada elemen Telegram?
                        const hasTelegramElements = document.querySelectorAll(
                            '[data-telegram], [class*="telegram"], [id*="telegram"]'
                        ).length > 0;
                        
                        if (hasTelegramElements) {
                            isTelegram = true;
                            confidence += 15;
                            detectionMethods.push('Elemen Telegram di DOM');
                        }
                    }
                }
            }
        }

        // 2.6 CEK DARI SCREEN ORIENTATION (Telegram sering force portrait)
        try {
            if (window.screen && window.screen.orientation) {
                // Telegram di mobile sering di portrait
                if (window.screen.orientation.type === 'portrait-primary' || 
                    window.screen.orientation.type === 'portrait-secondary') {
                    // Ini hanya indikasi tambahan
                }
            }
        } catch(e) {}

        // 2.7 CEK DARI NAVIGATOR CONNECTION
        try {
            if (navigator.connection) {
                // Telegram sering menggunakan network yang sama dengan aplikasi
                // Tidak terlalu berguna untuk deteksi
            }
        } catch(e) {}

        // 3. TENTUKAN HASIL
        const isTelegramDetected = isTelegram && confidence >= 20;
        
        if (isTelegramDetected) {
            return {
                isTelegram: true,
                confidence: Math.min(confidence, 100),
                methods: detectionMethods,
                message: `Telegram terdeteksi (confidence: ${Math.min(confidence, 100)}%)`,
                details: {
                    foundParams: foundParams,
                    referer: referer,
                    hasTelegramAPI: window.Telegram !== undefined,
                    hasWebAppAPI: window.TelegramWebApp !== undefined,
                    userAgent: userAgent
                }
            };
        } else {
            return {
                isTelegram: false,
                confidence: confidence,
                methods: [],
                message: 'Bukan Telegram',
                details: {
                    foundParams: foundParams,
                    referer: referer,
                    hasTelegramAPI: window.Telegram !== undefined,
                    hasWebAppAPI: window.TelegramWebApp !== undefined,
                    userAgent: userAgent
                }
            };
        }
    }

    // 3. DETEKSI INAPP BROWSER (DENGAN DETEKSI TELEGRAM)
    function detectInApp() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const telegramResult = detectTelegram();
        let appName = '';
        let detectionMethod = '';

        // 3.1 CEK TELEGRAM TERLEBIH DAHULU
        if (telegramResult.isTelegram) {
            appName = `Telegram (${telegramResult.confidence}% confident)`;
            detectionMethod = `Telegram Detection: ${telegramResult.methods.join(', ')}`;
            
            alert(`📱 TELEGRAM DETECTED\n\n` +
                `Aplikasi: Telegram\n` +
                `Confidence: ${telegramResult.confidence}%\n` +
                `Metode: ${telegramResult.methods.join('\n• ')}`);
            
            return {
                isInApp: true,
                appName: 'Telegram',
                detectionMethod: detectionMethod,
                message: `Dibuka dari aplikasi: Telegram`,
                telegramDetails: telegramResult.details
            };
        }

        // 3.2 CEK DARI USER AGENT (Aplikasi lain)
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
        else if (userAgent.indexOf('Snapchat') > -1) {
            appName = 'Snapchat';
            detectionMethod = 'User Agent';
        }
        else if (userAgent.indexOf('MicroMessenger') > -1) {
            appName = 'WeChat';
            detectionMethod = 'User Agent';
        }

        // 3.3 CEK DARI REFERER
        if (!appName && document.referrer) {
            const ref = document.referrer.toLowerCase();
            if (ref.indexOf('instagram.com') > -1) {
                appName = 'Instagram';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('facebook.com') > -1) {
                appName = 'Facebook';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('whatsapp.com') > -1) {
                appName = 'WhatsApp';
                detectionMethod = 'Referer';
            } else if (ref.indexOf('twitter.com') > -1 || ref.indexOf('x.com') > -1) {
                appName = 'Twitter/X';
                detectionMethod = 'Referer';
            }
        }

        // 3.4 DETEKSI CHROME CUSTOM TAB (Fallback)
        if (!appName) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari && !document.referrer && !window.opener) {
                appName = 'Chrome Custom Tab (Unknown App)';
                detectionMethod = 'CCT Pattern';
            }
        }

        if (appName) {
            if (appName !== 'Telegram') {
                alert(`📱 INAPP BROWSER DETECTED\n\nDibuka dari aplikasi: ${appName}`);
            }
            
            return {
                isInApp: true,
                appName: appName,
                detectionMethod: detectionMethod,
                message: `Dibuka dari aplikasi: ${appName}`
            };
        } else {
            return {
                isInApp: false,
                appName: '',
                detectionMethod: '',
                message: 'Dibuka dari browser normal'
            };
        }
    }

    // 4. DETEKSI WEBVIEW
    function detectWebView() {
        const userAgent = navigator.userAgent || '';
        let webViewType = '';

        if (/wv\)/i.test(userAgent) || /WebView/i.test(userAgent)) {
            webViewType = 'Android WebView';
        }
        else if (/UIWebView/i.test(userAgent) || /WKWebView/i.test(userAgent)) {
            webViewType = 'iOS WebView';
        }
        else if (window.TelegramWebview !== undefined || window.Telegram !== undefined) {
            webViewType = 'Telegram WebView';
        }
        else if (/wv/.test(userAgent)) {
            webViewType = 'Generic WebView';
        }

        if (webViewType) {
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

    // 5. DETEKSI AKSES TERBATAS
    function detectLimitedAccess() {
        const results = {
            isLimited: false,
            reasons: [],
            details: {}
        };

        try {
            // Cek window.opener
            if (window.opener) {
                try {
                    const openerOrigin = window.opener.location.origin;
                    results.details.openerOrigin = openerOrigin;
                } catch(e) {
                    results.isLimited = true;
                    results.reasons.push('Tidak bisa akses window.opener');
                    results.details.openerError = e.message;
                }
            }

            // Cek localStorage
            try {
                const testKey = '_test_' + Date.now();
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                results.details.localStorageAccess = true;
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('localStorage tidak dapat diakses');
                results.details.localStorageError = e.message;
            }

            // Cek cookies
            try {
                document.cookie = '_test=test; path=/';
                const cookieAccess = document.cookie.indexOf('_test') > -1;
                document.cookie = '_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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

        } catch(e) {
            results.isLimited = true;
            results.reasons.push('Error umum: ' + e.message);
        }

        return results;
    }

    // 6. EKSEKUSI DETEKSI
    const refererResult = detectReferer();
    const inAppResult = detectInApp();
    const webViewResult = detectWebView();
    const telegramResult = detectTelegram();
    const limitedAccessResult = detectLimitedAccess();

    // 7. TAMPILKAN DI KONSOLE
    function showConsoleLog() {
        console.log('========== DETEKSI BROWSER ==========');
        console.log('Referer:', refererResult);
        console.log('InApp:', inAppResult);
        console.log('WebView:', webViewResult);
        console.log('Telegram Detection:', telegramResult);
        console.log('Limited Access:', limitedAccessResult);
        console.log('User Agent:', navigator.userAgent);
        console.log('Referer URL:', document.referrer || '(none)');
        console.log('URL Params:', window.location.search);
        console.log('=======================================');
    }

    // 8. EXPOSE FUNGSI KE GLOBAL
    window.detectReferer = detectReferer;
    window.detectInApp = detectInApp;
    window.detectWebView = detectWebView;
    window.detectTelegram = detectTelegram;
    window.detectLimitedAccess = detectLimitedAccess;
    window.showConsoleLog = showConsoleLog;
    window.getDetectionResults = function() {
        return {
            referer: detectReferer(),
            inApp: detectInApp(),
            webView: detectWebView(),
            telegram: detectTelegram(),
            limitedAccess: detectLimitedAccess()
        };
    };

    // 9. JALANKAN
    showConsoleLog();

})();
