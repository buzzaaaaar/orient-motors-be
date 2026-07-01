const Part = require('../models/Part');
const PartVehicleCompatibility = require('../models/PartVehicleCompatibility');
const escapeRegExp = require('../utils/escapeRegExp');

exports.searchParts = async (req, res) => {
  try {
    const { q, category, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    // Single search query matches against originalPartNumber, oemNumbers, or partName (OR logic)
    if (q) {
      const escaped = escapeRegExp(q);
      filter.$or = [
        { originalPartNumber: { $regex: escaped, $options: 'i' } },
        { partName: { $regex: escaped, $options: 'i' } },
        { oemNumbers: { $elemMatch: { oemNumber: { $regex: escaped, $options: 'i' } } } },
      ];
    }

    if (category) {
      filter.category = { $regex: escapeRegExp(category), $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [parts, total] = await Promise.all([
      Part.find(filter)
        .populate('supersededBy', 'originalPartNumber partName')
        .populate('createdBy', 'fullName')
        .sort({ partName: 1 })
        .skip(skip)
        .limit(limitNum),
      Part.countDocuments(filter),
    ]);

    res.json({
      data: parts,
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

exports.getPart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id)
      .populate('supersededBy', 'originalPartNumber partName')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    const compatibilities = await PartVehicleCompatibility.find({ partId: part._id })
      .populate('vehicleId');

    res.json({ ...part.toObject(), vehicles: compatibilities });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPart = async (req, res) => {
  try {
    const { originalPartNumber, partName, oemNumbers, category, brand, description, status, supersededBy, imageUrl } = req.body;

    if (!originalPartNumber || !partName) {
      return res.status(400).json({ message: 'originalPartNumber and partName are required' });
    }

    const existing = await Part.findOne({ originalPartNumber });
    if (existing) {
      return res.status(409).json({ message: 'Part with this original number already exists' });
    }

    const part = await Part.create({
      originalPartNumber,
      partName,
      oemNumbers: oemNumbers || [],
      category,
      brand,
      description,
      status,
      supersededBy,
      imageUrl,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json(part);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    const allowed = ['originalPartNumber', 'partName', 'oemNumbers', 'category', 'brand', 'description', 'status', 'supersededBy', 'imageUrl'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        part[key] = req.body[key];
      }
    }
    part.updatedBy = req.user._id;

    await part.save();
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    part.status = 'discontinued';
    part.updatedBy = req.user._id;
    await part.save();
    res.json({ message: 'Part soft-deleted', id: part._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPartVehicles = async (req, res) => {
  try {
    const compatibilities = await PartVehicleCompatibility.find({ partId: req.params.partId })
      .populate('vehicleId', 'make model yearFrom yearTo trim engineCode chassisCode bodyType transmission isActive')
      .sort({ createdAt: -1 });

    // Filter out orphaned records where the vehicle was hard-deleted
    const valid = compatibilities.filter((c) => c.vehicleId != null);
    res.json(valid);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Autocomplete suggestions for part search
exports.suggestParts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const escaped = escapeRegExp(q);
    const filter = {
      $or: [
        { originalPartNumber: { $regex: escaped, $options: 'i' } },
        { partName: { $regex: escaped, $options: 'i' } },
        { oemNumbers: { $elemMatch: { oemNumber: { $regex: escaped, $options: 'i' } } } },
      ],
    };

    const parts = await Part.find(filter)
      .select('originalPartNumber partName oemNumbers category status')
      .limit(10)
      .sort({ partName: 1 });

    // Format for autocomplete dropdown
    const suggestions = parts.map((p) => ({
      _id: p._id,
      partName: p.partName,
      originalPartNumber: p.originalPartNumber,
      oemNumber: p.oemNumbers?.[0]?.oemNumber || null,
      category: p.category || null,
      status: p.status,
    }));

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
