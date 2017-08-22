import { Base } from '../polymer/polymer.js';
import { Polymer as Polymer$0 } from '../polymer/lib/legacy/polymer-fn.js';
if (window.MediaRecorder == null) {
  Base._warn('Media Recorder API is not supported in this browser!');
  return;
}

export const AppMedia = AppMedia || {};

/** @see https://www.w3.org/TR/mediastream-recording/#enumdef-recordingstate */
AppMedia.RecordingState = {
  INACTIVE: 'inactive',
  RECORDING: 'recording',
  PAUSED: 'paused'
};

Polymer$0({
  is: 'app-media-recorder',

  properties: {
    /**
     * The input media stream to base the recordings off of.
     * @type {MediaStream}
     */
    stream: {
      type: Object
    },

    /**
     * A reference to the media recorder that is used to generate
     * recordings of the stream.
     *
     * @type {MediaRecorder}
     */
    recorder: {
      type: Object,
      notify: true,
      computed: '_computeRecorder(stream, mimeType)'
    },

    /**
     * The timeslice to use when recording the stream with the media
     * recorder.
     */
    timeslice: {
      type: Number,
      value: 10
    },

    /**
     * The duration of the recording, in milliseconds. If set to a value
     * greater than 0, the recording will automatically end after the
     * configured amount of time (unless there is some manual
     * intervention). If set to 0 (the default), recording will continue
     * until manually stopped (or your device melts).
     */
    duration: {
      type: Number,
      value: 0
    },

    /**
     * The computed mime type for the output recording.
     */
    mimeType: {
      type: String,
      computed: '_computeMimeType(stream, mpeg, codecs)',
      observer: '_mimeTypeChanged'
    },

    /**
     * If true, the computed mime type will be video/mpeg.
     */
    mpeg: {
      type: Boolean,
      value: false
    },

    /**
     * If a value is given, the computed mime time will include a suffix
     * specifying the value as a specific codec e.g., for vp8, the mime
     * type will be video/webm\;codecs=vp8.
     */
    codecs: {
      type: String,
      value: null
    },

    /**
     * The time elapsed since the recorder began recording, in
     * milliseconds.
     */
    elapsed: {
      type: Number,
      readOnly: true,
      notify: true,
      value: 0
    },

    /**
     * A blob for the most recently completed recording.
     *
     * @type {Blob}
     */
    data: {
      type: Object,
      readOnly: true,
      notify: true
    },

    /**
     * When set to true, the recorder will start recording. When set to false,
     * the recorder will stop recording and data will be updated as the
     * recording becomes available. Calling `start` will cause this property
     * to be set to true. Calling `stop` will cause this property to be set to
     * false.
     */
    recording: {
      type: Boolean,
      value: false,
      notify: true
    }
  },

  observers: [
    '_recordingChanged(recording, recorder)'
  ],

  /**
   * Start recording from the source media stream.
   */
  start: function() {
    var data = [];
    var start = performance.now();
    var finished = false;

    var onDataAvailable = function(event) {
      var elapsed = performance.now() - start;

      if (event.data && event.data.size > 0) {
        this.fire('app-media-recorder-chunk', event.data);
        data.push(event.data);
      }

      if (this.duration > 0 && this.duration < elapsed && !finished) {
        elapsed = this.duration;
        finished = true;
        this.stop();
      }

      this._setElapsed(elapsed);
    }.bind(this);

    var onStop = function() {
      this.recorder.removeEventListener('dataavailable', onDataAvailable);
      this.recorder.removeEventListener('stop', onStop);

      this._setData(new Blob(data, {
        type: this.mimeType
      }));
    }.bind(this);

    this.stop();

    this.recorder.addEventListener('dataavailable', onDataAvailable);
    this.recorder.addEventListener('stop', onStop);

    this.recorder.start(this.timeslice);
    this.recording = true;
  },

  /**
   * Stop recording from the source media stream. The result of the
   * recording will be made available as a new value for the data
   * property.
   */
  stop: function() {
    this._setElapsed(0);
    if (this.recorder.state !==
        AppMedia.RecordingState.INACTIVE) {
      this.recorder.stop();
      this.recording = false;
    }
  },

  /**
   * Pause recording.
   */
  pause: function() {
    this.recorder.pause();
  },

  /**
   * Resume recording if paused.
   */
  resume: function() {
    if (this.recorder.state ===
        AppMedia.RecordingState.PAUSED) {
      this.recorder.resume();
    }
  },

  _computeRecorder: function(stream, mimeType) {
    if (mimeType == null) {
      return;
    }

    return new MediaRecorder(stream, {
      mimeType: mimeType
    });
  },

  _computeMimeType: function(stream, mpeg, codecs) {
    if (stream == null) {
      return;
    }

    var candidate;

    if (mpeg) {
      candidate = 'video/mpeg';
    } else if (stream.getVideoTracks().length > 0) {
      candidate = 'video/webm';
    } else {
      candidate = 'audio/webm';
    }

    if (codecs) {
      // NOTE(cdata): This specifies a codec if one is preferred by the user
      // configuration of an element.
      // A reference for the mimetype format can be found here:
      // https://tools.ietf.org/html/rfc2046
      // Examples of specifying codecs in mimetypes can be found here:
      // https://www.w3.org/TR/mediastream-recording/#check-for-mediarecorder-and-mimetype.x
      candidate += '\;codecs=' + codecs;
    }

    return candidate || '';
  },

  _recordingChanged: function(recording, recorder) {
    if (recorder == null) {
      return;
    }

    if (recording && this.recorder.state ===
        AppMedia.RecordingState.INACTIVE) {
      this.start();
    } else if (!recording && this.recorder.state !==
        AppMedia.RecordingState.INACTIVE) {
      this.stop();
    }
  },

  _mimeTypeChanged: function(mimeType) {
    if (!mimeType) {
      return;
    }

    if (!MediaRecorder.isTypeSupported(mimeType)) {
      this._warn(this._logf('Browser does not support mime-type', mimeType));
    }
  }
});
