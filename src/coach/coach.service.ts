import { BadRequestException, Injectable } from '@nestjs/common';
import { coachRepository } from './coach.repository';
import { UpdateCoachDto } from './dto/updateCoach.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CoachService {
  constructor(
    private readonly coachRepository: coachRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  getAllCoaches(page: number, limit: number) {
    return this.coachRepository.getAllCoaches(page, limit);
  }

  getCoachById(id: string) {
    return this.coachRepository.getCoachById(id);
  }

  async updateCoach(id: string, newCoachData: UpdateCoachDto) {
    if (newCoachData.password) {
      if (newCoachData.password !== newCoachData.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const hashedPassword = await bcrypt.hash(newCoachData.password, 10);
      newCoachData.password = hashedPassword;
    }

    delete newCoachData.confirmPassword;

    const coach = await this.coachRepository.updateCoach(id, newCoachData);
    await this.notificationsService.sendUpdateEmail(coach.name, coach.email);

    return 'El perfil se ha actualizado exitosamente';
  }

  async promoteCoach(id: string) {
    const coach = await this.coachRepository.promoteCoach(id);
    try {
      await this.notificationsService.promoteCoachEmail(
        coach.name,
        coach.email,
      );
    } catch (error) {
      console.error(
        'Error enviando email de promoción:',
        error instanceof Error ? error.message : error,
      );
    }
    return 'El usuario ahora hace parte de los entrenadores del gimnasio';
  }

  async demoteCoach(id: string) {
    return this.coachRepository.demoteCoach(id);
  }

  async inactiveCoach(id: string) {
    const coach = await this.coachRepository.inactiveCoach(id);
    await this.notificationsService.inactiveUserEmail(coach.name, coach.email);
    return 'Su cuenta ha sido desactivada exitosamente';
  }

  getNameAndImg() {
    return this.coachRepository.getNameAndImg();
  }

  getByEmail(email: GetByEmailDto) {
    return this.coachRepository.getByEmail(email);
  }
}
