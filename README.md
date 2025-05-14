# DiarioFitness

DiarioFitness es una aplicación web para registrar, planificar y hacer seguimiento de rutinas y ejercicios de entrenamiento físico. Incluye gestión de usuarios, rutinas personalizadas, registro diario y análisis de progresos.

## Características principales
- Gestión de usuarios y autenticación
- Creación y edición de rutinas con múltiples ejercicios
- Registro diario de entrenamientos y sensaciones
- Relación muchos-a-muchos entre ejercicios y rutinas
- Interfaz moderna y responsiva (Angular)
- Backend robusto con Symfony/API Platform

## Requisitos previos
- Node.js (v16+ recomendado)
- Angular CLI
- PHP 8.1+
- Composer
- MySQL o MariaDB

## Instalación (Frontend)
```bash
npm install
npm start
```

## Instalación (Backend)
```bash
cd backend/
composer install
cp .env.example .env
# Configura la base de datos en .env
php bin/console doctrine:migrations:migrate
symfony server:start
```

## Uso
1. Regístrate o inicia sesión.
2. Crea rutinas y ejercicios personalizados.
3. Registra tus entrenamientos diarios.
4. Visualiza y analiza tu progreso.

## Estructura del proyecto
- `src/app/` — Código principal de Angular
- `src/app/services/` — Servicios de API
- `src/app/models/` — Interfaces de datos
- `src/app/components/` — Componentes reutilizables y formularios
- `src/app/views/` — Vistas principales de la app

## Licencia
MIT

---

> Proyecto desarrollado para fines educativos y de mejora personal. ¡Contribuciones bienvenidas!
