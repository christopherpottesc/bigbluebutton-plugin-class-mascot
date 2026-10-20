# Self-documenting Makefile
# Add ## after target name to document it
# Run 'make' or 'make help' to see all available targets

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: install-hooks
install-hooks: ## Install git hooks (run once after cloning)
	git config core.hooksPath .githooks
	@echo "✅ Git hooks installed."

.PHONY: lint
lint: ## Run linter, type-check and formatting check
	npm run lint
	npx tsc --noEmit -p .
	npx prettier --check 'src/**/*.{ts,tsx,css}' 'demo/**/*.{ts,tsx,css}'

.PHONY: format
format: ## Auto-format code
	npm run format

.PHONY: test
test: ## Run test suite (no automated tests yet)
	@echo "No automated tests yet. Check changes with 'make demo' and in a BBB room."

.PHONY: run
run: ## Serve the plugin on http://localhost:4701 (manifest, bundle and state relay)
	npm start

.PHONY: demo
demo: ## Run the plugin outside BBB on http://localhost:4702
	npm run demo

.PHONY: build
build: ## Build the production bundle into dist/
	npm run build-bundle
