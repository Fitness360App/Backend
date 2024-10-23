# Fitness360 API

Este proyecto es una API para la aplicación Fitness360, que utiliza Firebase para la autenticación y el manejo de datos. La API está construida con Node.js y Express.

## Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/).

## Instalación

Para instalar las dependencias necesarias, ejecuta los siguientes comandos en tu terminal:

```bash
# Instalar firebase-admin para acceder a las funcionalidades de Firebase
npm install firebase-admin

# Instalar ESLint para el análisis estático de código
npm install eslint@latest --save-dev

# Actualizar todas las dependencias
npm update

# Instalar firebase-functions para la creación de funciones en Firebase
npm install firebase-functions

# Instalar tipos para firebase-functions
npm install @types/firebase-functions --save-dev

# Instalar express para manejar rutas y middleware
npm install express body-parser

# Reinstalar firebase-admin (esto parece repetido, puedes omitirlo si ya lo has instalado)
npm install firebase-admin

# Instalar express y firebase-admin (esto también parece repetido)
npm install express firebase-admin
