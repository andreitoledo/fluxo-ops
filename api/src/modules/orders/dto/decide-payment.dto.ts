import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DecidePaymentDto {
  @ApiPropertyOptional({
    example: 'Comprovante validado pelo financeiro.',
    description: 'Observacao da decisao financeira',
  })
  @IsOptional()
  @IsString({ message: 'A observacao da decisao deve ser um texto.' })
  decisionNote?: string;
}
