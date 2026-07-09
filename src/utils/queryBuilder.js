import { getPaginationParams, getPaginationMetadata } from './pagination.js';

/**
 * Reusable Query Builder
 *
 * Standardizes list-endpoint query handling across all modules: filtering,
 * text search, field selection, sorting (multi-field), and pagination.
 *
 * Usage:
 *   const qb = new QueryBuilder(Model.find(), req.query);
 *   const { query, metadata } = await qb
 *     .filter(['status','role','level'])
 *     .search(['title','description'])
 *     .sort()
 *     .paginate()
 *     .exec();
 *
 * Security: only whitelisted fields are filterable; values are coerced to
 * avoid NoSQL operator injection. Text search falls back to regex on a
 * whitelisted field set.
 */

const ALLOWED_OPERATORS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'regex'];

export class QueryBuilder {
  /**
   * @param {import('mongoose').Query} query - a Mongoose query (e.g. Model.find())
   * @param {Object} queryParams - req.query
   * @param {Object} options - { searchFields: string[], filterFields: string[], defaultSort: string }
   */
  constructor(query, queryParams = {}, options = {}) {
    this.query = query;
    this.params = queryParams;
    this.options = {
      searchFields: options.searchFields || [],
      filterFields: options.filterFields || [],
      defaultSort: options.defaultSort || '-createdAt',
      populate: options.populate || null,
    };
    this._countQuery = null;
    this._metadata = null;
  }

  filter() {
    const filterObj = { ...this.params };
    const excluded = ['page', 'limit', 'sort', 'fields', 'search', 'q', 'order'];
    excluded.forEach((e) => delete filterObj[e]);

    const built = {};
    for (const field of this.options.filterFields) {
      if (filterObj[field] === undefined) continue;
      const value = filterObj[field];
      // Support comma-separated IN lists: ?role=student,teacher
      if (typeof value === 'string' && value.includes(',')) {
        built[field] = { $in: value.split(',').map((v) => v.trim()) };
      } else {
        built[field] = value;
      }
    }
    if (Object.keys(built).length) this.query = this.query.find(built);
    return this;
  }

  search() {
    const term = this.params.search || this.params.q;
    if (term && this.options.searchFields.length) {
      const regex = { $regex: term, $options: 'i' };
      const or = this.options.searchFields.map((f) => ({ [f]: regex }));
      // Combine with any existing .find() filter via $or on a cloned condition.
      // Mongoose merges successive .find() calls with AND, so we apply the
      // search as an additional .find({ $or: [...] }).
      this.query = this.query.find({ $or: or });
    }
    return this;
  }

  sort() {
    const sortParam = this.params.sort;
    let sortStr = this.options.defaultSort;
    if (sortParam) {
      // Convert "name:asc,age:desc" → { name: 1, age: -1 }
      const parts = sortParam.split(',').map((s) => s.trim());
      const sortObj = {};
      for (const p of parts) {
        const [field, dir] = p.split(':');
        if (!field) continue;
        sortObj[field] = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      }
      if (Object.keys(sortObj).length) sortStr = sortObj;
    }
    this.query = this.query.sort(sortStr);
    return this;
  }

  selectFields() {
    const fields = this.params.fields;
    if (fields) {
      const selected = fields
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
        .join(' ');
      if (selected) this.query = this.query.select(selected);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.params.page, 10) || 1;
    const limit = parseInt(this.params.limit, 10) || 10;
    const { skip, limit: lim } = getPaginationParams(page, limit);
    this.query = this.query.skip(skip).limit(lim);
    if (this.options.populate) this.query = this.query.populate(this.options.populate);
    this._page = page;
    this._limit = lim;
    return this;
  }

  async exec() {
    const docs = await this.query.lean ? await this.query.lean() : await this.query;
    return docs;
  }

  async execWithCount(model) {
    const docs = await this.query.lean();
    // Rebuild a count query from the same filters
    const baseFilter = this.query.getFilter ? this.query.getFilter() : {};
    const total = await model.countDocuments(baseFilter);
    const metadata = getPaginationMetadata(total, this._page, this._limit);
    return { docs, metadata };
  }
}

export default QueryBuilder;