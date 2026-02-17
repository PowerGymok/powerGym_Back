import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Repository } from 'typeorm';
import { CreateClass } from './dtos/CreateClass.dto';

@Injectable({})
export class ClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async load_seeder(seed_classes: CreateClass[]): Promise<Class[]> {
    return await this.classRepository.save(seed_classes);
  }

  find_class_by_id(id: string) {
    return this.classRepository.findOne({
      where: { id },
      relations: ['Class_schedule'],
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        class_schedule: true,
      },
    });
  }

  get_classes() {
    return this.classRepository.find({
      relations: ['Class_schedule'],
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        class_schedule: true,
      },
    });
  }

  async create_class(clase: CreateClass) {
    await this.classRepository.save(clase);

    return {
      success: true,
      message: 'Clase creada correctamente',
    };
  }

  async update(id: string, clase: CreateClass) {
    const find_clase = await this.find_class_by_id(id);

    if (!find_clase) {
      throw new UnauthorizedException('Clase no encontrada');
    }

    // Mezclamos la informacion que tenemos del usuario no modificada con la que si esta modificada
    const update = this.classRepository.merge(find_clase, clase);

    await this.classRepository.save(update);

    return {
      success: true,
      message: 'Clase actualizada correctamente',
    };
  }

  async deleted_class(id: string) {
    const find_clase = await this.find_class_by_id(id);

    if (!find_clase) {
      throw new UnauthorizedException('Clase no encontrada');
    }

    // No borramos la clase ya que preservamos informacion que puede ser valiosa en un futuro
    await this.classRepository.update(find_clase, {
      isActive: false,
    });

    return {
      success: true,
      message: 'Clase borrada correctamente',
    };
  }

  async assigned_student() {}
}
