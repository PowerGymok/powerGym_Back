import { Class } from 'src/class/class.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'class_schedule',
})
export class Class_schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { nullable: false })
  date: Date;

  @Column('date', { nullable: false })
  time: Date;

  @Column('int', { nullable: false })
  spaces_available: number;

  @Column('boolean', { default: true, nullable: false })
  isActive: boolean;

  @Column('boolean', { default: false, nullable: false })
  membership: boolean;

  @ManyToOne(() => Class, (assign) => assign.class_schedule)
  @JoinColumn({ name: 'class_schedule' })
  class_id: Class;
}
