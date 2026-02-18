import { NextFunction, Request, Response } from 'express';

export function LoggerGlobal(req: Request, res: Response, next: NextFunction) {
  const timeStamp = new Date().toISOString();
  console.log(
    `Se ejecuto un ${req.method} en la ruta ${req.url} a las ${timeStamp}`,
  );
  next();
}
