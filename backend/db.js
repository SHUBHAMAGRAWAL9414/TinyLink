const Link = require('./models/Link');

/**
 * Data access layer for Link documents.
 * This module abstracts Mongoose operations and returns plain JS objects
 * (where applicable) so the rest of the app doesn't need to depend on
 * Mongoose document instances.
 */
module.exports = {
  /**
   * Return all links sorted by creation date (newest first).
   * Uses `.lean()` to return plain JavaScript objects instead of Mongoose documents.
   * @returns {Promise<Array<Object>>}
   */
  getAllLinks: async () => {
    return await Link.find().sort({ created_at: -1 }).lean();
  },

  /**
   * Find a single link by code. Returns `null` when not found.
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  getLink: async (code) => {
    return await Link.findOne({ code }).lean();
  },

  /**
   * Create a new link document.
   * Note: this will throw a MongoDB duplicate-key error (E11000) if `code` is not unique.
   * The caller (route) should handle duplicate errors and map them to 409 responses.
   * @param {{code: string, url: string}} param0
   * @returns {Promise<Object>} created link object
   */
  createLink: async ({ code, url }) => {
    const link = new Link({ code, url, created_at: new Date() });
    await link.save();
    return link.toObject();
  },

  /**
   * Increment click counter and set the last_clicked timestamp atomically.
   * Uses MongoDB update operators: `$inc` to increment and `$set` to update timestamp.
   * @param {string} code
   * @returns {Promise<Object>} update result
   */
  incrementClick: async (code) => {
    return await Link.updateOne({ code }, { $inc: { clicks: 1 }, $set: { last_clicked: new Date() } });
  },

  /**
   * Delete a link by its code.
   * @param {string} code
   * @returns {Promise<Object>} delete result
   */
  deleteLink: async (code) => {
    return await Link.deleteOne({ code });
  },

  /**
   * Efficiently check existence of a code by selecting only `_id`.
   * This avoids transferring entire documents when only existence is required.
   * @param {string} code
   * @returns {Promise<boolean>}
   */
  codeExists: async (code) => {
    const link = await Link.findOne({ code }).select('_id').lean();
    return !!link;
  }
};
