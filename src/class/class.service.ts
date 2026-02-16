import { Injectable } from '@nestjs/common';
import { ClassRepository } from './class.repository';
import { CreateClass } from './dtos/CreateClass.dto';

@Injectable({})
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}

  private seed_classes = [
    {
      name: 'Boxeo',
      duration: '1 hr',
      description: 'Clases de boxeo recreativo',
      capacity: 5,
    },
    {
      name: 'Body Pump',
      duration: '1 hr',
      description: 'Clases de Body Pump para principiantes',
      capacity: 10,
    },
    {
      name: 'Zumba Femenina',
      duration: '1 hr',
      description: 'Clases de zumba para mujeres',
      capacity: 10,
    },
    {
      name: 'Zumba Masculina',
      duration: '1 hr',
      description: 'Clases de zumba para hombres',
      capacity: 2, // Pongo a este que sea falso
    },
  ];

  async seeder() {
    await this.classRepository.load_seeder(this.seed_classes);
    return { message: 'Seeder de clases cargado correctamente' };
  }

  get_classes() {
    return this.classRepository.get_classes();
  }

  create_new_class(clase: CreateClass) {
    return this.classRepository.create_class(clase);
  }

  update_class(id: string, clase: CreateClass) {
    return this.classRepository.update(id, clase);
  }

  delete_class(id: string) {
    return this.classRepository.deleted_class(id);
  }
}
