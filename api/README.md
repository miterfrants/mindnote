Docker Run
```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v /usr/share/mindnote/api/secrets.json:/app/secrets.json \
--name mindnote-api-server \
-p 8081:8081 \
mindnote-api-server
```