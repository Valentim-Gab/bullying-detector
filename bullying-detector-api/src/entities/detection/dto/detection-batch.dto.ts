import { IsArray, IsNotEmpty, IsObject, IsOptional } from 'class-validator'
import { DetectionHookDto } from './detection-hook.dto'
import { DetectionBaseDto } from './detection-base.dto'

export class DetectionBatchDto {
  @IsArray()
  @IsNotEmpty()
  detections: DetectionBaseDto[]

  @IsOptional()
  @IsObject()
  hook?: DetectionHookDto
}
