# Repository Guidelines

## Project Structure & Module Organization

This repository is currently an empty Git workspace: no application code, tests, assets, or dependency manifests have been committed. Establish the layout when introducing the first implementation, and document it in `README.md`.

For a new application, prefer `src/` for source modules, `tests/` for automated tests, and `assets/` for static resources when these directories suit the chosen framework. Organize modules by feature and keep related files together. The existing `.agents/`, `.codex/`, and `.aws/` directories are reserved for local tooling and configuration; do not use them for application code.

## Build, Test, and Development Commands

No build, test, lint, or development commands are configured yet. When selecting the toolchain, add reproducible commands to its manifest or build file and explain them in `README.md`, including required runtime versions and setup steps.

Provide separate commands for local development, production builds, automated tests, and formatting or linting. Do not document commands such as `npm test` until the corresponding scripts exist.

## Coding Style & Naming Conventions

Follow the selected language's standard conventions. Configure a formatter and linter early, and use their settings consistently. Use descriptive names, avoid unexplained abbreviations, and match file naming to the surrounding modules. Keep changes focused; avoid unrelated formatting edits.

## Testing Guidelines

No testing framework or coverage threshold exists yet. Introduce tests alongside behavior changes, covering normal operation, edge cases, and failure paths. Use descriptive test names and the chosen framework's discovery conventions. Document how to run the full suite before requiring it for contributions.

## Commit & Pull Request Guidelines

There is no commit history to establish an existing message convention. Use short, imperative subjects, such as `Add project setup documentation`, and keep each commit focused on one change.

Pull requests should explain the change, its purpose, and validation performed. Link relevant issues and include screenshots for visible interface changes. State explicitly when tests could not be run.

## Security & Configuration

Never commit credentials, tokens, or private configuration. Add appropriate ignore rules and provide sanitized configuration examples when introducing external services.
