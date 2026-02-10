# Copilot Instructions for RetroTxt

## Build, Test, and Lint Commands

- **Install dependencies:**
  - `task dep-install` (uses pnpm)
- **Build extension package:**
  - `task build` (for Chrome/Edge submission package)
- **Update dependencies:**
  - `task dep-update` or `pnpm update`
- **Lint JavaScript:**
  - `task lint` (lints files in `ext/scripts/` and `ext/scripts/sw/`)
- **Run tests:**
  - QUnit tests are in `ext/test/` and require a browser or QUnit runner. Open the test HTML or use a compatible runner to execute a single test file (e.g., `tests-retrotxt.js`).
- **Build documentation:**
  - `task docs-build` (uses mkdocs)

## High-Level Architecture

- **RetroTxt** is a browser extension that converts ANSI, ASCII, and NFO text files into styled HTML for modern browsers.
- The extension is built with modern service workers for efficiency and low resource usage.
- Source code is organized under `ext/`:
  - `ext/scripts/` contains main extension logic and service worker scripts.
  - `ext/test/` contains QUnit-based test suites for core classes and features.
  - `fonts/` contains a large collection of legacy computer fonts (see font licenses before redistribution).
- Documentation is maintained in the `docs/` directory and built with MkDocs.
- The build and dependency workflow is managed by [Task](https://taskfile.dev/) and [pnpm](https://pnpm.io/).

## Key Conventions

- **Testing:**
  - QUnit is used for all unit tests. Test files are named `tests-*.js` and follow the pattern `QUnit.module()` and `QUnit.test()`.
  - Tests are designed to be run in a browser environment; some features may not work in Node.js.
- **Linting:**
  - ESLint is configured for files in `ext/scripts/` and `ext/scripts/sw/`.
- **Fonts:**
  - Each font in `fonts/` may have its own license. Always check before redistributing.
- **Service Workers:**
  - The extension uses Manifest V3 and service workers for background tasks.
- **Browser Support:**
  - Chrome and Edge are fully supported. Firefox support is paused until service worker compatibility is restored.
- **Dependencies:**
  - All dependencies are managed via `pnpm` and copied into the extension as needed by Task commands.

## References
- [Main documentation](https://docs.retrotxt.com)
- [Source code build tips](https://docs.retrotxt.com/source_code)
- [Font licenses](../fonts/)

---

If you need to run a single test, open the corresponding QUnit test file in a browser or use a QUnit-compatible runner.
