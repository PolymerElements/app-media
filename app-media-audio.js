import '../polymer/polymer.js';
import { Polymer } from '../polymer/lib/legacy/polymer-fn.js';
Polymer({
  is: 'app-media-audio',

  properties: {
    /**
     * The input source for the element. This can be a Media Stream or a
     * Media Element (such as an audio or video element).
     *
     * @type {MediaStream|HTMLMediaElement}
     */
    source: {
      type: Object
    },

    /**
     * The audio context that the analyser is associated with.
     *
     * @type {AudioContext}
     */
    context: {
      type: Object,
      readOnly: true,
      value: function() {
        return new AudioContext();
      }
    },

    /**
     * An AnalyserNode that is linked to the audio input source.
     * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
     *
     * @type {AnalyserNode}
     */
    analyser: {
      type: Object,
      notify: true,
      computed: '_computeAnalyser(context)'
    },

    /**
     * An AudioNode that is associated with the audio source.
     *
     * @type {MediaStreamAudioSourceNode|MediaElementAudioSourceNode}
     */
    sourceNode: {
      type: Object,
      notify: true,
      computed: '_computeSourceNode(context, source, analyser)',
      observer: '_sourceNodeChanged'
    }
  },

  _computeSourceNode: function(context, source, analyser) {
    if (context == null ||
        source == null ||
        analyser == null) {
      return;
    }

    // NOTE(cdata): The source can be either an HTMLVideo element (that
    // happens to have audio tracks) or a MediaStream.
    if (source instanceof MediaStream) {
      if (source.getAudioTracks().length === 0) {
        this._warn(this._logf('Media Stream does not have any audio tracks!'));
      }
      return context.createMediaStreamSource(source);
    } else {
      return context.createMediaElementSource(source);
    }
  },

  _computeAnalyser: function(context) {
    var analyser = context.createAnalyser();
    // NOTE(cdata): Size of the fast fourier transform that determines the
    // frequency domain
    analyser.fftSize = 2048;
    return analyser;
  },

  _sourceNodeChanged: function(sourceNode, oldSourceNode) {
    if (oldSourceNode != null) {
      oldSourceNode.disconnect(this.analyser);
    }

    if (sourceNode != null) {
      sourceNode.connect(this.analyser);
    }
  }
});
