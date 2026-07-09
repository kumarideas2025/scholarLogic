import { apiGet } from './api';
import type { University, Scholarship, Activity, DeadlineItem } from '../types';

/**
 * Catalog API
 *
 * Fetches the public catalog content (universities, scholarships, activities,
 * deadlines) from the backend. Each endpoint returns an envelope whose `data`
 * is `{ <resource>: [...] }`, which we unwrap to the array.
 */

export const getUniversities = () =>
  apiGet<{ universities: University[] }>('/api/v1/universities').then((d) => d.universities);

export const getScholarships = () =>
  apiGet<{ scholarships: Scholarship[] }>('/api/v1/scholarships').then((d) => d.scholarships);

export const getActivities = () =>
  apiGet<{ activities: Activity[] }>('/api/v1/activities').then((d) => d.activities);

export const getDeadlines = () =>
  apiGet<{ deadlines: DeadlineItem[] }>('/api/v1/deadlines').then((d) => d.deadlines);
