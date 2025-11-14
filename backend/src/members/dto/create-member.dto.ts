import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

export class AddressDto {
  @ApiPropertyOptional({ example: 'Rua Exemplo' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  number?: string;

  @ApiPropertyOptional({ example: 'Sala 45' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  complement?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ example: '01234-567' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  zipcode?: string;
}

export class CreateMemberDto {
  @ApiProperty({
    example: 'uuid',
    description: 'ID da intenção aprovada (token de convite)',
  })
  @IsUUID()
  @IsNotEmpty()
  intentId: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF (formato: 000.000.000-00)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf?: string;

  @ApiPropertyOptional({
    example: '1985-05-20',
    description: 'Data de nascimento (formato: YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'https://exemplo.com/foto.jpg' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Empresa XPTO Ltda' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({ example: 'Diretor Comercial' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ example: 'Soluções em software para gestão empresarial...' })
  @IsString()
  @IsOptional()
  businessDescription?: string;

  @ApiPropertyOptional({ example: 'https://empresa.com' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/joao' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkedinUrl?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  address?: AddressDto;
}
