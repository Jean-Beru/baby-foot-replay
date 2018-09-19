.DEFAULT_GOAL := help
.PHONY: install start stop

DC=docker-compose

install:
	$(DC) run --rm web yarn install

start:
	$(DC) up -d --remove-orphan

stop:
	$(DC) kill
