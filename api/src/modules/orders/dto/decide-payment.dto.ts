import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class DecidePaymentDto {
  @ApiProperty({
    enum: [PaymentStatus.APPROVED, PaymentStatus.REJECTED],
    example: PaymentStatus.APPROVED,
    description: 'Decisao do financeiro sobre o pagamento',
  })
  @IsEnum([PaymentStatus.APPROVED, PaymentStatus.REJECTED], {
    message: 'Payment status deve ser APPROVED ou REJECTED.',
  })
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    example: 'Comprovante validado pelo financeiro.',
    description: 'Observacao da decisao financeira',
  })
  @IsOptional()
  @IsString({ message: 'Observacao da decisao deve ser um texto.' })
  decisionNote?: string;
}
