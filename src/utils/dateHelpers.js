/**
 * Date Helpers
 *
 * Reusable date utilities: formatting, relative time, TTL computation.
 */

/**
 * Add a number of days to a Date.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export const addDays = (date = new Date(), days = 0) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Returns ISO string for a future time offset.
 * @param {number} ms - milliseconds to add
 * @returns {string} ISO string
 */
export const futureISO = (ms) => new Date(Date.now() + ms).toISOString();

/**
 * Human-readable relative time (e.g. "3 hours ago").
 * @param {Date|string} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const units = [
    { label: 'year', ms: 31536000000 },
    { label: 'month', ms: 2592000000 },
    { label: 'day', ms: 86400000 },
    { label: 'hour', ms: 3600000 },
    { label: 'minute', ms: 60000 },
    { label: 'second', ms: 1000 },
  ];
  for (const u of units) {
    const value = Math.floor(diff / u.ms);
    if (value >= 1) return `${value} ${u.label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export default { addDays, futureISO, timeAgo };