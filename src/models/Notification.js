import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../constants/index.js';

/**
 * Notification Model
 *
 * In-app notifications with read state. TTL-style cleanup not used here
 * (notifications are user-value); soft-delete via `read` flag.
 */

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), default: NOTIFICATION_TYPE.INFO },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, maxlength: 1000, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

notificationSchema.methods.markRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;