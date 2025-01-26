import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Filtering<T = any> {
  property: string | keyof T;
  rule: FilterRule;
  value: string;
}

// valid filter rules
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
  HAS = 'has',
}

const FILTER_STRING_DELIMITER: string = '|';
const FILTER_DELIMITER: string = '~';

export const FilteringParams = createParamDecorator(
  (data: string[], ctx: ExecutionContext): Filtering[] => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    const filterParam: string = request.query.filter as string;
    if (!filterParam) {
      return [];
    }

    const filters: Filtering[] = [];
    for (const filter of filterParam.split(FILTER_STRING_DELIMITER)) {
      if (
        !filter.match(
          /^[a-zA-Z0-9_]+~(eq|neq|gt|gte|lt|lte|like|nlike|in|nin|has)~[a-zA-Z0-9_\-":,.{}\[\]]+$/,
        ) &&
        !filter.match(/^[a-zA-Z0-9_]+~(isnull|isnotnull)$/)
      ) {
        throw new BadRequestException('Invalid filter parameter');
      }

      const [property, rule, value] = filter.split(FILTER_DELIMITER);

      if (!Object.values(FilterRule).includes(rule as FilterRule)) {
        throw new BadRequestException(`Invalid filter rule: ${rule}`);
      }

      filters.push({ property, rule: rule as FilterRule, value });
    }

    return filters;
  },
);

export const getWhere = (filters: Filtering[] | undefined) => {
  if (!filters?.length) {
    return {};
  }
  const whereClause: any = {};
  for (const filter of filters) {
    const filterClause: any = getWhereByFilter(filter);
    Object.assign(whereClause, filterClause);
  }
  return whereClause;
};

const getWhereByFilter = (filter: Filtering) => {
  if (!filter) return {};

  switch (filter.rule) {
    case FilterRule.IS_NULL:
      return { [filter.property]: null };
    case FilterRule.IS_NOT_NULL:
      return { [filter.property]: { $ne: null } };
    case FilterRule.EQUALS:
      return { [filter.property]: filter.value };
    case FilterRule.NOT_EQUALS:
      return { [filter.property]: { $ne: filter.value } };
    case FilterRule.GREATER_THAN:
      return { [filter.property]: { $gt: filter.value } };
    case FilterRule.GREATER_THAN_OR_EQUALS:
      return { [filter.property]: { $gte: filter.value } };
    case FilterRule.LESS_THAN:
      return { [filter.property]: { $lt: filter.value } };
    case FilterRule.LESS_THAN_OR_EQUALS:
      return { [filter.property]: { $lte: filter.value } };
    case FilterRule.LIKE:
      return { [filter.property]: { $regex: filter.value, $options: 'i' } };
    case FilterRule.NOT_LIKE:
      return {
        [filter.property]: { $not: { $regex: filter.value, $options: 'i' } },
      };
    case FilterRule.IN:
      return { [filter.property]: { $in: filter.value.split(',') } };
    case FilterRule.NOT_IN:
      return { [filter.property]: { $nin: filter.value.split(',') } };
    case FilterRule.HAS:
      return { [filter.property]: { $elemMatch: JSON.parse(filter.value) } };
    default:
      return {};
  }
};

export const appendFilter = <T>(
  filters: Filtering<T>[] | undefined,
  ...newFilters: Filtering<T>[]
): Filtering<T>[] => {
  if (!filters?.length) {
    filters = [];
  }
  for (const newFilter of newFilters) {
    const currentFilter: Filtering<T> | undefined = filters.find(
      (filter: Filtering<T>) => {
        return (
          filter.property === newFilter.property &&
          filter.rule === newFilter.rule
        );
      },
    );
    if (currentFilter) {
      currentFilter.value = newFilter.value;
    } else {
      filters.push(newFilter);
    }
  }
  return filters;
};

export const findFilterByProperty = <T>(
  filters: Filtering<T>[] | undefined,
  propertyName: string,
): Filtering<T> | undefined => {
  if (!filters?.length) {
    filters = [];
  }
  return filters.find((filter: Filtering<T>) => {
    return filter.property === propertyName;
  });
};
