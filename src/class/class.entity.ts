import { Class_schedule } from 'src/class_schedule/class_schedule.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'class',
})
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, nullable: false })
  name: string;

  @Column('varchar', { length: 10, nullable: false })
  duration: string;

  @Column('varchar', { length: 200 })
  description: string;

  @Column('numeric', { nullable: false })
  capacity: number;

  @Column('boolean', { default: true, nullable: false })
  isActive: boolean;

  @OneToMany(() => Class_schedule, (schedule) => schedule.class)
  class_schedule: Class_schedule[];

  @Column('varchar', { nullable: true })
  imgUrl?: string;

  @Column('varchar', { nullable: true })
  cloudinaryId?: string;
}
