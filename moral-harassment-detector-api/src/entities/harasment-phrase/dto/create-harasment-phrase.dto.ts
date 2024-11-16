import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateHarassmentPhraseDto {
  @IsString()
  @IsNotEmpty()
  phrase: string

  @IsString()
  username: string

  @IsNumber()
  idDetection: number
}
