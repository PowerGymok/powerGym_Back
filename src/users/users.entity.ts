import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/common/roles.enum';
import { UserMembership } from '../user-membership/user-membership.entity';
import { Transaction } from 'src/transactions/transactions.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  @Column({ type: 'bigint' })
  phone: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column()
  Birthdate: Date;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'text', nullable: true })
  profileImg: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  courtesyClass: boolean;
  // Balance de tokens internos del usuario
  // Empieza en 0. Aumenta al comprar un paquete, disminuye al usarlos
  @Column({ type: 'int', default: 0 })
  tokenBalance: number;

  // OneToMany = un usuario → muchas suscripciones a membresías
  // { lazy: false } = TypeORM NO carga las membresías automáticamente,
  // solo las trae si explícitamente usas relations: ['memberships'] en la query
  @OneToMany(() => UserMembership, (um) => um.user)
  memberships: UserMembership[];

  // OneToMany = un usuario → muchas transacciones (historial completo)
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
