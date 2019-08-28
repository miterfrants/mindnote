Docker Run Command
```
docker run -d \
-p 8082:80 \
-v /usr/share/mindnote/front-end:/usr/share/mindnote/front-end \
-v /usr/share/mindnote/render/nginx.conf:/etc/nginx/conf.d/default.conf \
--name mindnote-front-end \
--rm \
mindnote-front-end
```

Nginx Config File
```
server {
    listen       80;
    server_name  localhost;
    location ~ \.(js|css|png|woff2|woff|ttf|html|gif|svg|json|jpg)$ {
        root /usr/share/mindnote/front-end;
        rewrite "^/mindnote/(.*)$" /$1 last;
        #try_files $1.$2 $1.$2/ = 404;
    }
    location / {
        proxy_pass http://0.0.0.0:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #root   /usr/share/nginx/html;
        #index  index.html index.htm;
        #try_files $uri $uri/ /index.html;
    }
}
```