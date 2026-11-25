# ft_transcendence

### Temporary:

Populate DB with :

```docker exec -i database-sql sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < srcs/back-end/postgresql/seed/test_data.sql```

