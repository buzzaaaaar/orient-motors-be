const mongoose = require('mongoose');

const oemNumberSchema = new mongoose.Schema({
  oemNumber: { type: String, required: true, trim: true },
  oemManufacturer: { type: String, trim: true },
}, { _id: false });

const partSchema = new mongoose.Schema({
  originalPartNumber: { type: String, required: true, unique: true, trim: true, index: true },
  partName: { type: String, required: true, trim: true, index: true },
  category: { type: String, trim: true, index: true },
  brand: { type: String, trim: true },
  oemNumbers: [oemNumberSchema],
  description: { type: String, trim: true },
  status: { type: String, enum: ['active', 'discontinued', 'superseded'], default: 'active', index: true },
  supersededBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

partSchema.index({ 'oemNumbers.oemNumber': 1 });

module.exports = mongoose.model('Part', partSchema);
