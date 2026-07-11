// ============================================
// DETEKSI CCT DENGAN chrome://version (tanpa slash)
// ============================================

(function() {
    
    let isCCT = false;
    let checked = false;
    
    // CEK WEBVIEW
    function isWebView() {
        const ua = navigator.userAgent || '';
        return /wv\)/i.test(ua) || /WebView/i.test(ua) || /UIWebView/i.test(ua) || /WKWebView/i.test(ua);
    }
    
    // DETEKSI CCT
    function detectCCT() {
        if (checked) return isCCT;
        checked = true;
        
        const ua = navigator.userAgent || '';
        const isMobile = /Mobile/i.test(ua);
        const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
        
        // Hanya di Chrome Mobile
        if (!isMobile || !isChrome) {
            isCCT = false;
            return false;
        }
        
        // METODE 1: Cek WebView
        if (isWebView()) {
            isCCT = true;
            console.log('❌ WebView terdeteksi!');
            alert('⚠️ WebView Terdeteksi!');
            return true;
        }
        
        // METODE 2: Coba redirect ke chrome://version (tanpa slash)
        const currentUrl = window.location.href;
        
        // Cek apakah sudah di chrome://version
        if (currentUrl.indexOf('chrome://version') > -1) {
            isCCT = false;
            console.log('✅ Di chrome://version - Chrome asli');
            return false;
        }
        
        // Redirect ke chrome://version
        console.log('🔄 Mencoba redirect ke chrome://version...');
        window.location.href = 'chrome://version';
        
        // Set timeout: jika masih di halaman yang sama, berarti CCT
        setTimeout(() => {
            if (window.location.href === currentUrl) {
                isCCT = true;
                console.log('❌ CCT Terdeteksi! (tidak bisa redirect)');
                alert('⚠️ Chrome Custom Tab Terdeteksi!');
            }
        }, 1500);
        
        return isCCT;
    }
    
    // RUN
    function run() {
        detectCCT();
    }
    
    // EXPOSE
    window.detectCCT = detectCCT;
    window.runDetection = run;
    window.getResult = () => ({ 
        isCCT: isCCT, 
        isWebView: isWebView(),
        isChromeProtocol: window.location.href.indexOf('chrome://version') > -1
    });
    
    // AUTO RUN
    document.addEventListener('DOMContentLoaded', () => setTimeout(run, 500));
    window.addEventListener('load', () => setTimeout(run, 1000));
    
    console.log('🚀 CCT Detection Ready (chrome://version tanpa slash)');

})();