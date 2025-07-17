# INCLUDES #
include .env

# COLOURS #

GREEN = \033[1;32m
COLOR_OFF = \033[0m

# RULES #

all: build

volumes:
	@echo "$(GREEN)<-> CREATING VOLUMES <-> $(COLOR_OFF)"
	@mkdir -p $(DATA_PATH)
	@mkdir -p $(POSTGRESQL_VOLUME_PATH)
	@mkdir -p $(UPLOADS_PATH)
	@mkdir -p $(UPLOADS_PATH)/users

build: volumes
	@echo "$(GREEN)<-> BUILDING CONTAINERS <-> $(COLOR_OFF)"
	@docker compose -f $(DOCKER_COMPOSE) up -d

postgresql: volumes
	@echo "$(GREEN)<-> BUILDING POSTGRESQL CONTAINER <-> $(COLOR_OFF)"
	@docker compose up POSTGRESQL

frontend: volumes
	@echo "$(GREEN)<-> BUILDING FRONTEND CONTAINER <-> $(COLOR_OFF)"
	@docker compose up frontend

backend: volumes
	@echo "$(GREEN)<-> BUILDING BACKEND CONTAINER <-> $(COLOR_OFF)"
	@docker compose up backend

test-backend: 
	@cd ./Backend && npm run test

test-frontend: 
	@cd ./Frontend && npm run test

restart: down
	@echo "$(GREEN)<-> STARTING CONTAINERS <-> $(COLOR_OFF)"
	@docker compose -f $(DOCKER_COMPOSE) up -d

stop:
	@echo "$(GREEN)<-> STOPPING CONTAINERS <-> $(COLOR_OFF)"
	@docker compose -f $(DOCKER_COMPOSE) stop

down: stop
	@echo "$(GREEN)<-> DELETING BUILD <-> $(COLOR_OFF)"
	@docker compose -f $(DOCKER_COMPOSE) down -v
	
remove_data:
	@echo "$(GREEN)<-> REMOVING DATA <-> $(COLOR_OFF)"
	@rm -rf $(DATA_PATH)
	@rm -rf $(UPLOADS_PATH)

fclean: down remove_data
	@echo "$(GREEN)<-> REMOVING ALL IMAGES <-> $(COLOR_OFF)"
	@rm -rf $(BACKEND_NODE_MODULES) $(BACKEND_PACKAGE_LOCK)
	@rm -rf $(FRONTEND_NODE_MODULES) $(FRONTEND_PACKAGE_LOCK)
	@docker system prune -af

re: fclean build
	@echo "$(GREEN)<-> RESETTING CONTAINERS <-> $(COLOR_OFF)"

.PHONY: all build up stop remove_data down fclean restart volumes re
