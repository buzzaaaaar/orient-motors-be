/**
 * Escapes special regex characters in a string to prevent ReDoS attacks
 * when used in MongoDB $regex queries.
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = escapeRegExp;
