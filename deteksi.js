// ============================================
// DETEKSI CCT DENGAN window.open chrome://version/
// ============================================

(function() {
    
    // 1. DETEKSI CHROME PROTOCOL (METODE UTAMA)
    function detectChromeProtocol() {
        try {
            // Coba buka chrome://version/ di tab baru
            const newWindow = window.open('chrome://version/', '_blank');
            
            if (newWindow) {
                // Berhasil dibuka - kemungkinan Chrome asli
                setTimeout(() => {
                    try {
                        newWindow.close();
                    } catch(e) {
                        // Tidak bisa close, tapi tetap dianggap berhasil
                    }
                }, 100);
                return true;
            } else {
                // Gagal dibuka - kemungkinan CCT/WebView
                return false;
            }
        } catch(e) {
            // Error saat mencoba membuka - kemungkinan CCT/WebView
            return false;
        }
    }

    // 2. DETEKSI WEBVIEW (METODE KEDUA)
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
        
        // Hanya jalankan di Chrome Mobile
        if (!isMobile || !isChrome || !isSafari) {
            return { isCCT: false };
        }
        
        // METODE 1: Cek window.open chrome://version/
        const canOpenChrome = detectChromeProtocol();
        
        // METODE 2: Cek WebView
        const isWebView = detectWebView();
        
        // Jika salah satu true, berarti CCT
        if (canOpenChrome === false || isWebView === true) {
            return {
                isCCT: true,
                canOpenChrome: canOpenChrome,
                isWebView: isWebView
            };
        }
        
        return { isCCT: false };
    }

    // 4. MAIN DETECTION
    function runDetection() {
        // Cek chrome protocol
        const canOpenChrome = detectChromeProtocol();
        
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
        console.log('window.open chrome://version/:', canOpenChrome);
        console.log('WebView Detected:', isWebView);
        console.log('CCT Detected:', cctResult.isCCT);
        console.log('User Agent:', navigator.userAgent);
        console.log('==================================');
        
        // Simpan hasil
        window._detectionResult = {
            isCCT: cctResult.isCCT,
            canOpenChrome: canOpenChrome,
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

    console.log('🚀 CCT Detection Active (window.open method)');

})();
