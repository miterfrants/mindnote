Launch postgres Docker Container
```
docker run -d \
--rm \
--network pgnetwork \
-p 5432:5432 \
--name postgres \
--env-file ~/project/mindnote/db/pg-env.list \
-v ~/project/mindnote/db/pg-volume:/var/lib/postgresql/data \
postgres
```

Launch pgAdmin Docker Container
```
docker run -d \
--rm \
--network pgnetwork \
-p 5050:5050 \
--name pgadmin \
--env-file ~/project/mindnote/db/pgadmin-env.list \
-v ~/project/mindnote/db/pgadmin-volume:/var/lib/pgadmin \
dpage/pgadmin4
```