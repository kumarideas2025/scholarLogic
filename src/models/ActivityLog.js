import mongoose from 'mongoose';

/**
 * Activity Log Model
 *
 * Audit trail of significant user/system actions (login, course create, etc.).
 * Used by admin analytics. Indexed by actor + action + timestamp for fast
 * range queries.
 */

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true }, // e.g. 'user.login'
    entity: { type: String, default: '' }, // e.g. 'Course', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;