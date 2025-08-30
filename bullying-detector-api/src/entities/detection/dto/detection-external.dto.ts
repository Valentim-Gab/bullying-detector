import { IsNumber, IsString } from 'class-validator'

export class DetectionExternalDto {
  @IsNumber()
  id: number

  @IsString()
  module: string
}
