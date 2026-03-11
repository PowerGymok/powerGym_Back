import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenPackageService } from './token-package.service';
import { CreateTokenPackageDto } from './dto/create-token-package.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/common/roles.enum';

@ApiTags('Token Packages')
@Controller('token-packages')
export class TokenPackageController {
  constructor(private readonly tokenPackageService: TokenPackageService) {}

  // POST /token-packages — Crea un paquete nuevo (Admin)
  @ApiBearerAuth()
  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Desactivar paquete de tokens (Admin)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tokenPackageService.deactivate(id);
  }
}
