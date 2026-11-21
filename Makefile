all: up

up:
	docker compose up -d --build

down:
	docker compose down

re: down
	$(MAKE) up

build:
	docker compose build

logs:
	docker compose logs -f

clean:
	docker compose down -v --rmi local