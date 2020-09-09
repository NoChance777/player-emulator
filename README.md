## Video Player emulator based on NodeJS

This is a dumb player emulator that does nothing but fires events. This project requires **NodeJS**. The main module returns a factory method for instantiating the player. For starting events flow you need to call `play` method with a playlist:

```javascript
const createPlayer = require('./player');

const player = createPlayer({{
  /* config */
});
player.play([
  { id: 'nature-01-3min', duration: 10000, type: 'video' },
  { id: 'Advertisement', duration: 15000, type: 'ad' },
  { id: 'nature-01-3min', duration: 30000, type: 'video' },
]);
```

The player's factory method can accept optional config object:
| Option | Type | Description |
| ------ | ---- | ----------- |
|`shouldRender`|boolean| when `true` the player will render pseudo video in console |
|`subtitlesShowingMode`| `'frame'` or `'permanent'`| set subtitle render mode, in `'frame'` mode subtitles will be displayed after a `showSubtitles` call and cleared for a next frame, in `'permanent'` mode the same subtitles will be rendered until they're cleared by calling `showSubtitles(null)` or other subtitles are provided.

Each playlist item has the following structure:

```typescript
interface PlaylistItem {
  id: string,
  duration: number,
  type?: string
}
]);
```

### Player API

| Method                 | Parameters                               | Description                                                                                                          |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `play(playlist)`       | Array&lt;PlaylistItem&gt; _(optional)_   | start playback with provided playlist, if a playlist is omitted and the player is on pause, playback will be resumed |
| `pause()`              |                                          | pause playback and events flow                                                                                       |
| `stop()`               |                                          | stop playback and restore initial state                                                                              |
| `showSubtitles()`      | Array&lt;string&gt;, string              | show provided subtitles, if an array of strings are passed, subtitles will be rendered in multiline mode             |
| `on(event, handler)`   | event: PlaybackEvents, handler: Function | register an event handler for the given type event                                                                   |
| `once(event, handler)` | event: PlaybackEvents, handler: Function | register an one-time event handler for the given type event                                                          |

### Playback Events

| Event Type | Description                                                                   | Handler                                            |
| ---------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| `status`   | Sent when playback changes a status                                           | (err: Error, status: string) =&gt; void;           |
| `position` | Sent periodically to inform interested parties of progress playing the media. | (err: Error, payload: PositionPayload) =&gt; void; |

```typescript
interface PositionPayload {
  id: PlaylistItem['id'] /* id of the currently playing clip */;
  position: number /* current time position for the clip, clips with the same id are considered as the one clip */;
}
```
