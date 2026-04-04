FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY ../../apps/api/package.json ./apps/api/
COPY ../../packages/shared/package.json ./packages/shared/
RUN npm ci --legacy-peer-deps --workspace=@backdoor/api --workspace=@backdoor/shared
COPY ../../packages/shared ./packages/shared
COPY ../../apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npx nest build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
