import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: 'Operação realizada com sucesso' })
  message?: string;

  @ApiProperty({
    example: {
      timestamp: '2025-11-11T10:30:00Z',
      requestId: 'uuid',
    },
  })
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: [
        {
          field: 'email',
          message: 'Email inválido',
        },
      ],
    },
  })
  error: {
    code: string;
    message: string;
    details?: any[];
  };

  @ApiProperty({
    example: {
      timestamp: '2025-11-11T10:30:00Z',
      requestId: 'uuid',
    },
  })
  meta: {
    timestamp: string;
    requestId?: string;
  };
}


