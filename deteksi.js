// ============================================
// DETEKSI CCT DENGAN chrome://version DAN WEBVIEW
// ============================================

(function() {
    
    // 1. DETEKSI CHROME PROTOCOL (METODE 1)
    let isChromeProtocolAccessible = null;
    
    function detectChromeProtocol() {
        return new Promise((resolve) => {
            // Cek apakah sudah diuji sebelumnya
            if (isChromeProtocolAccessible !== null) {
                resolve(isChromeProtocolAccessible);
                return;
            }

            try {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = 'chrome://version';
                
                let isLoaded = false;
                
                iframe.onload = function() {
                    isLoaded = true;
                    isChromeProtocolAccessible = true;
                    document.body.removeChild(iframe);
                    resolve(true);
                };
                
                iframe.onerror = function() {
                    isChromeProtocolAccessible = false;
                    document.body.removeChild(iframe);
                    resolve(false);
                };
                
                // Timeout 3 detik
                setTimeout(() => {
                    if (!isLoaded) {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                        isChromeProtocolAccessible = false;
                        resolve(false);
                    }
                }, 3000);
                
                document.body.appendChild(iframe);
                
            } catch(e) {
                isChromeProtocolAccessible = false;
                resolve(false);
            }
        });
    }

    // 2. DETEKSI WEBVIEW (METODE 2)
    function detectWebView() {
        const userAgent = navigator.userAgent || '';
        
        if (/wv\)/i.test(userAgent) || /WebView/i.test(userAgent)) {
            return true;
        }
        if (/UIWebView/i.test(userAgent) || /WKWebView/i.test(userAgent)) {
            return true;
        }
        if (/wv/.test(userAgent)) {
            return true;
        }
        
        return false;
    }

    // 3. DETEKSI CCT (GABUNGAN 2 METODE)
    function detectCCT() {
        const userAgent = navigator.userAgent || '';
        const isMobile = /Mobile/i.test(userAgent);
        const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent);
        const isWebView = detectWebView();
        
        // Hanya jalankan di Chrome Mobile
        if (!isMobile || !isChrome || !isSafari) {
            return { isCCT: false };
        }
        
        // METODE 1: Cek chrome://version
        const hasChromeProtocol = isChromeProtocolAccessible;
        
        // METODE 2: Cek WebView
        const hasWebView = isWebView;
        
        // Jika salah satu true, berarti CCT
        if (hasChromeProtocol === false || hasWebView === true) {
            return {
                isCCT: true,
                reasons: []
            };
        }
        
        return { isCCT: false };
    }

    // 4. MAIN DETECTION
    async function runDetection() {
        // Jalankan deteksi chrome protocol
        await detectChromeProtocol();
        
        // Cek webview
        const isWebView = detectWebView();
        
        // Cek CCT
        const cctResult = detectCCT();
        
        // Tampilkan alert jika CCT terdeteksi
        if (cctResult.isCCT) {
            alert('⚠️ CCT atau WebView Terdeteksi!');
        }
        
        // Console log
        console.log('========== DETEKSI CCT ==========');
        console.log('Chrome Protocol Access:', isChromeProtocolAccessible);
        console.log('WebView Detected:', isWebView);
        console.log('CCT Detected:', cctResult.isCCT);
        console.log('User Agent:', navigator.userAgent);
        console.log('==================================');
        
        // Simpan hasil
        window._detectionResult = {
            isCCT: cctResult.isCCT,
            chromeProtocol: isChromeProtocolAccessible,
            webView: isWebView
        };
    }

    // 5. EXPOSE FUNGSI
    window.detectCCT = detectCCT;
    window.detectWebView = detectWebView;
    window.detectChromeProtocol = detectChromeProtocol;
    window.runDetection = runDetection;
    window.getResult = function() {
        return window._detectionResult || {};
    };

    // 6. JALANKAN OTOMATIS
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(runDetection, 500);
    });

    window.addEventListener('load', function() {
        setTimeout(runDetection, 1000);
    });

    console.log('🚀 CCT Detection Active (2 Methods)');

})();