function loadScript(path) {
  return new Promise((function(res, rej) {
                       var script = document.createElement('script');
                       script.src = path;
                       script.onerror = rej;
                       script.onload = res;
                       document.head.appendChild(script);
                     }).bind(this));
}

window.ensureWebRtcPolyfill = new Promise(function(resolve, reject) {
  loadScript('../node_modules/webrtc-adapter/out/adapter.js').then(resolve)
});

window.ensureImageCapturePolyfill =
    new Promise(function(resolve, reject) {
      loadScript('../node_modules/image-capture/lib/imagecapture.js')
          .then(resolve)
    }).then(function() {
      window.ImageCapture = window.ImageCapture || imagecapture.ImageCapture;
    });

window.ensurePolyfills = Promise
                             .all([
                               ensureWebRtcPolyfill,
                               ensureImageCapturePolyfill,
                             ])
                             .catch(function(e) {
                               console.error('Polyfill loading error:\n' + e);
                             });
window.loadScript = loadScript;