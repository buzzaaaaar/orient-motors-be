const mongoose = require('mongoose');

const partVehicleCompatibilitySchema = new mongoose.Schema({
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  notes: { type: String, trim: true },
  fuelTypes: {
    type: [String],
    enum: ['petrol', 'diesel', 'hybrid', 'electric', 'other'],
    default: ['petrol', 'diesel', 'hybrid', 'electric', 'other']
  },
  transmissions: {
    type: [String],
    enum: ['manual', 'auto'],
    default: ['manual', 'auto']
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

partVehicleCompatibilitySchema.index({ partId: 1, vehicleId: 1 }, { unique: true });

module.exports = mongoose.model('PartVehicleCompatibility', partVehicleCompatibilitySchema);
