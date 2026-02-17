import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenPackageService } from './token-package.service';
import { CreateTokenPackageDto } from './dto/create-token-package.dto';

@ApiTags('Token Packages')
@Controller('token-packages')
export class TokenPackageController {
  constructor(private readonly tokenPackageService: TokenPackageService) {}

  // POST /token-packages — Crea un paquete nuevo (Admin)
  @Post()
  @ApiOperation({ summary: 'Crear paquete de tokens (Admin)' })
  create(@Body() dto: CreateTokenPackageDto) {
    return this.tokenPackageService.create(dto);
  }

  // GET /token-packages — Lista los paquetes disponibles para comprar
  @Get()
  @ApiOperation({ summary: 'Listar paquetes de tokens disponibles' })
  findAll() {
    return this.tokenPackageService.findAllActive();
  }

  // DELETE /token-packages/:id — Desactiva un paquete
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar paquete de tokens (Admin)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tokenPackageService.deactivate(id);
  }
}
