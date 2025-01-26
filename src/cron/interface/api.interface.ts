import { Filtering, Pagination, Sorting } from '../decorator';

export interface QueryOptions<T> {
  select?: Array<keyof T>;
  pagination?: Pagination;
  filters?: Filtering<T>[];
  sorting?: Sorting<T>;
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
  page: number | undefined;
  size: number | undefined;
}
