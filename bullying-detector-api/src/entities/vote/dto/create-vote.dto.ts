import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateVoteDto {
  @IsNumber()
  @IsNotEmpty()
  detectionId: number

  @IsBoolean()
  @IsNotEmpty()
  vote: boolean
}
