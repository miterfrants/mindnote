# Launch api service

## Build a Docker Image
```
docker build -t mindmap
```

## Launch Docker container

```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v ${your secrets.json folder}:/app/volume \
--name mindmap-api-server \
-p 8081:8081 mindmap-api-server \
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
