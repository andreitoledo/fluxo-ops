import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { AddOrderItemDto } from './add-order-item.dto';

export class AddOrderItemsDto {
  @ApiProperty({
    type: [AddOrderItemDto],
    description: 'Lista de itens a serem adicionados ao pedido',
  })
  @IsArray({ message: 'Items deve ser uma lista.' })
  @ArrayMinSize(1, { message: 'Informe ao menos um item.' })
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  items: AddOrderItemDto[];
}
