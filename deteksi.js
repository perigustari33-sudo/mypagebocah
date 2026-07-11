// ============================================
// DETEKSI CCT - TANPA REDIRECT
// ============================================

(function() {
    
    let isCCT = false;
    let checked = false;
    
    // CEK WEBVIEW
    function isWebView() {
        const ua = navigator.userAgent || '';
        return /wv\)/i.test(ua) || /WebView/i.test(ua) || /UIWebView/i.test(ua) || /WKWebView/i.test(ua);
    }
    
    // CEK APAKAH BISA AKSES chrome://version MENGGUNAKAN IFRAME
    function canAccessChromeProtocol() {
        return new Promise((resolve) => {
            try {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = 'chrome://version';
                
                let resolved = false;
                
                iframe.onload = function() {
                    if (!resolved) {
                        resolved = true;
                        document.body.removeChild(iframe);
                        resolve(true);
                    }
                };
                
                iframe.onerror = function() {
                    if (!resolved) {
                        resolved = true;
                        document.body.removeChild(iframe);
                        resolve(false);
                    }
                };
                
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                        resolve(false);
                    }
                }, 2000);
                
                document.body.appendChild(iframe);
                
            } catch(e) {
                resolve(false);
            }
        });
    }
    
    // DETEKSI CCT
    async function detectCCT() {
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
        
        // METODE 2: Cek akses chrome://version via iframe
        const canAccess = await canAccessChromeProtocol();
        
        if (!canAccess) {
            isCCT = true;
            console.log('❌ CCT Terdeteksi! (tidak bisa akses chrome://version)');
            alert('⚠️ Chrome Custom Tab Terdeteksi!');
            return true;
        }
        
        isCCT = false;
        console.log('✅ Chrome asli (bisa akses chrome://version)');
        return false;
    }
    
    // RUN
    async function run() {
        await detectCCT();
    }
    
    // EXPOSE
    window.detectCCT = detectCCT;
    window.runDetection = run;
    window.getResult = () => ({ 
        isCCT: isCCT, 
        isWebView: isWebView()
    });
    
    // AUTO RUN
    document.addEventListener('DOMContentLoaded', () => setTimeout(run, 500));
    window.addEventListener('load', () => setTimeout(run, 1000));
    
    console.log('🚀 CCT Detection Ready (iframe method)');
})();