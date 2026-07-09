import mongoose from 'mongoose';
import { TOKEN_TYPE } from '../constants/index.js';

/**
 * Token Model
 *
 * Stores refresh tokens and one-time tokens (email verification, password
 * reset). Raw tokens are never stored — only their SHA-256 hash. A TTL index
 * auto-expires tokens, preventing unbounded collection growth.
 *
 * Security:
 * - Refresh tokens support rotation (old token invalidated on use).
 * - `expiresAt` + TTL index guarantee cleanup.
 * - `userAgent`/`ip` aid anomaly detection (e.g. token theft across devices).
 */

const tokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(TOKEN_TYPE),
      required: true,
    },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index: documents auto-deleted 0ms after expiresAt
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookup of active refresh tokens per user
tokenSchema.index({ userId: 1, type: 1, isRevoked: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;