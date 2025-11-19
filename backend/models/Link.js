const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  url: { type: String, required: true, trim: true },
  clicks: { type: Number, default: 0 },
  last_clicked: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
}, { timestamps: false });

linkSchema.index({ code: 1 });

module.exports = mongoose.model('Link', linkSchema);
