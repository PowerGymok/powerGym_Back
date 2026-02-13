import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { CoachService } from './coach.service';
import { UpdateCoachDto } from './dto/updateCoach.dto';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get() //Hacer guardian para que solo admin pueda ingresar
  getAllCoaches(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.coachService.getAllCoaches(validPage, validLimit);
  }

  @Get(':id') //Hacer guardian para que solo admin y coach propietario de la cuenta pueda ingresar
  getCoachById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.getCoachById(id);
  }

  @Put('update/:id') //Es necesario hacer un Guard para que un admin o un coach solo pueda modificar SU información y no la de otro usuario o coach.
  updateCoach(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newCoachData: UpdateCoachDto,
  ) {
    return this.coachService.updateCoach(id, newCoachData);
  }

  @Put('inactive/:id') //Hacer un guardian para que solamente el admin o coach propietario puedan desactivar.
  inactiveCoach(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachService.inactiveCoach(id);
  }
}
