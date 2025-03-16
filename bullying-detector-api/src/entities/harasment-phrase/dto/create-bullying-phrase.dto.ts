import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateBullyingPhraseDto {
  @IsString()
  @IsNotEmpty()
  phrase: string

  @IsString()
  username: string

  @IsNumber()
  idDetection: number
}
