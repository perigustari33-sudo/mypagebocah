var uag = navigator.userAgent;
var cekgau = uag.match(/samsungBrowser|wv|vivaldi|edge|opera|firefox/i);
if (cekgau) {
    var currentUrl = window.location.href;
        var chromeIntent = 'intent://' + currentUrl.replace(/^https?:\/\//, '') + 
                          '#Intent;scheme=https;package=com.android.chrome;end';        
        window.location.href = chromeIntent;
}
