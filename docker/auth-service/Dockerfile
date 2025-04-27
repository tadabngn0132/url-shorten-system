# Sử dụng phiên bản Node.js LTS
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY service-node/package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép mã ứng dụng
COPY service-node/ .

# Mở cổng
EXPOSE 5000

# Thiết lập biến môi trường
ENV NODE_ENV=production
ENV PORT=5000
ENV JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
ENV MONGODB_URI=mongodb://mongo:27017/url-shortener-auth

# Khởi động ứng dụng
CMD ["node", "server.js"]