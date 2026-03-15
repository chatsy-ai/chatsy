# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Changelog Categories

- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

---
## [2.0.7] - 2026-03-14
### Changed
- Replaced custom esbuild `build.js` with `prepare-package` build system
- Build config now lives in `package.json` under `preparePackage` key
- Iframe URL construction uses `new URL()` instead of string concatenation

### Added
- Widget version is now passed to the embed iframe via URL params and `chatsy:init` postMessage

### Removed
- Deleted `build.js` (replaced by `prepare-package`)
- Removed `esbuild` dev dependency

---
## [2.0.5] - 2026-03-11
### Added
- Notification badge on chat button with spring entrance animation
- Periodic pop animation every 10s to draw user attention
- Badge auto-dismisses with scale-out animation when chat is opened

---
## [2.0.4] - 2026-03-11
### BREAKING
- Replaced `endUserId` option with rich `user` object (`id`, `firstName`, `lastName`, `email`, `photoURL`, plus arbitrary fields)
- Removed `data-end-user-id` and `data-api-url` script tag attributes from CDN auto-init
- Renamed `apiUrl` option to `_embedUrl` (internal/private)

### Added
- `user` option for passing user identity (id, name, email, photo, custom fields)
- `context` option for page metadata and tags
- `setUser()` method for updating user identity after initialization (e.g., post-login)
- Auto-collection of `page.url`, `page.referrer`, `page.title` into context
- Handle `chatsy:close` postMessage from embed (allows embed to request widget close)
- `API_URL` constant extracted as single source of truth

### Changed
- `chatsy:init` payload now sends `user` and `context` instead of `endUserId`
- Origin validation and iframe URL use `API_URL` constant with `_embedUrl` override
- README updated with new user/context configuration and `setUser()` documentation

---
## [2.0.0] - 2024-06-19
### Added
- Initial release of the project 🚀
