import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Roles(Role.User, Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('reserve')
  @HttpCode(201) // fijarme si esta bien el codigo
  reserve_a_class(
    @Query('id_user', ParseUUIDPipe) id_user: string,
    @Query('id_class_schedule', ParseUUIDPipe) id_class_schedule: string, // se puede hacer otro metodo con req: any
  ) {
    return this.reservationService.reserve_class(id_user, id_class_schedule);
  }

  @Roles(Role.User, Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('cancel/:id')
  cancel_a_reserve_class(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.cancel_reserve_class(id);
  }

  @Roles(Role.User, Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  get_history_reserves_by_id(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.get_reserves_by_id(id);
  }

  @Roles(Role.User, Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/')
  @HttpCode(200)
  get_all_reservations() {
    return this.reservationService.get_reservations();
  }
}
