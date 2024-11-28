import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UpdateHarassmentPhraseDto {
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
