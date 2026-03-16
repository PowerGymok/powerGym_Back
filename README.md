<p align="center">
  <a href="https://nestjs.com" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

# 🏋️ PowerGym API

API backend desarrollada con **Node.js y NestJS** para la gestión de gimnasios.

Permite administrar usuarios, membresías y autenticación mediante **JWT**, utilizando una arquitectura modular y base de datos relacional con **PostgreSQL**.

---

## 🌐 Deploy

API desplegada en Render:

```
https://powergym-back-1s39.onrender.com
```

Swagger disponible en:

```
https://powergym-back-1s39.onrender.com/api
```

---

## 🚀 Tecnologías utilizadas

- Node.js
- NestJS
- TypeScript
- PostgreSQL (Supabase)
- TypeORM
- JWT Authentication
- REST API
- Swagger

---

## ⚙️ Funcionalidades

- Registro y autenticación de usuarios
- Autenticación con JWT
- Gestión de usuarios
- Gestión de membresías
- Arquitectura modular con NestJS
- Documentación de endpoints con Swagger

---

## 📦 Instalación

Clonar el repositorio

```bash
git clone https://github.com/PowerGymok/powerGym_Back.git
```

Entrar al proyecto

```bash
cd powerGym_Back
```

Instalar dependencias

```bash
npm install
```

---

## 🔑 Variables de entorno

Crear un archivo `.env` basado en `.env.example`.

Ejemplo:

```env
# APP
NODE_ENV=development
PORT=3000

# DATABASE - SUPABASE
# 1) Ir a Supabase, al dashboard principal
# 2) Botón "Connect"
# 3) En la pestaña Connection String elegir "Transaction Pooler"
# 4) Click en "View parameters"
# 5) Copiar la URL y reemplazar la contraseña

DATABASE_URL=postgresql://postgres.djbdnaxeznrkcrkosmzf:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# JWT CONNECTION
JWT_SECRET=tu_clave_aqui
JWT_EXPIRES_IN=1h
```

---

## ▶️ Ejecutar el proyecto

Modo desarrollo

```bash
npm run start:dev
```

Modo producción

```bash
npm run start:prod
```

---

## 📚 Documentación de la API

Swagger disponible en:

```
https://powergym-back-1s39.onrender.com/api
```

---

## 👥 Equipo

Proyecto desarrollado en equipo utilizando metodología **SCRUM** durante el Bootcamp **Soy Henry**.

### Integrantes

- Mauro Francisco Gaetan
- ...
- ...
