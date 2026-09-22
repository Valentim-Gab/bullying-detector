import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { DetectionExternalDto } from './detection-external.dto'
import { DetectionHookDto } from './detection-hook.dto'

export class DetectionBaseDto {
  @IsString()
  @IsNotEmpty()
  mainText: string

  @IsOptional()
  @IsString()
  context?: string

  @IsOptional()
  @IsObject()
  external?: DetectionExternalDto

  @IsOptional()
  @IsObject()
  hook?: DetectionHookDto
}
