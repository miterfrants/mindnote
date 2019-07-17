# Architecture

## Overview

## API Server .NET Core Web API App

## Front-End Site Vanilla JS

## Chrome Extension Vanilla JS

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
-v /srv/mindnote:/app/volume \
--name mindnote-api-server \
-p 8081:8081 mindnote-api-server
```