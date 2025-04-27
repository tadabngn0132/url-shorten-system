# Giai đoạn 1: Xây dựng ứng dụng Vue
FROM node:18-alpine as build-stage

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY frontend/package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép tất cả các tệp frontend
COPY frontend/ .

# Xây dựng ứng dụng
RUN npm run build

# Giai đoạn 2: Phục vụ ứng dụng với Nginx
FROM nginx:stable-alpine as production-stage

# Sao chép các tệp đã xây dựng từ giai đoạn xây dựng
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

# Khởi động Nginx server
CMD ["nginx", "-g", "daemon off;"]