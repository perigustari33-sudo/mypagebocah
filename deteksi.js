// ============================================
// DETEKSI REFERER, INAPP BROWSER, DAN WEBVIEW
// AUTO-DETECTION TANPA RELOAD MANUAL
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

    // 2. DETEKSI KHUSUS TELEGRAM (DENGAN MULTI-TIME CHECK)
    function detectTelegram() {
        const userAgent = navigator.userAgent || '';
        const referer = document.referrer || '';
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        let isTelegram = false;
        let detectionMethods = [];
        let confidence = 0;

        // 2.1 CEK DARI URL PARAMETER
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

        // 2.4 CEK DARI PERFORMANCE
        try {
            const perf = performance.getEntriesByType('navigation');
            if (perf.length > 0 && perf[0].redirectCount > 0) {
                const nav = performance.getEntriesByType('navigation')[0];
                if (nav && nav.name && nav.name.indexOf('t.me') > -1) {
                    isTelegram = true;
                    confidence += 20;
                    detectionMethods.push('Redirect dari t.me');
                }
            }
        } catch(e) {}

        // 2.5 CEK DARI DOM ELEMENTS
        if (!isTelegram) {
            const hasTelegramElements = document.querySelectorAll(
                '[data-telegram], [data-tg], [class*="telegram"], [id*="telegram"]'
            ).length > 0;
            
            if (hasTelegramElements) {
                isTelegram = true;
                confidence += 15;
                detectionMethods.push('Elemen Telegram di DOM');
            }
        }

        // 2.6 CEK DARI NAVIGATOR (Deteksi tidak langsung)
        if (!isTelegram) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari && !referer && !window.opener) {
                confidence += 10;
                detectionMethods.push('Chrome Custom Tab pattern');
            }
        }

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

    // 3. DETEKSI INAPP BROWSER
    function detectInApp() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const telegramResult = detectTelegram();
        let appName = '';
        let detectionMethod = '';

        // CEK TELEGRAM
        if (telegramResult.isTelegram) {
            appName = `Telegram`;
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

        // CEK APLIKASI LAIN
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

        // CEK DARI REFERER
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

        // CHROME CUSTOM TAB (Fallback)
        if (!appName) {
            const isMobile = /Mobile/i.test(userAgent);
            const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
            const isSafari = /Safari/i.test(userAgent);
            
            if (isMobile && isChrome && isSafari && !document.referrer && !window.opener) {
                appName = 'Chrome Custom Tab (Unknown App)';
                detectionMethod = 'CCT Pattern';
            }
        }

        if (appName && appName !== 'Telegram') {
            alert(`📱 INAPP BROWSER DETECTED\n\nDibuka dari aplikasi: ${appName}`);
            
            return {
                isInApp: true,
                appName: appName,
                detectionMethod: detectionMethod,
                message: `Dibuka dari aplikasi: ${appName}`
            };
        } else if (!appName) {
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
            if (window.opener) {
                try {
                    const openerOrigin = window.opener.location.origin;
                    results.details.openerOrigin = openerOrigin;
                } catch(e) {
                    results.isLimited = true;
                    results.reasons.push('Tidak bisa akses window.opener');
                }
            }

            try {
                const testKey = '_test_' + Date.now();
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                results.details.localStorageAccess = true;
            } catch(e) {
                results.isLimited = true;
                results.reasons.push('localStorage tidak dapat diakses');
            }

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
            }

        } catch(e) {
            results.isLimited = true;
            results.reasons.push('Error umum: ' + e.message);
        }

        return results;
    }

    // ============================================
    // 6. AUTO-DETECTION (TANPA RELOAD MANUAL)
    // ============================================
    function runDetection() {
        console.log('🔄 Menjalankan deteksi...');
        
        const refererResult = detectReferer();
        const inAppResult = detectInApp();
        const webViewResult = detectWebView();
        const telegramResult = detectTelegram();
        const limitedAccessResult = detectLimitedAccess();

        // Simpan hasil
        window._detectionResults = {
            referer: refererResult,
            inApp: inAppResult,
            webView: webViewResult,
            telegram: telegramResult,
            limitedAccess: limitedAccessResult
        };

        console.log('✅ Deteksi selesai!');
        showConsoleLog();
    }

    // 7. TAMPILKAN DI KONSOLE
    function showConsoleLog() {
        const results = window._detectionResults || {};
        console.log('========== DETEKSI BROWSER ==========');
        console.log('Referer:', results.referer || 'Not detected');
        console.log('InApp:', results.inApp || 'Not detected');
        console.log('WebView:', results.webView || 'Not detected');
        console.log('Telegram:', results.telegram || 'Not detected');
        console.log('Limited Access:', results.limitedAccess || 'Not detected');
        console.log('User Agent:', navigator.userAgent);
        console.log('Referer URL:', document.referrer || '(none)');
        console.log('URL Params:', window.location.search || '(none)');
        console.log('=======================================');
    }

    // 8. EXPOSE FUNGSI KE GLOBAL
    window.detectReferer = detectReferer;
    window.detectInApp = detectInApp;
    window.detectWebView = detectWebView;
    window.detectTelegram = detectTelegram;
    window.detectLimitedAccess = detectLimitedAccess;
    window.runDetection = runDetection;
    window.showConsoleLog = showConsoleLog;
    window.getDetectionResults = function() {
        return window._detectionResults || {};
    };

    // ============================================
    // 9. JALANKAN DETEKSI OTOMATIS (3 METODE)
    // ============================================
    
    // METODE 1: Saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM ready, menjalankan deteksi...');
            setTimeout(runDetection, 100);
        });
    } else {
        // Jika DOM sudah siap
        console.log('📄 DOM sudah siap, menjalankan deteksi...');
        setTimeout(runDetection, 100);
    }

    // METODE 2: Saat halaman fully loaded
    window.addEventListener('load', function() {
        console.log('🔄 Window load event, re-run detection...');
        setTimeout(runDetection, 200);
    });

    // METODE 3: Delay tambahan untuk Telegram API
    setTimeout(function() {
        console.log('⏰ 1 second delay, final detection...');
        runDetection();
    }, 1000);

    // METODE 4: Observasi perubahan URL (untuk SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔗 URL changed, re-running detection...');
            setTimeout(runDetection, 200);
        }
    }).observe(document, { subtree: true, childList: true });

    console.log('🚀 Deteksi otomatis aktif!');
    console.log('📌 Tunggu beberapa detik untuk hasil...');

})();