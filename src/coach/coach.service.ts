import { BadRequestException, Injectable } from '@nestjs/common';
import { coachRepository } from './coach.repository';
import { UpdateCoachDto } from './dto/updateCoach.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoachService {
  constructor(private readonly coachRepository: coachRepository) {}

  getAllCoaches(page: number, limit: number) {
    return this.coachRepository.getAllCoaches(page, limit);
  }

  getCoachById(id: string) {
    return this.coachRepository.getCoachById(id);
  }

  async updateCoach(id: string, newCoachData: UpdateCoachDto) {
    if (newCoachData) {
      if (newCoachData.password !== newCoachData.confirmPassword)
        throw new BadRequestException('Las contraseñas no coinciden');
      const hashedPassword = await bcrypt.hash(newCoachData.password, 10);
      newCoachData.password = hashedPassword;
    }
    delete newCoachData.confirmPassword;
    return this.coachRepository.updateCoach(id, newCoachData);
  }

  promoteCoach(id: string) {
    return this.coachRepository.promoteCoach(id);
  }

  inactiveCoach(id: string) {
    return this.coachRepository.inactiveCoach(id);
  }

  getByEmail(email: GetByEmailDto) {
    return this.coachRepository.getByEmail(email);
  }
}
