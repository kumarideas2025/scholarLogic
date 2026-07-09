import { getPaginationMetadata, getPaginationParams } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';

/**
 * Unit Tests — Utilities
 */

describe('pagination utility', () => {
  it('computes correct metadata', () => {
    const meta = getPaginationMetadata(95, 3, 10);
    expect(meta.totalItems).toBe(95);
    expect(meta.totalPages).toBe(10);
    expect(meta.page).toBe(3);
    expect(meta.nextPage).toBe(4);
    expect(meta.previousPage).toBe(2);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPreviousPage).toBe(true);
  });

  it('clamps page to minimum 1', () => {
    const meta = getPaginationMetadata(50, 0, 10);
    expect(meta.page).toBe(1);
    expect(meta.previousPage).toBe(null);
    expect(meta.hasPreviousPage).toBe(false);
  });

  it('caps limit at MAX (100)', () => {
    const { limit } = getPaginationParams(1, 500);
    expect(limit).toBe(100);
  });

  it('computes skip from page/limit', () => {
    const { skip, limit } = getPaginationParams(3, 20);
    expect(skip).toBe(40);
    expect(limit).toBe(20);
  });
});

describe('ApiError', () => {
  it('creates unauthorized error with correct code', () => {
    const err = ApiError.unauthorized('nope');
    expect(err.statusCode).toBe(401);
    expect(err.errorCode).toBe('UNAUTHORIZED');
    expect(err.isOperational).toBe(true);
  });

  it('serializes to JSON without stack in production-like shape', () => {
    const err = ApiError.notFound('missing');
    const json = err.toJSON();
    expect(json.success).toBe(false);
    expect(json.message).toBe('missing');
    expect(json.errorCode).toBe('NOT_FOUND');
  });
});
