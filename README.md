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
            "TapPayPartnerKey": "${Third-Party Transaction Private Key}",
            "GCSCredential": "${Google Cloud Storage Credential JSON Private Key}"
        }
    }
}
```

### run docker container
```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v /srv/mindnote-api:/app/volume \
--name mindnote-api-server \
-p 8081:8081 mindnote-api-server
```


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

