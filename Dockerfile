FROM rancher.saas.chb-technologies.ch:5000/chbnginx:latest

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
ADD ./dist /usr/share/nginx/html

ADD ./nginx-custom.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
