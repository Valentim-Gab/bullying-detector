import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class UpsertVoteDto {
  @IsNumber()
  @IsNotEmpty()
  detectionId: number

  @IsBoolean()
  @IsNotEmpty()
  vote: boolean

  @IsNumber()
  @IsOptional()
  idVote?: number
}
