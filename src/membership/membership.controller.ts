import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

// @ApiTags agrupa las rutas bajo "Membresías" en la documentación Swagger
@ApiTags('Memberships')
@Controller('memberships')
export class MembershipController {
  // NestJS inyecta automáticamente el servicio gracias al sistema de DI
  constructor(private readonly membershipService: MembershipService) {}

  // POST /memberships — Crea un nuevo tipo de membresía
  // (en producción aquí irá un guard de admin)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de membresía (Admin)' })
  create(@Body() dto: CreateMembershipDto) {
    return this.membershipService.create(dto);
  }

  // GET /memberships — Devuelve todos los planes activos (para usuarios)
  @Get()
  @ApiOperation({ summary: 'Listar membresías activas disponibles' })
  findAllActive() {
    return this.membershipService.findAllActive();
  }

  // GET /memberships/admin — Devuelve TODOS los planes incluyendo inactivos
  @Get('admin')
  @ApiOperation({ summary: 'Listar todas las membresías (Admin)' })
  findAll() {
    return this.membershipService.findAll();
  }

  // GET /memberships/:id — Obtiene el detalle de una membresía
  // ParseUUIDPipe valida que el parámetro sea un UUID válido antes de entrar al servicio
  @Get(':id')
  @ApiOperation({ summary: 'Obtener membresía por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.findOne(id);
  }

  // PATCH /memberships/:id — Actualiza parcialmente una membresía
  // PATCH = actualización parcial (solo los campos que envíes), a diferencia de PUT que reemplaza todo
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar membresía (Admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.membershipService.update(id, dto);
  }

  // DELETE /memberships/:id — Desactiva la membresía (no la borra físicamente)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar membresía (Admin)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.deactivate(id);
  }
}
