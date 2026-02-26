import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Repository } from 'typeorm';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';

@Injectable({})
export class ClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  find_class_by_id(id: string) {
    return this.classRepository.findOne({
      where: { id },
      relations: ['class_schedule'],
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
      relations: ['class_schedule'],
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        isActive: true,
        class_schedule: true,
      },
    });
  }

  async create_class(clase: CreateClass) {
    // Guardamos la clase e igualamos el espacio de la clase con el espacio disponible
    await this.classRepository.save({
      ...clase,
      spaces_available: clase.capacity,
    });

    return {
      success: true,
      message: 'Clase creada correctamente',
    };
  }

  async update(id: string, clase: UpdateClass) {
    const find_clase = await this.find_class_by_id(id);

    if (!find_clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    // Mezclamos la informacion que tenemos del usuario no modificada con la que si esta modificada
    const update = this.classRepository.merge(find_clase, clase);

    // Guardamos la clase modificada
    const class_updated = await this.classRepository.save(update);

    return {
      success: true,
      message: 'Clase actualizada correctamente',
      class_updated,
    };
  }

  async deleted_class(id: string) {
    // Buscamos la clase
    const find_clase = await this.find_class_by_id(id);

    if (!find_clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    // No borramos la clase ya que preservamos informacion que puede ser valiosa en un futuro
    await this.classRepository.update({ id }, { isActive: false });

    return {
      success: true,
      message: 'Clase borrada correctamente',
    };
  }
}
