# Contributing to Strator

Thank you for your interest in contributing to Strator! We welcome contributions that help improve performance, reliability, developer ergonomics, and documentation.

This guide provides everything you need to set up your environment, follow our development workflows, and submit pull requests efficiently.

---

## Prerequisites & Toolchain

Strator is managed as a `pnpm` workspace powered by **Vite+ (`vp`)**, a unified toolchain integrating Vite, Vitest, Rolldown, tsdown, Oxlint, and Oxfmt.

- **Node.js**: `>= 22.12.0` (Node 24 recommended)
- **Vite+ (`vp`)**: Installed globally or invoked via package scripts.
- **pnpm**: `10.33.0` (configured via `packageManager`)

To inspect tool versions in your active Vite+ release:

```bash
vp toolchain
```

---

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/strator-dev/strator.git
   cd strator
   ```

2. **Install dependencies**:

   ```bash
   vp install
   ```

3. **Verify your local environment**:
   ```bash
   vp env doctor
   ```

---

## Monorepo Structure

- **`packages/core`**: Core Strator state management library and primitives (`@strator/core`).
- **`packages/react`**: React hooks and bindings (`@strator/react`).
- **`apps/website`**: Documentation and marketing website built with Next.js (`website`).
- **`examples/react`**: Example showcase application demonstrating Strator usage (`@strator-examples/react`).

---

## Local Development & Validation Workflow

Vite+ commands are used across the repository for all validation and development tasks:

| Command                               | Description                                                                   |
| :------------------------------------ | :---------------------------------------------------------------------------- |
| `vp check`                            | Formats, lints (Oxlint), and type-checks all workspace files.                 |
| `vp check --fix`                      | Automatically fixes auto-fixable formatting and lint issues.                  |
| `vp test`                             | Runs all unit and SSR test suites across packages.                            |
| `pnpm run ready`                      | Runs the full verification pipeline (`vp fmt`, `vp lint`, tests, and builds). |
| `vp run website#dev` / `pnpm run dev` | Starts the documentation website development server.                          |
| `pnpm --filter "@strator/*" build`    | Compiles core and react packages into `dist/`.                                |

---

## Branching & Commit Conventions

### Branch Naming

Create focused branches named after the change type and scope:

- `feat/feature-name`
- `fix/issue-description`
- `docs/topic-name`
- `refactor/subsystem-name`

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add useStoreSelector hook`
- `fix: resolve hydration mismatch during SSR`
- `docs: update reactive binding examples`
- `refactor: optimize store subscription listener dispatch`
- `chore: update dependencies`

---

## Pull Request Lifecycle

### 1. Feature Contribution Requirements

To maximize overall reliability, minimize collective maintenance overhead, and deliver the greatest utility to users and developers, every feature contribution must satisfy three core requirements:

- **Full Feature Implementation**: Deliver a complete, robust, and end-to-end implementation. Partial implementations or placeholder stubs create downstream friction and are not accepted.
- **Comprehensive Test Coverage**: Accompany all new features with thorough unit and SSR/integration tests executed via `vp test` to guarantee correctness and prevent future regressions.
- **Website & Documentation Synchronization**: When introducing or modifying any APIs, behaviors, or architectural concepts showcased on the documentation website (`apps/website`), update the relevant website content, examples, and components within the same pull request so user-facing resources remain accurate.

### 2. Pre-Submission Self-Check

Before opening a pull request, run the complete verification suite locally:

```bash
pnpm run ready
```

Ensure all workspace files pass `vp check` and all unit/SSR tests pass cleanly.

### 3. Submitting the Pull Request

- Target the `main` branch.
- Complete all sections in the pull request template (`.github/pull_request_template.md`), including summary, linked issues, change classification, and the self-verification checklist.
- Clearly describe any breaking changes and migration steps if applicable.

### 4. Automated CI Validation

Every pull request triggers the automated PR review workflow:

- **`lint-and-types`**: Validates formatting, oxlint rules, and TypeScript types with `vp check`.
- **`test-suite`**: Executes all package test suites with `vp test`.
- **`build-all`**: Validates production compilation across all packages, the documentation website, and example applications.
- **`pr-status-gate`**: Aggregates all checks into a single required status gate for branch protection.

_Note: Pushing new commits to an open PR automatically cancels outdated CI runs to conserve compute resources._

### 5. Code Review Standards

Pull requests are reviewed by designated code owners (`.github/CODEOWNERS`) according to the following criteria:

- **Type Safety**: Strict TypeScript compliance without `any` escapes.
- **SSR Safety**: Safe execution in both browser and server (SSR/hydration) environments.
- **Test Coverage**: Comprehensive unit tests covering core behavior, edge cases, and regression prevention.
- **Performance & Footprint**: Minimal runtime overhead and zero unnecessary bundle size inflation.

Once all CI checks pass and required maintainer reviews are approved, the PR will be merged into `main`.
