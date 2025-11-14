import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMembershipIntentDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do candidato',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'Email do candidato',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiPropertyOptional({
    example: '+5511999999999',
    description: 'Telefone do candidato',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Empresa XPTO Ltda',
    description: 'Nome da empresa',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({
    example: 'Tecnologia',
    description: 'Setor/indústria de atuação',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({
    example:
      'Desejo expandir minha rede de contatos profissionais e gerar novos negócios através do networking estratégico...',
    description: 'Motivação para participar do grupo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Motivação é obrigatória' })
  @MinLength(20, { message: 'Motivação deve ter no mínimo 20 caracteres' })
  motivation: string;
}
