import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class CreateReferralDto {
  @ApiProperty({
    example: 'uuid-do-membro',
    description: 'ID do membro que receberá a indicação',
  })
  @IsUUID()
  @IsNotEmpty()
  referredToId: string;

  @ApiProperty({
    example: 'Empresa Cliente LTDA',
    description: 'Nome do cliente/lead',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  clientName: string;

  @ApiPropertyOptional({
    example: '+5511977777777',
    description: 'Telefone do cliente',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  clientPhone?: string;

  @ApiPropertyOptional({
    example: 'contato@cliente.com',
    description: 'Email do cliente',
  })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiProperty({
    example:
      'Cliente em busca de consultoria em gestão de projetos. Orçamento estimado em R$ 50.000,00. Contato preferencial por email.',
    description: 'Descrição detalhada da indicação',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Descrição deve ter no mínimo 20 caracteres' })
  description: string;

  @ApiPropertyOptional({
    example: 50000.0,
    description: 'Valor estimado do negócio',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedValue?: number;
}


