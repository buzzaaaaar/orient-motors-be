const PartVehicleCompatibility = require('../models/PartVehicleCompatibility');
const Part = require('../models/Part');
const Vehicle = require('../models/Vehicle');

exports.addCompatibility = async (req, res) => {
  try {
    const { partId, vehicleId, notes, fuelTypes, transmissions } = req.body;

    if (!partId || !vehicleId) {
      return res.status(400).json({ message: 'partId and vehicleId are required' });
    }

    const part = await Part.findById(partId);
    if (!part) return res.status(404).json({ message: 'Part not found' });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const existing = await PartVehicleCompatibility.findOne({ partId, vehicleId });
    if (existing) {
      return res.status(409).json({ message: 'Compatibility link already exists' });
    }

    const compat = await PartVehicleCompatibility.create({
      partId,
      vehicleId,
      notes,
      fuelTypes: fuelTypes && fuelTypes.length ? fuelTypes : ['petrol', 'diesel', 'hybrid'],
      transmissions: transmissions && transmissions.length ? transmissions : ['manual', 'auto'],
      createdBy: req.user._id,
    });

    res.status(201).json(compat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeCompatibility = async (req, res) => {
  try {
    const compat = await PartVehicleCompatibility.findByIdAndDelete(req.params.id);
    if (!compat) {
      return res.status(404).json({ message: 'Compatibility link not found' });
    }
    res.json({ message: 'Compatibility link removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
