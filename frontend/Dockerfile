# FROM node:20-alpine

# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json* ./
# RUN npm install

# # Copy source code
# COPY . .

# # Build Next.js app
# RUN npm run build

# # Expose Next.js default port
# EXPOSE 3000

# # Start production server
# CMD ["npm", "run", "start"]

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# --- NEW SECTION: Build Arguments ---
ARG NEXT_PUBLIC_AUTH_API
ARG NEXT_PUBLIC_TRANSACTION_API

# Make them available to the shell for the 'build' command
ENV NEXT_PUBLIC_AUTH_API=$NEXT_PUBLIC_AUTH_API
ENV NEXT_PUBLIC_TRANSACTION_API=$NEXT_PUBLIC_TRANSACTION_API
# ------------------------------------

# Build Next.js app (Now it will bake the actual values into the JS)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
