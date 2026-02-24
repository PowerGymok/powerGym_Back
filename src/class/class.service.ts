import { Injectable } from '@nestjs/common';
import { ClassRepository } from './class.repository';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';

@Injectable({})
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}
  get_classes() {
    return this.classRepository.get_classes();
  }

  create_new_class(clase: CreateClass) {
    return this.classRepository.create_class(clase);
  }

  update_class(id: string, clase: UpdateClass) {
    return this.classRepository.update(id, clase);
  }

  delete_class(id: string) {
    console.log(this.classRepository.deleted_class(id));
    return this.classRepository.deleted_class(id);
  }
}
