/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { transporter } from '../config/mailer.config';

@Injectable()
export class NotificationsService {
  async sendWelcomeEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <powergym@gmail.com>',
      to: email,
      subject: '¡Bienvenido a PowerGym! 💪',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ff6600; font-size: 28px;">¡Bienvenido a PowerGym, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Nos alegra tenerte en nuestra comunidad. Tu cuenta ha sido creada exitosamente.</p>
            <p style="font-size: 16px; line-height: 1.6;">Ya puedes comenzar a explorar nuestras clases y reservar tu lugar.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async sendUpdateEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <powergym@gmail.com>',
      to: email,
      subject: 'Tu perfil ha sido actualizado',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6600;">Actualización de perfil</h2>
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, te informamos que tu perfil ha sido actualizado exitosamente.</p>
            <p style="font-size: 16px; line-height: 1.6;">Si no realizaste este cambio, por favor contáctanos inmediatamente.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async inactiveUserEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <powergym@gmail.com>',
      to: email,
      subject: 'Tu cuenta ha sido desactivada',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #cc0000;">Cuenta desactivada</h2>
            <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>, tu cuenta en PowerGym ha sido desactivada.</p>
            <p style="font-size: 16px; line-height: 1.6;">Si crees que esto es un error o deseas reactivar tu cuenta, comunícate con nosotros.</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
            </div>`,
    });
  }

  async promoteCoachEmail(name: string, email: string) {
    await transporter.sendMail({
      from: '"PowerGym" <powergym@gmail.com>',
      to: email,
      subject: '¡Bienvenido al equipo de entrenadores de PowerGym!',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ff6600; font-size: 26px;">¡Felicitaciones, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Es un placer darte la bienvenida como nuevo <strong>entrenador oficial de PowerGym</strong>.</p>
            <p style="font-size: 16px; line-height: 1.6;">A partir de ahora tendrás acceso a todas las herramientas para gestionar tus clases y acompañar a nuestros miembros en su camino fitness.</p>
            <p style="font-size: 16px; line-height: 1.6;">¡Gracias por ser parte de este equipo!</p>
            <p style="font-size: 14px; color: #888;">El equipo de PowerGym</p>
          </div>`,
    });
  }

  async createMembershipPaymentEmail() {}
}
