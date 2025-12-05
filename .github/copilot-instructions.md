# Copilot Custom Instructions

## Terminal & Command Execution Behavior

1.  **Smart Directory Navigation (Fix `cd` errors)**:
    - **ALWAYS check the `Cwd` (Current Working Directory)** provided in the `<context>` block before generating any `cd` command.
    - **Do NOT** blindly issue `cd apps/api` or similar commands if the `Cwd` indicates you are already in that directory.
    - If you need to run a command in a specific folder, prefer chaining it (e.g., `cd apps/api; npm run test`) ONLY IF you are not already there.
    - If the `cd` command fails, stop and re-evaluate the path structure using `list_dir` before trying again.

2.  **Prevent Redundant Command Execution**:
    - **NEVER** execute the same command twice in a row (e.g., running `npm run test` immediately after `npm run test`) unless explicitly requested by the user to retry.
    - Before running a command, check the conversation history and the "Last Command" field in the context. If the previous action was the same command, analyze its output instead of re-running it.
    - For background services (like `npm run start`), ensure the service is not already running to avoid port conflicts.

3.  **Project Architecture & Tooling (Turbo & PNPM)**:
    - **Monorepo Awareness**: This is a PNPM workspace using Turbo.
    - **Package Manager**: **ALWAYS** use `pnpm` instead of `npm` or `yarn`.
    - **Task Execution**:
      - Prefer running commands from the root using `turbo` or `pnpm --filter`.
      - **Example**: Instead of `cd apps/api; npm run test`, use `turbo run test --filter=@chefos/api` or `pnpm --filter @chefos/api test`.
      - If you must run a command inside a specific directory, use `pnpm run <command>`.

## General

- Use Chinese for all responses.

## General

- Use Chinese for all responses.
