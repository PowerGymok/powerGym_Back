import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../auth/enums/role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;
}
