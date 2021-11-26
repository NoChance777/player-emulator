import createPlayer from './player.js';
const { PlaybackEvents, PlaybackStatus, SubtitleShowingMode } = createPlayer;
const player = createPlayer();

player.play([
  { id: 'nature-01-3min', duration: 10000, type: 'video' },
  { id: 'Advertisement', duration: 15000, type: 'ad' },
  { id: 'nature-01-3min', duration: 30000, type: 'video' },
]);
