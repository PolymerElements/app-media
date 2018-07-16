import {Base} from '@polymer/polymer/polymer-legacy.js';
var mediaDevices = navigator.mediaDevices || {};
var enumerateDevices =
    (mediaDevices.enumerateDevices || function() {}).bind(mediaDevices);
var getUserMedia =
    (mediaDevices.getUserMedia || function() {}).bind(mediaDevices);
var ImageCapture = window.ImageCapture;
var MediaRecorder = window.MediaRecorder;
// skip for browsers that do not support MediaRecorder
var mediaRecorderStart =
    window.MediaRecorder ? window.MediaRecorder.prototype.start : function() {};
var mediaRecorderStop =
    window.MediaRecorder ? window.MediaRecorder.prototype.stop : function() {};

var allowed = true;
var devices = null;
var recorderState = null;
var recorderData = null;
var fakeId = 0;

function createFakeImageCapture(config) {
  var capabilities = (config && config.capabilities) ? config.capabilities : {};
  return function FakeImageCapture(videoTrack) {
    return {
      $videoTrack: videoTrack,

          takePhoto:
              function() {
                return Promise.resolve(new Blob());
              },

          grabFrame:
              function() {
                return Promise.resolve(new ImageBitmap());
              },

          setOptions:
              function() {
                return Promise.resolve();
              },

          getPhotoCapabilities: function() {
            return Promise.resolve(capabilities);
          }
    }
  }
}

function spyMediaRecorder() {
  window.MediaRecorder = function(stream, options) {
    window.MediaRecorder.args.push([stream, options]);
    return new MediaRecorder(stream, options);
  };
  window.MediaRecorder.args = [];
  window.MediaRecorder.isTypeSupported = function(mimeType) {
    return MediaRecorder.isTypeSupported(mimeType);
  };
}

function restoreMediaRecorder() {
  window.MediaRecorder = MediaRecorder;
}

function fakeImageCapture(capabilities) {
  window.ImageCapture = createFakeImageCapture(capabilities || {});
}

function restoreImageCapture() {
  window.ImageCapture = ImageCapture;
}

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

function awaitEvent(element, eventName, timeout) {
  timeout = timeout || 1000;

  return new Promise(function(resolve, reject) {
    element.addEventListener(eventName, function listener(event) {
      element.removeEventListener(eventName, listener);
      resolve(event);
    });

    setTimeout(function() {
      reject(new Error(
          (element.is || element.tagName) + ' never fired ' + eventName + '!'));
    }, timeout);
  });
}

function timePasses(ms) {
  return new Promise(function(resolve) {
    Base.async(resolve, ms);
  });
}

function createAudioMediaStream(skipTests) {
  // prefix for safari
  var ContextClass =
      window.OfflineAudioContext || window.webkitOfflineAudioContext;

  var context = new ContextClass(2, 44100 * 40, 44100);

  // FF doesn't support this function on Offline audio contexts
  if (!context.createMediaStreamDestination && skipTests) {
    skipTests();
  }

  return context.createMediaStreamDestination().stream;
}

function createFakeMediaStream(config) {
  var stream = new MediaStream();
  var tracks = [];
  var track;

  if (config.audioTracks) {
    var audioTracks = [];

    for (var i = 0; i < config.audioTracks; ++i) {
      track = {stop: function() {}};
      audioTracks.push(track);
      tracks.push(track);
    }

    stream.getAudioTracks = function() {
      return audioTracks;
    };
  }

  if (config.videoTracks) {
    var videoTracks = [];

    for (var i = 0; i < config.videoTracks; ++i) {
      track = {
        stop: function() {},
        getCapabilities: function() {
          return config.videoTrackCapabilities || {};
        }
      };
      videoTracks.push(track);
      tracks.push(track);
    }

    stream.getVideoTracks = function() {
      return videoTracks;
    };
  }

  if (tracks.length) {
    stream.getTracks = function() {
      return tracks;
    };
  }

  return stream;
}

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

  return Promise.resolve(createFakeMediaStream({
    audioTracks: constraints.audio ? 1 : 0,
    videoTracks: constraints.video ? 1 : 0
  }));
};

// skip for browsers that do not support MediaRecorder
if (MediaRecorder) {
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
}

window.AppMediaTestHelpers = {
  allowApiAccess: allowApiAccess,
  denyApiAccess: denyApiAccess,
  setDevices: setDevices,
  restoreDevices: restoreDevices,
  createDevice: createDevice,
  awaitEvent: awaitEvent,
  timePasses: timePasses,
  createAudioMediaStream: createAudioMediaStream,
  createFakeMediaStream: createFakeMediaStream,
  setRecorderData: setRecorderData,
  restoreRecorderData: restoreRecorderData,
  fakeImageCapture: fakeImageCapture,
  restoreImageCapture: restoreImageCapture,
  spyMediaRecorder: spyMediaRecorder,
  restoreMediaRecorder: restoreMediaRecorder
};
