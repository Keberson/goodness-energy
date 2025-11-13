FROM nginx:alpine

COPY --from=frontend /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf  

CMD ["nginx", "-g", "daemon off;"]
