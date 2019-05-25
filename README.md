# How to launch

```
docker run \
-e ASPNETCORE_URLS=http://\*:8081 \
--network pgnetwork \
-d \
--rm \
-v ${your secrets.json folder}:/app/volume \
--name mindmap-api-server \
-p 8081:8081 mindmap-api-server
```