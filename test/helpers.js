(function() {
  var mediaDevices = navigator.mediaDevices || {};
  var enumerateDevices =
      (mediaDevices.enumerateDevices || function(){}).bind(mediaDevices);
  var getUserMedia =
      (mediaDevices.getUserMedia || function(){}).bind(mediaDevices);
  var mediaRecorderStart = MediaRecorder.prototype.start;
  var mediaRecorderStop = MediaRecorder.prototype.stop;

  var allowed = true;
  var devices = null;
  var recorderState = null;
  var recorderData = null;
  var fakeId = 0;

  function setRecorderData(data) {
    recorderData = data;
    recorderState = 'inactive';
  }

  function restoreRecorderData() {
    recorderData = null;
    recorderState = null;
  }

  function allowApiAccess() {
    allowed = true;
  }

  function denyApiAccess() {
    allowed = false;
  }

  function setDevices(fakeDevices) {
    devices = fakeDevices
  }

  function restoreDevices() {
    devices = null;
  }

  function createDevice(kind) {
    return {
      deviceId: fakeId++,
      groupId: fakeId++,
      kind: kind,
      label: 'Fake Device (' + kind + ')'
    };
  }

  function awaitEvent(element, event, timeout) {
    timeout = timeout || 1000;

    return new Promise(function(resolve, reject) {
      element.addEventListener(event, function listener() {
        element.removeEventListener(event, listener);
        resolve();
      });

      setTimeout(function() {
        reject(new Error((element.is || element.tagName) + ' never fired ' + event + '!'));
      }, timeout);
    });
  };

  mediaDevices.enumerateDevices = function() {
    if (devices == null) {
      return enumerateDevices();
    }

    return Promise.resolve(devices);
  };

  mediaDevices.getUserMedia = function(constraints) {
    if (!allowed) {
      return Promise.reject('API access not allowed!');
    }

    var stream = new MediaStream();
    var track = { stop: function() {} };
    var tracks = [];

    if (stream.audio) {
      stream.getAudioTracks = function() {
        return [track];
      };
      tracks.push(track);
    }

    if (stream.video) {
      stream.getVideoTracks = function() {
        return [track];
      };
      tracks.push(track);
    }

    stream.getTracks = function() {
      return tracks;
    };

    return Promise.resolve(stream);
  };

  MediaRecorder.prototype.start = function() {
    if (recorderData == null) {
      return mediaRecorderStart.apply(this, arguments);
    }

    recorderState = 'recording';
    Object.defineProperty(this, 'state', {
      get: function() {
        return recorderState;
      },
      configurable: true
    });
  };

  MediaRecorder.prototype.stop = function() {
    if (recorderData == null) {
      return mediaRecorderStop.apply(this, arguments);
    }

    delete this.state;

    var event = new CustomEvent('dataavailable');
    event.data = recorderData;
    this.dispatchEvent(event);
    setTimeout(function() {
      this.dispatchEvent(new CustomEvent('stop'));
    }.bind(this), 0);
  };

  window.AppMediaTestHelpers = {
    allowApiAccess: allowApiAccess,
    denyApiAccess: denyApiAccess,
    setDevices: setDevices,
    restoreDevices: restoreDevices,
    createDevice: createDevice,
    awaitEvent: awaitEvent,
    setRecorderData: setRecorderData,
    restoreRecorderData: restoreRecorderData
  };
})();
