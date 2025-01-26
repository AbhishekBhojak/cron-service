import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CronCreateRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  triggerUrl: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;
}

export class CronUpdateRequest {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  triggerUrl: string;

  @IsOptional()
  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  schedule: string;

  @IsOptional()
  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
