import { IsNotEmpty, IsString } from 'class-validator'

export class CreateHarassmentPhraseDto {
  @IsString()
  @IsNotEmpty()
  phrase: string

  @IsString()
  username: string
}
