# Usamos una imagen oficial de Node.js en versión Alpine para tener una imagen ligera.
FROM node:16-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Compilamos el código TypeScript
RUN npm run build

# Exponemos el puerto que usará la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]
