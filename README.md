[![Published on NPM](https://img.shields.io/npm/v/@polymer/app-media.svg)](https://www.npmjs.com/package/@polymer/app-media)
[![Build status](https://travis-ci.org/PolymerElements/app-media.svg?branch=master)](https://travis-ci.org/PolymerElements/app-media)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://webcomponents.org/element/@polymer/app-media)

## App Media Elements

Elements for accessing data from media input devices, such as cameras and
microphones, and visualizing that data for users.

_See [the full explainer](./explainer.md) for detailed usage._

See: [Documentation](https://www.webcomponents.org/element/@polymer/app-media),
  [Demo](https://www.webcomponents.org/element/@polymer/app-media/demo/demo/index.html).

### Browser support

The following emerging platform APIs are used by this collection of elements:

 - [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
 - [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
 - [Web Audio API](https://www.w3.org/TR/webaudio/)
 - [MediaStream Image Capture](https://w3c.github.io/mediacapture-image/)

Some additional browser support is enabled by
[WebRTC polyfill](https://github.com/webrtc/adapter) and
[MediaStream ImageCapture API polyfill](https://github.com/GoogleChromeLabs/imagecapture-polyfill).
The following table documents browser support for the elements in this collection with
these polyfills in use

 - ✅ Stable native implementation
 - 🚧 Partial fidelity with polyfill
 - 🚫 Not supported at all

Element                   | Chrome | Safari 11 | Firefox | Edge  | IE 11
--------------------------|--------|-----------|---------|-------|------
`app-media-video`         |     ✅ |        ✅ |      ✅ |    ✅ |    ✅
`app-media-audio`         |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-waveform`      |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-devices`       |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-stream`        |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-recorder`      |     ✅ |        🚫 |      ✅ |    🚫 |    🚫
`app-media-image-capture` |     ✅ |        🚧 |      🚧 |    🚧 |    🚫

## Usage

### Installation

Element:
```
npm install --save @polymer/app-media
```

Polyfills:
```
npm install --save webrtc-adapter
npm install --save image-capture
```

### In an HTML file

##### `<app-media-devices>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/app-media/app-media-devices.js';
    </script>
  </head>
  <body>
    <app-media-devices
        kind="audioinput"
        devices="{{microphones}}">
    </app-media-devices>
  </body>
</html>
```

##### `<app-media-stream>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="audioinput"
            devices="{{microphone}}">
        </app-media-devices>
        <app-media-stream
            audio-device="[[microphone]]"
            stream="{{microphoneStream}}">
        </app-media-stream>
      </template>
    </dom-bind>
  </body>
</html>
```

#### `<app-media-video>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
      import '@polymer/app-media/app-media-video.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="videoinput"
            devices="{{camera}}">
        </app-media-devices>
        <app-media-stream
            video-device="[[camera]]"
            stream="{{cameraStream}}">
        </app-media-stream>
        <app-media-video
            source="[[cameraStream]]"
            autoplay>
        </app-media-video>
      </template>
    </dom-bind>
  </body>
</html>
```

#### `<app-media-recorder>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
      import '@polymer/app-media/app-media-recorder.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="videoinput"
            devices="{{camera}}">
        </app-media-devices>
        <app-media-devices
            kind="audioinput"
            devices="{{microphone}}">
        </app-media-devices>
        <app-media-stream
            video-device="[[camera]]"
            audio-device="[[microphone]]"
            stream="{{cameraAndMicrophoneStream}}">
        </app-media-stream>
        <app-media-recorder
            id="recorder"
            stream="[[cameraAndMicrophoneStream]]"
            data="{{recordedVideo}}"
            duration="3000">
        </app-media-recorder>
      </template>
    </dom-bind>
    <script>
      function createRecording() {
        recorder.start();
      }
    </script>
  </body>
</html>
```

##### `<app-media-image-capture>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
      import '@polymer/app-media/app-media-image-capture.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="videoinput"
            devices="{{camera}}">
        </app-media-devices>
        <app-media-stream
            video-device="[[camera]]"
            stream="{{videoStream}}">
        </app-media-stream>
        <app-media-image-capture
            id="imageCapture"
            stream="[[videoStream]]"
            focus-mode="single-shot"
            red-eye-reduction
            last-photo="{{photo}}">
        </app-media-image-capture>
      </template>
    </dom-bind>
    <script>
      function takePhoto() {
        imageCapture.takePhoto();
      }
    </script>
  </body>
</html>
```

#### `<app-media-audio>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
      import '@polymer/app-media/app-media-audio.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="videoinput"
            devices="{{camera}}">
        </app-media-devices>
        <app-media-stream
            video-device="[[camera]]"
            stream="{{videoStream}}">
        </app-media-stream>
        <app-media-audio
            stream="[[microphoneStream]]"
            analyser="{{microphoneAnalyzer}}">
        </app-media-audio>
      </template>
    </dom-bind>
  </body>
</html>
```

#### `<app-media-waveform>`

```html
<html>
  <head>
    <script type="module">
      import '@polymer/polymer/lib/elements/dom-bind.js';
      import '@polymer/app-media/app-media-devices.js';
      import '@polymer/app-media/app-media-stream.js';
      import '@polymer/app-media/app-media-audio.js';
      import '@polymer/app-media/app-media-waveform.js';
    </script>
  </head>
  <body>
    <dom-bind>
      <template>
        <app-media-devices
            kind="videoinput"
            devices="{{camera}}">
        </app-media-devices>
        <app-media-stream
            video-device="[[camera]]"
            stream="{{videoStream}}">
        </app-media-stream>
        <app-media-audio
            stream="[[microphoneStream]]"
            analyser="{{microphoneAnalyzer}}">
        </app-media-audio>
        <app-media-waveform analyser="[[microphoneAnalyzer]]">
        </app-media-waveform>
      </template>
    </dom-bind>
  </body>
</html>
```

### In a Polymer 3 element

##### `<app-media-devices>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="audioinput"
          devices="{{microphones}}">
      </app-media-devices>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

##### `<app-media-stream>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="audioinput"
          devices="{{microphone}}">
      </app-media-devices>
      <app-media-stream
          audio-device="[[microphone]]"
          stream="{{microphoneStream}}">
      </app-media-stream>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

#### `<app-media-video>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';
import '@polymer/app-media/app-media-video.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="videoinput"
          devices="{{camera}}">
      </app-media-devices>
      <app-media-stream
          video-device="[[camera]]"
          stream="{{cameraStream}}">
      </app-media-stream>
      <app-media-video
          source="[[cameraStream]]"
          autoplay>
      </app-media-video>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

#### `<app-media-recorder>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';
import '@polymer/app-media/app-media-recorder.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="videoinput"
          devices="{{camera}}">
      </app-media-devices>
      <app-media-devices
          kind="audioinput"
          devices="{{microphone}}">
      </app-media-devices>
      <app-media-stream
          video-device="[[camera]]"
          audio-device="[[microphone]]"
          stream="{{cameraAndMicrophoneStream}}">
      </app-media-stream>
      <app-media-recorder
          id="recorder"
          stream="[[cameraAndMicrophoneStream]]"
          data="{{recordedVideo}}"
          duration="3000">
      </app-media-recorder>
    `;
  }

  createRecording() {
    this.$.recorder.start();
  }
}
customElements.define('sample-element', SampleElement);
```

##### `<app-media-image-capture>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';
import '@polymer/app-media/app-media-image-capture.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="videoinput"
          devices="{{camera}}">
      </app-media-devices>
      <app-media-stream
          video-device="[[camera]]"
          stream="{{videoStream}}">
      </app-media-stream>
      <app-media-image-capture
          id="imageCapture"
          stream="[[videoStream]]"
          focus-mode="single-shot"
          red-eye-reduction
          last-photo="{{photo}}">
      </app-media-image-capture>
    `;
  }

  takePhoto() {
    this.$.imageCapture.takePhoto();
  }
}
customElements.define('sample-element', SampleElement);
```

#### `<app-media-audio>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';
import '@polymer/app-media/app-media-audio.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="videoinput"
          devices="{{camera}}">
      </app-media-devices>
      <app-media-stream
          video-device="[[camera]]"
          stream="{{videoStream}}">
      </app-media-stream>
      <app-media-audio
          stream="[[microphoneStream]]"
          analyser="{{microphoneAnalyzer}}">
      </app-media-audio>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

#### `<app-media-waveform>`

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-media/app-media-devices.js';
import '@polymer/app-media/app-media-stream.js';
import '@polymer/app-media/app-media-audio.js';
import '@polymer/app-media/app-media-waveform.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <app-media-devices
          kind="videoinput"
          devices="{{camera}}">
      </app-media-devices>
      <app-media-stream
          video-device="[[camera]]"
          stream="{{videoStream}}">
      </app-media-stream>
      <app-media-audio
          stream="[[microphoneStream]]"
          analyser="{{microphoneAnalyzer}}">
      </app-media-audio>
      <app-media-waveform analyser="[[microphoneAnalyzer]]">
      </app-media-waveform>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Contributing
If you want to send a PR to this element, here are
the instructions for running the tests and demo locally:

### Installation
```sh
git clone https://github.com/PolymerElements/app-media
cd app-media
npm install
npm install -g polymer-cli
```

### Running the demo locally
```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```