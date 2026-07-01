const AuditLog = require('../models/AuditLog');

exports.getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetCollection } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (targetCollection) filter.targetCollection = targetCollection;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('userId', 'fullName username')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
