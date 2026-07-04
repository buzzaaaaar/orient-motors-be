const Vehicle = require('../models/Vehicle');
const PartVehicleCompatibility = require('../models/PartVehicleCompatibility');
const escapeRegExp = require('../utils/escapeRegExp');

exports.searchVehicles = async (req, res) => {
  try {
    const { q, make, model, year, trim, engineCode, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };

    if (q) {
      const escaped = escapeRegExp(q);
      const yearVal = parseInt(q, 10);
      const isYear = /^\d{4}$/.test(q.trim()) && yearVal >= 1900 && yearVal <= 2100;

      const orConditions = [
        { make: { $regex: escaped, $options: 'i' } },
        { model: { $regex: escaped, $options: 'i' } },
        { trim: { $regex: escaped, $options: 'i' } },
        { engineCode: { $regex: escaped, $options: 'i' } },
        { chassisCode: { $regex: escaped, $options: 'i' } },
      ];
      if (isYear) {
        orConditions.push({ yearFrom: { $lte: yearVal }, yearTo: { $gte: yearVal } });
      }
      filter.$or = orConditions;
    } else {
      if (make) filter.make = { $regex: escapeRegExp(make), $options: 'i' };
      if (model) filter.model = { $regex: escapeRegExp(model), $options: 'i' };
      if (trim) filter.trim = { $regex: escapeRegExp(trim), $options: 'i' };
      if (engineCode) filter.engineCode = { $regex: escapeRegExp(engineCode), $options: 'i' };
      if (year) {
        const y = parseInt(year);
        filter.yearFrom = { $lte: y };
        filter.yearTo = { $gte: y };
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .sort({ make: 1, model: 1, yearFrom: 1 })
        .skip(skip)
        .limit(limitNum),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      data: vehicles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { make, model, trim, yearFrom, yearTo, engineCode, chassisCode, bodyType, transmission, fuelType } = req.body;

    if (!make || !model || yearFrom === undefined || yearTo === undefined) {
      return res.status(400).json({ message: 'make, model, yearFrom, yearTo are required' });
    }

    if (yearFrom > yearTo) {
      return res.status(400).json({ message: 'yearFrom must be less than or equal to yearTo' });
    }

    const vehicle = await Vehicle.create({
      make, model, trim, yearFrom, yearTo, engineCode, chassisCode, bodyType, transmission, fuelType,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const allowed = ['make', 'model', 'trim', 'yearFrom', 'yearTo', 'engineCode', 'chassisCode', 'bodyType', 'transmission', 'fuelType'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        vehicle[key] = req.body[key];
      }
    }
    vehicle.updatedBy = req.user._id;

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    // Soft-delete: set isActive to false
    vehicle.isActive = false;
    vehicle.updatedBy = req.user._id;
    await vehicle.save();
    res.json({ message: 'Vehicle deactivated', id: vehicle._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVehicleParts = async (req, res) => {
  try {
    const compatibilities = await PartVehicleCompatibility.find({ vehicleId: req.params.vehicleId })
      .populate('partId', 'originalPartNumber partName category brand status oemNumbers')
      .sort({ createdAt: -1 });

    // Filter out orphaned records where the part was hard-deleted
    const valid = compatibilities.filter((c) => c.partId != null);
    res.json(valid);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Autocomplete suggestions for vehicle search
exports.suggestVehicles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const escaped = escapeRegExp(q);
    const yearVal = parseInt(q, 10);
    const isYear = /^\d{4}$/.test(q.trim()) && yearVal >= 1900 && yearVal <= 2100;

    // Build OR conditions: always search make + model text;
    // if the query looks like a 4-digit year, also match vehicles whose range covers it.
    const orConditions = [
      { make: { $regex: escaped, $options: 'i' } },
      { model: { $regex: escaped, $options: 'i' } },
    ];
    if (isYear) {
      orConditions.push({ yearFrom: { $lte: yearVal }, yearTo: { $gte: yearVal } });
    }

    const filter = {
      isActive: true,
      $or: orConditions,
    };

    const vehicles = await Vehicle.find(filter)
      .select('make model yearFrom yearTo trim engineCode chassisCode fuelType transmission')
      .limit(10)
      .sort({ make: 1, model: 1, yearFrom: 1 });

    // Format for autocomplete dropdown
    const suggestions = vehicles.map((v) => ({
      _id: v._id,
      label: `${v.make} ${v.model} ${v.yearFrom}-${v.yearTo}${v.trim ? ` (${v.trim})` : ''}`,
      make: v.make,
      model: v.model,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
      trim: v.trim,
      engineCode: v.engineCode || null,
      chassisCode: v.chassisCode || null,
      fuelType: v.fuelType || null,
      transmission: v.transmission || null,
    }));

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMakes = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = { isActive: true };
    if (q) {
      filter.make = { $regex: escapeRegExp(q), $options: 'i' };
    }
    const makes = await Vehicle.distinct('make', filter);
    res.json(makes.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
