/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */

(function() {
  var mediaDevices = navigator.mediaDevices || {};
  var enumerateDevices =
      (mediaDevices.enumerateDevices || function(){}).bind(mediaDevices);
  var getUserMedia =
      (mediaDevices.getUserMedia || function(){}).bind(mediaDevices);
  var mediaRecorderStart = MediaRecorder.prototype.start;
  var mediaRecorderStop = MediaRecorder.prototype.stop;
  var ImageCapture = window.ImageCapture;

  var allowed = true;
  var devices = null;
  var recorderState = null;
  var recorderData = null;
  var fakeId = 0;

  function createFakeImageCapture(config) {
    var capabilities = (config && config.capabilities)
        ? config.capabilities
        : {};
    return function FakeImageCapture(videoTrack) {
      return {
        $videoTrack: videoTrack,

        takePhoto: function() {
          return Promise.resolve(new Blob());
        },

        grabFrame: function() {
          return Promise.resolve(new ImageBitmap());
        },

        setOptions: function() {
          return Promise.resolve();
        },

        getPhotoCapabilities: function() {
          return Promise.resolve(capabilities);
        }
      }
    }
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
        reject(new Error((element.is || element.tagName) + ' never fired ' + event + '!'));
      }, timeout);
    });
  }

  function createAudioMediaStream() {
    var context = new OfflineAudioContext(2,44100*40,44100);
    return context.createMediaStreamDestination().stream;
  }

  function createFakeMediaStream(config) {
    var stream = new MediaStream();
    var tracks = [];
    var track;

    if (config.audioTracks) {
      var audioTracks = [];

      for (var i = 0; i < config.audioTracks; ++i) {
        track = { stop: function() {} };
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
    createAudioMediaStream: createAudioMediaStream,
    createFakeMediaStream: createFakeMediaStream,
    setRecorderData: setRecorderData,
    restoreRecorderData: restoreRecorderData,
    fakeImageCapture: fakeImageCapture,
    restoreImageCapture: restoreImageCapture
  };
})();
