module.exports.parseTime = function (timeString) {
  // 00:00.000 or 00:00:00.000 or 0:00:00.000
  // eslint-disable-next-line no-useless-escape
  const results = /(?:(\d{1,}):)?(\d{2}):(\d{2})[\.,](\d{3})/g.exec(timeString);
  if (results == null) {
    return null;
  }
  // This capture is optional, but will still be in the array as undefined,
  // in which case it is 0.
  const hours = Number(results[1]) || 0;
  const minutes = Number(results[2]);
  const seconds = Number(results[3]);
  const milliseconds = Number(results[4]);
  if (minutes > 59 || seconds > 59) {
    return null;
  }

  return milliseconds + 1000 * (seconds + minutes * 60 + hours * 3600);
};
