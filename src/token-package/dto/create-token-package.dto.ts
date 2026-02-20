import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTokenPackageDto {
  @ApiProperty({ example: 'Starter Pack', description: 'Nombre del paquete' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Ideal para probar clases especiales' })
  @IsOptional()
  @IsString()
  description?: string;

  // Cuántos tokens recibe el usuario al comprar este paquete
  @ApiProperty({ example: 100, description: 'Cantidad de tokens a recibir' })
  @IsInt()
  @Min(1)
  tokenAmount: number;

  // Cuánto cuesta en dinero real
  @ApiProperty({ example: 9.99, description: 'Precio en USD' })
  @IsNumber()
  @Min(0.01)
  price: number;
}
