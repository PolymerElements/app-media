## App Media Elements

Elements for accessing data from media input devices, such as cameras and
microphones, and visualizing that data for users.

### Introduction

Modern web browsers support a set of APIs called
[Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/). These
APIs allow you to access inputs such as microphones and cameras, and to a
limited extent they also let you record and visualize the data.

Browsers of yet greater modernity support an API called
[MediaStream Recording](https://www.w3.org/TR/mediastream-recording/). This
API makes recording and processing the data from these inputs really easy and
fun.

App Media is a series of elements that wrap these APIs. The intention is to make
it easier and more fun to build apps and websites that incorporate video and
audio recording and visualization, while relying on standardized, highly
performant browser APIs.

#### Browser support

The following emerging platform APIs are used by this collection of elements:

 - [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
 - [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
 - [Web Audio API](https://www.w3.org/TR/webaudio/)
 - [MediaStream Image Capture](https://w3c.github.io/mediacapture-image/)

Some additional browser support is enabled by the
[WebRTC polyfill](https://github.com/webrtc/adapter). The following
table documents browser support for the elements in this collection with the
WebRTC polyfill in use

 - ✅ Stable native implementation
 - 🚧 Partial fidelity with polyfill
 - 🚫 Not supported at all

Element                   | Chrome | Safari 10 | Firefox | Edge  | IE 11
--------------------------|--------|-----------|---------|-------|------
`app-media-video`         |     ✅ |        ✅ |      ✅ |    ✅ |    ✅
`app-media-audio`         |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-waveform`      |     ✅ |        ✅ |      ✅ |    ✅ |    🚫
`app-media-devices`       |     ✅ |        🚫 |      ✅ |    ✅ |    🚫
`app-media-stream`        |     ✅ |        🚫 |      ✅ |    ✅ |    🚫
`app-media-recorder`      |     ✅ |        🚫 |      ✅ |    🚫 |    🚫
`app-media-image-capture` |     🚧 |        🚫 |      🚧 |    🚧 |    🚫

### How to use

Many apps that access cameras and microphones may wish to start by discovering
what is possible on the current device. A laptop typically has only one camera,
but a phone often has one or two. A microphone is often present on devices these
days, but it's good to know for sure.

Before you begin, make sure that you are loading the
[WebRTC polyfill](https://github.com/webrtc/adapter) where appropriate so that
the most up to date versions of the necessary APIs are usable in all of your
target browsers.

### `<app-media-devices>`

`app-media` offers the `app-media-devices` element to assist in looking up the
available cameras, microphones and other inputs on the current device. You can
configure it with a string that can be matched against the kind of device you
wish to look up, and the element will do the rest. Here is an example that
binds an array of all available microphone-like devices to a property called
`microphones`:

```html
<app-media-devices kind="audioinput" devices="{{microphones}}">
</app-media-devices>
```

In the example, the available devices are filtered to those that have the string
`'audioinput'` in their `kind` field. It is often convenient to refer to a
single selected device. This can be done using the `selected-device` property,
which points to a single device in the list at a time:

```html
<app-media-devices kind="audioinput" selected-device="{{microphone}}">
</app-media-devices>
```

### `<app-media-stream>`

Once you have found a device that you like, you'll need to access a
`MediaStream` of the input from the device. The `app-media-stream` makes it
easy to convert a device reference to a `MediaStream`:

```html
<app-media-stream audio-device="[[microphone]]" stream="{{microphoneStream}}">
</app-media-stream>
```

However, sometimes you don't know which device you want to use. The Media
Capture and Streams API allows users to
[specify constraints](https://w3c.github.io/mediacapture-main/#constrainable-properties)
related to the input device. For example, if you wish to access a camera stream,
and you would prefer to get the back-facing camera if available, you could do
something like this:

```html
<app-media-stream
    video-constraints='{"facingMode":"environment"}'
    stream="{{backFacingCameraStream}}">
</app-media-stream>
```

You can use `app-media-stream` to record a device screen.

Screen sharing in Chrome and Firefox has some differences. See
[this](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/#why-screen-fails)
page for more info.

To capture the screen in Chrome use `{"mandatory": {"chromeMediaSource": "screen"}}`
video constraint:

```html
<app-media-stream
    video-constraints='{"mandatory": {"chromeMediaSource": "screen"}}'
    stream="{{stream}}"
    active>
</app-media-stream>
```

NOTE: As of today (April 23th, 2017), screen capturing in Chrome is available only on
Android and requires enabling `chrome://flags#enable-usermedia-screen-capturing` flag.

To capture the screen in Firefox use `{"mediaSource": "screen"}` video constraint:

```html
<app-media-stream
    video-constraints='{"mediaSource": "screen"}'
    stream="{{stream}}"
    active>
</app-media-stream>
```

You can also use `{"mediaSource": "window"}` to capture only application window
and `{"mediaSource": "application"}` to capture all application windows,
not the whole screen.

NOTE: Firefox (before version 52) requires to set `media.getusermedia.screensharing.enabled`
to `true` and add the web app domain to `media.getusermedia.screensharing.allowed_domains`
in `about:config`.

It's easy to create a stream that contains both audio and video tracks as well.
Any combination of devices and constraints can be used when configuring:

```html
<app-media-stream
    audio-device="[[microphone]]"
    video-constraints='{"facingMode":"environment"}'
    stream="{{cameraAndMicrophoneStream}}">
</app-media-stream>
```

NOTE: Chrome doesn't support combining screen capture video tracks with audio tracks.

### `<app-media-video>`

Suppose you are planning to build an awesome camera app. At some point, you will
need to convert your `MediaStream` instance into video that the user can see, so
that she knows what is being recorded. Conveniently, you don't need a special
element to make this work. You can actually just use a basic `<video>` element:

```html
<video src-object="[[backFacingCameraStream]]" autoplay></video>
```

Once the `backFacingCameraStream` is available, the `<video>` element will
display video from the camera. But, without further intervention, the video will
change its size to be the pixel dimensions of the incoming video feed. If you
are building a camera app, you may want a video that scales predictably inside
of its container. An easy way to get this is to use `<app-media-video>`:

```html
<app-media-video source="[[backFacingCameraStream]]" autoplay>
</app-media-video>
```

By default, `<app-media-video>` will automatically scale the video so that it
is "full bleed" relative to the dimensions of the `<app-media-video>` element.
It can also be configured to scale the video so that it is contained instead of
cropped by the boundary of `<app-media-video>`:

```html
<app-media-video source="[[backFacingCameraStream]]" autoplay contain>
</app-media-video>
```

Note that when using a combined stream of camera and microphone data, you may
wish to mute the video in order to avoid creating a feedback loop.

### `<app-media-recorder>`

Eventually you will want to record actual video and audio from the
`MediaStream`. This is where the MediaStream Recording API comes in, and there
is an element to make it nice and declarative called `<app-media-recorder>`.
In order to use it, configure the element with an optional duration and bind the
stream to it:

```html
<app-media-recorder
    id="recorder"
    stream="[[cameraAndMicrophoneStream]]"
    data="{{recordedVideo}}"
    duration="3000">
</app-media-recorder>
```

When you are ready to make a recording, call the `start` method on the element:

```html
<script>
Polymer({
  is: 'x-camera',

  // ...

  createRecording: function() {
    this.$.recorder.start();
  }

  // ....
});
</script>
```

The `<app-media-recorder>` will start recording from the configured stream and
automatically stop after the configured duration. While the recording is taking
place, the element will dispatch `app-media-recorder-chunk` events that contain
individual data chunks as provided by `MediaRecorder` it the `dataavailable`
event. Once the recording is available, it will assign it to the `data` property
(this will also update the bound `recordedVideo` property in the example above).

If you don't configure a `duration`, then the recording will continue until you
call the `stop` method on the recorder instance.

### `<app-media-image-capture>`

An emerging standard defines the
[Image Capture API](https://w3c.github.io/mediacapture-image/), which allows for
more fine-grained control of camera settings such as color temperature, white
balance, focus and flash. It also allows for direct JPEG capture of the image
that appears in a given media device.

The `<app-media-image-capture>` element offers a declarative strategy for
configuring an `ImageCapture` instance and accessing the photos it takes:

```html
<app-media-image-capture
    id="imageCapture"
    stream="[[videoStream]]"
    focus-mode="single-shot"
    red-eye-reduction
    last-photo="{{photo}}">
</app-media-image-capture>
```

When you are ready to capture a photo, call the `takePhoto` method:

```html
<script>
Polymer({
  is: 'x-camera',

  // ...

  takePhoto: function() {
    // NOTE: This method also returns a promise that resolves the photo.
    this.$.imageCapture.takePhoto();
  }

  // ....
});
</script>
```

### `<app-media-audio>`

If you are building a voice memo app, you may wish to access an audio analyzer
so that you can visualize microphone input in real time. This can be done with
the `<app-media-audio>` element:

```html
<app-media-audio
    stream="[[microphoneStream]]"
    analyser="{{microphoneAnalyser}}">
</app-media-audio>
```

When the `microphoneStream` becomes available, the `microphoneAnalyser` property
will be assigned an instance of a Web Audio
[`AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
that corresponds to the audio input from that stream. Any stream with at least
once audio track can be used as an input for `<app-media-audio>`.

### `<app-media-waveform>`

There are many kinds of visualization that might be useful for demonstrating to
your users that there is a hot mic on their devices. `<app-media-waveform>` is
a basic SVG visualization that can suit a wide-range of visualization needs. It
is very easy to use if you have an `AnalyzerNode` instance:

```html
<app-media-waveform analyser="[[microphoneAnalyser]]">
</app-media-waveform>
```

The analyzer is minimal, but its foreground and background can be themed to
achieve some level of customized look and feel:

```html
<style>
  :host {
    --app-media-waveform-background-color: red;
    --app-media-waveform-foreground-color: lightblue;
  }
</style>
```
