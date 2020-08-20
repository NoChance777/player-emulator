const { EOL } = require('os');
const log = require('log-update');
const ms = require('parse-ms');
const EventEmitter = require('events');

const FRAME_RATE = 80;
const SCREEN_WIDTH = 60;

const PlaybackStatus = {
  playing: 'playing',
  paused: 'paused',
  stopped: 'stopped',
};

const PlaybackEvents = {
  status: 'status',
  position: 'position',
};

const SubtitleShowingMode = {
  clearAfterRender: 'frame',
  permanent: 'permanent',
};

const createDefaultState = () => ({
  playInterval: null,
  playlist: [],
  playlistIndex: 0,
  duration: 0,
  position: 0,
  status: PlaybackStatus.stopped,
  subtitles: [],
});

const createPlaylist = (content) =>
  content.reduce(
    ({ marker, playlist }, clip) => {
      playlist.push({
        ...clip,
        start: marker,
      });
      marker += clip.duration;
      return { marker, playlist };
    },
    { marker: 0, playlist: [] }
  ).playlist;

module.exports = ({
  shouldRender = true,
  subtitlesShowingMode = SubtitleShowingMode.clearAfterRender,
} = {}) => {
  const emitter = new EventEmitter();
  let state = createDefaultState();
  const setStatus = (value) => {
    if (value === state.status) return;
    state.status = value;
    const clip = state.playlist[state.playlistIndex] || null;
    emitter.emit(PlaybackEvents.status, clip, value);
  };

  const createRenderInterval = () => {
    const formatDuration = (current, duration) => {
      const pad = (num, len = 2) => String(num).padStart(len, '0');
      const str = (num) => {
        const { hours, minutes, seconds, milliseconds } = ms(num);
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
      };
      return `[${str(current)}/${str(duration)}]`;
    };

    const render = (lines) => {
      shouldRender &&
        log(
          lines
            .map((line) => {
              const pad = (SCREEN_WIDTH + line.length) / 2;
              return line.padStart(pad).padEnd(SCREEN_WIDTH);
            })
            .reduce((frame, line) => frame + line + EOL, '')
        );
    };

    return setInterval(() => {
      const { playlist, playlistIndex, subtitles } = state;

      const { status } = state;
      if (status !== PlaybackStatus.playing) return;

      const clip = playlist[playlistIndex];
      const position = state.position;

      if (clip.start + clip.duration - position <= 0) {
        if (playlistIndex < playlist.length - 1) {
          state.playlistIndex++;
        } else api.stop();
      }

      render([
        '-'.repeat(SCREEN_WIDTH),
        `Clip "${clip.id}" is ${status}`,
        formatDuration(position, state.duration),
        ...(subtitles || []),
        '-'.repeat(SCREEN_WIDTH),
      ]);
      // clear current subtitles after rendering if mode is `clearAfterRender`
      if (subtitlesShowingMode === SubtitleShowingMode.clearAfterRender) state.subtitles = [];

      const contentPosition = state.playlist
        .filter(({ id }, idx) => id === clip.id && idx < playlistIndex)
        .reduce((d, c) => d + c.duration, position - clip.start);

      emitter.emit(PlaybackEvents.position, clip, {
        position,
        content: {
          id: clip.id,
          position: contentPosition,
        },
      });

      state.position = position + Math.min(FRAME_RATE, clip.start + clip.duration - position);
    }, FRAME_RATE);
  };

  const api = {
    play: (content) =>
      setImmediate(() => {
        if (content) {
          state.playlist = createPlaylist(content);
          state.duration = state.playlist.reduce((duration, clip) => duration + clip.duration, 0);
          state.playlistIndex = 0;
          state.position = 0;
          state.playInterval = createRenderInterval();
          setStatus(PlaybackStatus.stopped);
        }
        if (state.status !== PlaybackStatus.playing) setStatus(PlaybackStatus.playing);
      }, 0),

    pause: () => setStatus(PlaybackStatus.paused),

    stop: () => {
      clearInterval(state.playInterval);
      setStatus(PlaybackStatus.stopped);
      state = createDefaultState();
    },

    showSubtitles: (subtitles) => {
      state.subtitles = subtitles ? (Array.isArray(subtitles) ? subtitles : [subtitles]) : [];
    },

    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
  };
  return api;
};

module.exports.PlaybackEvents = PlaybackEvents;
module.exports.PlaybackStatus = PlaybackStatus;
module.exports.SubtitleShowingMode = SubtitleShowingMode;
