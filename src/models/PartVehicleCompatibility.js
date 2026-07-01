const mongoose = require('mongoose');

const partVehicleCompatibilitySchema = new mongoose.Schema({
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

partVehicleCompatibilitySchema.index({ partId: 1, vehicleId: 1 }, { unique: true });

module.exports = mongoose.model('PartVehicleCompatibility', partVehicleCompatibilitySchema);
