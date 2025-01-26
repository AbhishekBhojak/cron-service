import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  skip: number;
}

const DEFAULT_PAGE: number = 0;
const MAX_SIZE: number = 200;
const DEFAULT_SIZE: number = 200;

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): Pagination => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    let page: number = parseInt(request.query.page as string, 10);
    if (isNaN(page)) {
      page = DEFAULT_PAGE;
    }

    let size: number = parseInt(request.query.size as string, 10);
    if (isNaN(size)) {
      size = DEFAULT_SIZE;
    }

    // Validate `page` and `size`
    if (page < 0 || size < 0) {
      throw new BadRequestException('Invalid pagination params');
    }

    if (size > MAX_SIZE) {
      throw new BadRequestException(
        'Invalid pagination params: size exceeds maximum allowed value',
      );
    }

    // Calculate pagination parameters
    const limit: number = size;
    const skip: number = page * limit; // MongoDB uses `skip` instead of `offset`

    return { page, limit, size, skip };
  },
);
