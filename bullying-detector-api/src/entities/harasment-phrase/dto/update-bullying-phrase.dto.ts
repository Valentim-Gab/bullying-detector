import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateBullyingPhraseDto {
  @IsNumber()
  @IsNotEmpty()
  idDetection: number

  @IsString()
  @IsNotEmpty()
  username: string

  @IsBoolean()
  @IsNotEmpty()
  approve: boolean
}
