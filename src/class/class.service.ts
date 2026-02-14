import { Injectable } from '@nestjs/common';
import { ResponseClass } from 'src/class/dtos/ResponseClass.dto';
import { ClassRepository } from './class.repository';

@Injectable({})
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}

  private seed_classes = [
    {
      name: 'Boxeo',
      duration: '1 hr',
      description: 'Clases de boxeo recreativo',
      capacity: 5,
      isActive: true,
    },
    {
      name: 'Body Pump',
      duration: '1 hr',
      description: 'Clases de Body Pump para principiantes',
      capacity: 10,
      isActive: true,
    },
    {
      name: 'Zumba Femenina',
      duration: '1 hr',
      description: 'Clases de zumba para mujeres',
      capacity: 10,
      isActive: true,
    },
    {
      name: 'Zumba Masculina',
      duration: '1 hr',
      description: 'Clases de zumba para hombres',
      capacity: 0,
      isActive: false,
    },
  ];

  async seeder() {
    await this.classRepository.load_seeder(this.seed_classes);
  }

  get_classes() {
    return this.classRepository.get_classes();
  }

  create_new_class(clase: ResponseClass) {
    return this.classRepository.create_class(clase);
  }

  update_class(id: string, clase: ResponseClass) {
    return this.classRepository.update(id, clase);
  }

  delete_class(id: string) {
    return this.classRepository.deleted_class(id);
  }
}
