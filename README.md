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

db schema
```
CREATE TABLE public."user"
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(512) COLLATE pg_catalog."default" NOT NULL,
    username character varying(128) COLLATE pg_catalog."default",
    hashpwd character varying(128) COLLATE pg_catalog."default",
    birthday timestamp(6) with time zone,
    vocation character varying(64) COLLATE pg_catalog."default",
    gender character(1) COLLATE pg_catalog."default",
    created_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    salt character varying(32) COLLATE pg_catalog."default",
    latest_login_ip character varying(45) COLLATE pg_catalog."default",
    provider character varying(16) COLLATE pg_catalog."default",
    sub character varying(128) COLLATE pg_catalog."default",
    full_name character varying(64) COLLATE pg_catalog."default",
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT email UNIQUE (email)
,
    CONSTRAINT social_account UNIQUE (sub, provider)

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."user"
    OWNER to webservice;

CREATE TABLE public.board
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying(128) COLLATE pg_catalog."default",
    created_at timestamp(6) with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp(6) with time zone,
    owner_id integer,
    is_public boolean NOT NULL DEFAULT true,
    uniquename character varying(256) COLLATE pg_catalog."default",
    CONSTRAINT boardpkey PRIMARY KEY (id),
    CONSTRAINT uniquename UNIQUE (uniquename)

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.board
    OWNER to webservice;

CREATE TABLE public.node
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying(512) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    link character varying(512) COLLATE pg_catalog."default",
    created_at timestamp(6) with time zone DEFAULT now(),
    deleted_at timestamp(6) with time zone,
    owner_id integer,
    board_id integer,
    CONSTRAINT id PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node
    OWNER to webservice;

CREATE INDEX node_board_id
    ON public.node USING btree
    (board_id)
    TABLESPACE pg_default;

CREATE INDEX node_owner
    ON public.node USING btree
    (owner_id)
    TABLESPACE pg_default;

CREATE TABLE public.node_relationship
(
    parent_node_id integer NOT NULL,
    child_node_id integer NOT NULL,
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT node_relationship_pkey PRIMARY KEY (id),
    CONSTRAINT relationship_key UNIQUE (parent_node_id, child_node_id)

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.node_relationship
    OWNER to webservice;
```