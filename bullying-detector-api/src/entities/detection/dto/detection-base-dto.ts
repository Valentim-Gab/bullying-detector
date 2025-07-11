import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class DetectionBaseDto {
  @IsString()
  @IsNotEmpty()
  mainText: string

  @IsOptional()
  @IsString()
  context?: string

  @IsOptional()
  @IsNumber()
  externalId?: number

  @IsOptional()
  @IsString()
  externalModule?: string
}
