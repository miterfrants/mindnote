# Architecture

## Overview
![Serverless Application Architecture (6)](https://user-images.githubusercontent.com/2028693/61886399-3ab9ee00-af32-11e9-9b2d-922fa0dcf4ae.png)

## API Server (ASP.NET Core Web APIs)
### prepare secrets.json
```
{
    "Config": {
        "Secrets": {
            "DBConnectionString": "host=${ip};port=${port};database=${dbname};username=${username};password=${pwd}",
            "JwtKey": "${jwt_key}",
            "GCSCredential": "${gcs_credential_json}"
            /* Pay for me!!! */
            "TapPayPartnerKey": "${Third-Party Transaction Private Key}",
        }
    }
}
```

**ip**:
your postgres db ip in docker network. please check your api server and db in the same 
intranet.

**port**:
postgres db default port is `5432`

**dbname**:
database name

**username**:
user who is db owner

**pwd**:
users' password

**jwt_key**:
JSON Web Token security key

**gcs_credential_json**:
Google cloud storage credential JSON. How to generate this credential JSON ?
1. link to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. click `create credentials` dropdown list
3. select `Service account key`
4. redirect `Create service account key`
    - `Service account` select `New service account`
    - `Service account name ` type your service account name, will be listed in `Goolge IAM`
    - `Role` choise `Service Usage Consumer`、`Storage Object Admin`
    - `Key type` choise `JSON`
    - click `create` button, and download json file
5. escape json file and replace `${GCS Credential JSON}`

### build docker image
`docker build -t mindnote-api-server ./api/ --rm`

### run docker container
```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network ${pgnetwork} \
-d \
--rm \
-v ${volume}:/app/volume \
--name mindnote-api-server \
-p 8081:8081 mindnote-api-server
```

**pgnetwork**:
Docker networking name, put api server to an same intranet with postgres database

**volume**:
Your secrets.json parent directory path

### develop mode
1. ignore above steps `build docker image` & `run docker container`
2. change directory to api root (ex: cd xxxx/mindnote/api)
3. run command `dotnet run`, make sure you'r workspace have already installed dotnet core framework

## Front-End (Vanilla JS)
### run docker container
```
docker run -d \
-p 8082:80 \
-v ${front_end_path}:/usr/share/nginx/html \
-v ${nginx_config_path}:/etc/nginx/conf.d/default.conf \
--name mindnote-front-end \
--rm \
nginx
```

**front_end_path**:
front-end directory path (ex: cd xxxs/mindnote/front-end)

**nginx_config_path**:
nginx config path
example
```
server {
    listen      80;
    server_name localhost;
    location / {
        root        /usr/share/nginx/html;
        index       index.html index.htm;
        try_files   $uri $uri/ /index.html;
    }
}
```

### develop mode
1. change directory to `${your repo path}/mindnote/front-end`
2. execute command `npm install`
2. execute command `node local-server.js`
