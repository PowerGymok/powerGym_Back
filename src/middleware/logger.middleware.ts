import { NextFunction, Request, Response } from 'express';

export function LoggerGlobal(req: Request, res: Response, next: NextFunction) {
  const timeStamp = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'short',
    timeStyle: 'medium',
  });
  console.log(
    `Se ejecuto un ${req.method} en la ruta ${req.url} a las ${timeStamp}`,
  );
  next();
}
