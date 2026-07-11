// ============================================
// DETEKSI CCT MENGGUNAKAN chrome:// PROTOCOL
// ============================================

(function() {
    
    // 1. DETEKSI AKSES CHROME PROTOCOL
    function detectChromeProtocol() {
        try {
            // Coba akses chrome://version/
            const testUrl = 'chrome://version/';
            
            // Metode 1: Menggunakan fetch (akan gagal di CCT)
            fetch(testUrl, { mode: 'no-cors' })
                .then(response => {
                    // Ini tidak akan pernah tercapai di CCT
                    console.log('✅ chrome://version/ accessible (Chrome browser)');
                })
                .catch(error => {
                    console.log('❌ chrome://version/ NOT accessible (CCT/WebView)');
                    // Tandai sebagai CCT
                    window._isChromeProtocolAccessible = false;
                });
            
            // Metode 2: Menggunakan iframe (lebih stealth)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = testUrl;
            
            let isLoaded = false;
            
            iframe.onload = function() {
                isLoaded = true;
                console.log('✅ chrome://version/ loaded (Chrome browser)');
                window._isChromeProtocolAccessible = true;
                document.body.removeChild(iframe);
            };
            
            iframe.onerror = function() {
                console.log('❌ chrome://version/ failed to load (CCT/WebView)');
                window._isChromeProtocolAccessible = false;
                document.body.removeChild(iframe);
            };
            
            // Timeout jika terlalu lama
            setTimeout(() => {
                if (!isLoaded) {
                    document.body.removeChild(iframe);
                    console.log('⏰ chrome://version/ timeout (CCT/WebView)');
                    window._isChromeProtocolAccessible = false;
                }
            }, 3000);
            
            document.body.appendChild(iframe);
            
        } catch(e) {
            console.log('❌ Error accessing chrome://version/:', e.message);
            window._isChromeProtocolAccessible = false;
        }
    }

    // 2. DETEKSI CCT (Lebih Akurat)
    function detectCCT() {
        const userAgent = navigator.userAgent || '';
        const isMobile = /Mobile/i.test(userAgent);
        const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent);
        
        // Cek apakah chrome:// protocol bisa diakses
        const hasChromeProtocol = window._isChromeProtocolAccessible;
        
        // Cek indikasi CCT lainnya
        const noReferer = !document.referrer;
        const noOpener = !window.opener;
        const isInIframe = window.top !== window.self;
        
        // Cek apakah ada indikasi WebView
        const hasWebView = /wv\)/i.test(userAgent) || /WebView/i.test(userAgent);
        
        // LOGIC DETEKSI CCT
        if (isMobile && isChrome && isSafari && !hasWebView) {
            // Jika tidak bisa akses chrome:// dan tidak ada referer/opener
            if (hasChromeProtocol === false && noReferer && noOpener) {
                return {
                    isCCT: true,
                    confidence: 95,
                    reasons: [
                        'chrome://version/ tidak dapat diakses',
                        'Tidak ada referer',
                        'Tidak ada window.opener',
                        'User Agent: Chrome Mobile'
                    ]
                };
            }
            
            // Jika chrome:// tidak bisa diakses tapi ada referer (mungkin dari app)
            if (hasChromeProtocol === false && !noReferer) {
                return {
                    isCCT: true,
                    confidence: 70,
                    reasons: [
                        'chrome://version/ tidak dapat diakses',
                        'Ada referer (mungkin dari app)'
                    ]
                };
            }
        }
        
        return {
            isCCT: false,
            confidence: 0,
            reasons: ['Bukan CCT atau tidak terdeteksi']
        };
    }

    // 3. DETEKSI INAPP (DENGAN CCT DETECTION)
    function detectInApp() {
        const userAgent = navigator.userAgent || '';
        const cctResult = detectCCT();
        let appName = '';
        let detectionMethod = '';

        // CEK CCT TERLEBIH DAHULU
        if (cctResult.isCCT) {
            appName = 'Chrome Custom Tab';
            detectionMethod = `CCT Detection (${cctResult.confidence}%)`;
            
            alert(`📱 CHROME CUSTOM TAB DETECTED\n\n` +
                `Aplikasi: Chrome Custom Tab\n` +
                `Confidence: ${cctResult.confidence}%\n` +
                `Alasan:\n• ${cctResult.reasons.join('\n• ')}`);
            
            return {
                isInApp: true,
                appName: 'Chrome Custom Tab',
                detectionMethod: detectionMethod,
                message: 'Dibuka dari Chrome Custom Tab',
                cctDetails: cctResult
            };
        }

        // CEK APLIKASI LAIN DARI USER AGENT
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

        // CEK DARI REFERER
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

        // CEK TELEGRAM DARI URL PARAMETER
        if (!appName) {
            const urlParams = new URLSearchParams(window.location.search);
            const tgParams = ['tg', 'telegram', 'start', 'tgWebApp', 'tgWebAppData'];
            let found = false;
            
            urlParams.forEach((value, key) => {
                if (tgParams.some(p => key.toLowerCase().includes(p))) {
                    found = true;
                }
            });
            
            if (found) {
                appName = 'Telegram';
                detectionMethod = 'URL Parameter';
            }
        }

        if (appName && !cctResult.isCCT) {
            alert(`📱 INAPP BROWSER DETECTED\n\nDibuka dari aplikasi: ${appName}`);
            
            return {
                isInApp: true,
                appName: appName,
                detectionMethod: detectionMethod,
                message: `Dibuka dari aplikasi: ${appName}`
            };
        } else if (!appName && !cctResult.isCCT) {
            return {
                isInApp: false,
                appName: '',
                detectionMethod: '',
                message: 'Dibuka dari browser normal (Chrome)'
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

    // 5. EKSEKUSI DETEKSI
    function runDetection() {
        // Jalankan deteksi chrome protocol
        detectChromeProtocol();
        
        // Tunggu sebentar lalu jalankan deteksi lainnya
        setTimeout(() => {
            const refererResult = detectReferer();
            const inAppResult = detectInApp();
            const webViewResult = detectWebView();
            const cctResult = detectCCT();

            window._detectionResults = {
                referer: refererResult,
                inApp: inAppResult,
                webView: webViewResult,
                cct: cctResult,
                hasChromeProtocol: window._isChromeProtocolAccessible
            };

            showConsoleLog();
        }, 500);
    }

    // 6. REFERER DETECTION
    function detectReferer() {
        const referer = document.referrer || '';
        
        if (referer.length > 0) {
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

    // 7. SHOW CONSOLE
    function showConsoleLog() {
        const results = window._detectionResults || {};
        console.log('========== DETEKSI BROWSER ==========');
        console.log('Hasil Deteksi:');
        console.log('  - Referer:', results.referer || 'Not detected');
        console.log('  - InApp:', results.inApp || 'Not detected');
        console.log('  - WebView:', results.webView || 'Not detected');
        console.log('  - CCT:', results.cct || 'Not detected');
        console.log('  - Chrome Protocol Access:', results.hasChromeProtocol);
        console.log('User Agent:', navigator.userAgent);
        console.log('Referer URL:', document.referrer || '(none)');
        console.log('=======================================');
    }

    // 8. EXPOSE FUNGSI
    window.detectCCT = detectCCT;
    window.detectInApp = detectInApp;
    window.detectWebView = detectWebView;
    window.detectChromeProtocol = detectChromeProtocol;
    window.runDetection = runDetection;
    window.showConsoleLog = showConsoleLog;
    window.getDetectionResults = function() {
        return window._detectionResults || {};
    };

    // 9. JALANKAN OTOMATIS
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(runDetection, 100);
    });

    window.addEventListener('load', function() {
        setTimeout(runDetection, 500);
    });

    console.log('🚀 CCT Detection Active!');
    console.log('📌 Mengecek akses chrome://version/...');

})();