/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { transporter } from '../config/mailer.config';

@Injectable()
export class NotificationsService {
  async sendWelcomeEmail(email: string, name: string) {
    await transporter.sendMail({
      from: '"PowerGym" <powergym@gmail.com>',
      to: email,
      subject: 'Bienvenido a PowerGym',
      html: `<h1>¡Bienvenido a PowerGym ${name}!</h1>
      <p>Gracias por registrarte en nuestro gimansio. Esperamos verte pronto en nuestras clases</p>
      <p>Si tienes alguna duda, no dudes en contactarnos al correo ${email}</p>
      <p>Saludos,<br>El equipo de PowerGym</p>`,
    });
  }
}
