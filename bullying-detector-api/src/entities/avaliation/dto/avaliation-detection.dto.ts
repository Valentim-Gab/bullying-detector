import { IsNumber } from 'class-validator'

export class AvaliationDetectionDto {
  @IsNumber()
  id: number

  @IsNumber()
  avaliation: number
}
