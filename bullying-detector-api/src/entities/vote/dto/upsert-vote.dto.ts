import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class UpsertVoteDto {
  @IsNumber()
  @IsNotEmpty()
  detectionId: number

  @IsNumber()
  @IsNotEmpty()
  voteClassification: number

  @IsNumber()
  @IsOptional()
  idVote?: number
}
