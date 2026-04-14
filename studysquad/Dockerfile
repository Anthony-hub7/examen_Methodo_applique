FROM node:20-slim

WORKDIR /app

# Keep npm cache outside bind-mounted source for better speed.
ENV NPM_CONFIG_CACHE=/home/node/.npm

COPY package*.json ./

# BuildKit cache dramatically speeds up repeated installs.
RUN npm ci


COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--strictPort"]
