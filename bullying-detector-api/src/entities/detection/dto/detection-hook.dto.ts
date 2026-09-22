import { IsOptional, IsString } from 'class-validator'

export class DetectionHookDto {
  @IsOptional()
  @IsString()
  hookUrl?: string

  @IsOptional()
  @IsString()
  hookMethod?: 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch'

  @IsOptional()
  @IsString()
  hookToken?: string

  @IsOptional()
  @IsString()
  hookIdBodyKey?: string

  @IsOptional()
  @IsString()
  hookFinalClassificationBodyKey?: string
}
