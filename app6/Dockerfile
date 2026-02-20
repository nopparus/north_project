FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gemini API key ต้องส่งเข้ามาตอน build เนื่องจาก Vite จะ inline ค่าลงไปใน bundle
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
