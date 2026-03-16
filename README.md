<p align="center">
  <a href="https://nestjs.com" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

# PowerGym API

# 🏋️ PowerGym API

API backend desarrollada con **Node.js y NestJS** para la gestión de gimnasios.

Permite administrar usuarios, membresías y autenticación mediante **JWT**, utilizando una arquitectura modular y base de datos relacional con **PostgreSQL**.

---

## 🚀 Tecnologías utilizadas

- Node.js
- NestJS
- TypeScript
- PostgreSQL
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

# Instalación

Clonar el repositorio

```bash
git clone https://github.com/PowerGymok/powerGym_Back.git
```

Entrar al proyecto

```bash id="k1zv3q"
cd powerGym_Back
```

Instalar dependencias

```bash id="r4s8lx"
npm install
```

---

# Variables de entorno

Crear un archivo `.env` basado en `.env.example`.

Ejemplo:

```env id="a7p9nm"
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

# Ejecutar el proyecto

Modo desarrollo

```bash id="m6x0ps"
npm run start:dev
```

Modo producción

```bash id="s9t2dw"
npm run start:prod
```

---

# Documentación de la API

Swagger disponible en:

```
http://localhost:3000/api
```

---

# Equipo

Proyecto desarrollado en equipo utilizando metodología **SCRUM**.

---

# Autor

**Mauro Francisco Gaetan**

Full Stack Developer
Node.js | NestJS | PostgreSQL

