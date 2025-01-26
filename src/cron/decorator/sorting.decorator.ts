import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { SortOrder } from 'mongoose';

export interface Sorting<T = any> {
  property: string | keyof T;
  direction: SortOrder;
}

export const SortingParams = createParamDecorator(
  (data, ctx: ExecutionContext): Sorting | null => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    const sort: string = request.query.sort as string;
    if (!sort) {
      return null;
    }

    const sortPattern: RegExp = /^([a-zA-Z0-9_]+):(asc|desc)$/;
    if (!sort.match(sortPattern)) {
      throw new BadRequestException('Invalid sort parameter');
    }

    const [property, direction] = sort.split(':');
    return {
      property,
      direction: direction === 'asc' ? 1 : (-1 as SortOrder),
    };
  },
);

export const getOrder = (sort: Sorting | undefined) => {
  if (!sort) {
    return {};
  }
  return { [sort.property]: sort.direction };
};
