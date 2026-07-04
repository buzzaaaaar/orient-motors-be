const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  trim: { type: String, trim: true },
  yearFrom: { type: Number, required: true },
  yearTo: { type: Number, required: true },
  engineCode: { type: String, trim: true },
  chassisCode: { type: String, trim: true },
  bodyType: { type: String, trim: true },
  transmission: { type: String, enum: ['manual', 'auto', 'both'] },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'hybrid', 'electric', 'other'] },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

vehicleSchema.index({ make: 1, model: 1, yearFrom: 1, yearTo: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
