const AuditLog = require('../models/AuditLog');

const auditLog = (action, targetCollection, targetId = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLog.create({
          userId: req.user?._id,
          action,
          targetCollection,
          targetId: targetId || req.params.id || body?._id,
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = auditLog;
