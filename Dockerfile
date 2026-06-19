FROM nginx:alpine

# Rimuove la config di default
RUN rm /etc/nginx/conf.d/default.conf

# Config custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# File statici
COPY index.html style.css app.js manifest.webmanifest sw.js favicon.svg /usr/share/nginx/html/
COPY icons /usr/share/nginx/html/icons

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://127.0.0.1/ || exit 1
