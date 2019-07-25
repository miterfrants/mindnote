# Architecture

## Overview
![Serverless Application Architecture (6)](https://user-images.githubusercontent.com/2028693/61886399-3ab9ee00-af32-11e9-9b2d-922fa0dcf4ae.png)

## API Server (ASP.NET Core Web APIs)
### build docker image
`docker build -t mindnote-api-server ./api/ --rm`

### prepare secrets.json
```
{
    "Config": {
        "Secrets": {
            "DBConnectionString": "host=${ip};port=${port};database=${dbname};username=${username};password=${pwd}",
            "JwtKey": "${JWT Key}",
            "GCSCredential": "${GCS Credential JSON}"
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

**JWT Key**:
JSON Web Token security key

**GCS Credential JSON**:
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
Your secrets.json parent directory

## Front-End Site (Vanilla JS)

## Chrome Extension (Vanilla JS)

# Launch api service

## Build a Docker Image
```
docker build -t mindnote
```

## Launch Docker container

```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v ${your secrets.json folder}:/app/volume \
--name mindnote-api-server \
-p 8081:8081 mindnote-api-server \
--use-database-names
```

secrets.json
```
{
    "Config": {
        "Secrets": {
            "DBConnectionString": "host=127.0.0.1;port=5432;database=xxxx;username=xxxx;password=xxxx",
            "JwtKey": "xxxx"
        }
    }
}
```


backup 
```
docker run -d \
--rm \
--network pgnetwork \
-p 5432:5432 \
--name postgres \
--env-file /srv/postgres/pg-env.list \
-v /srv/postgres/volume \
postgres

docker run -d \
--rm \
--network pgnetwork \
-p 5050:5050 \
--name pgadmin \
--env-file /srv/pgadmin/pgadmin-env.list \
-v /srv/pgadmin/volume \
postgres

docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v /srv/mindnote-api:/app/volume \
--name mindnote-api-server \
-p 8081:8081 mindnote-api-server
```

```
docker run -d \
-p 8082:80 \
-v ~/project/mindnote/front-end:/usr/share/nginx/html \
-v /srv/mindnote-front-end/conf.d/default.conf:/etc/nginx/conf.d/default.conf \
--name mindnote-front-end \
--rm \
nginx
```

