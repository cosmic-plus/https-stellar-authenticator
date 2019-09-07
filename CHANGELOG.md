# Changelog

All notable changes to this project will be documented in this file.

## 1.2.0 - 2019-09-07

### Changed

- API: Upgrade [cosmic-lib] to 2.x. (protocol changes)

### Fixed

- Meta: Fix a rare application upgrade bug. Bypass browser cache when fetching
  latest release to prevent possible unconsistent upgrade.

## 1.1.1 - 2019-09-02

### Fixed

- Api: Update [cosmic-lib] to 1.8.1. (fix regression)

## 1.1.0 - 2019-08-31

### Changed

- Security: strengthen Content-Security-Policy. `form-action 'none'` has been
  added.
- Api: Update [cosmic-lib] to 1.8.0.

## 1.0.1 - 2019-08-11

### Fixed

- Fix application loading.

## 1.0.0 - 2019-08-10

**Note:** This major release doesn't contain any breaking change. The version
bump only means that this software is public and stable.

### Added

- Add SEP-0007 `pay` support.

## 0.14.2 - 2019-07-27

### Changed

- Improve display on smallest and biggest screens.
- Automate release procedure.

## 0.14.1 - 2019-06-18

### Changed

- Update [cosmic-lib] to 1.5.1. (Security fix)
- Automatically reload the application once an update get installed.

## 0.14.0 - 2019-06-08

### Changed

- Update [cosmic-lib] to 1.5.0. (Protocol 11 support)

## 0.13.14 - 2019-05-17

### Changed

- Update [cosmic-lib] to 1.4.1.
- Improve compliance with the [PWA] standard.
- Improve loading time.

## 0.13.13 - 2019-04-19

### Changed

- Update [cosmic-lib] to 1.3.0.

## 0.13.12 - 2019-04-12

### Changed

- Update [cosmic-lib] to 1.2.10.

## 0.13.11 - 2019-03-18

### Changed

- Update footer with new Cosmic.Plus links.

## 0.13.10 - 2019-03-14

### Fixed

- Make application installable again.

## 0.13.9 - 2019-03-04

### Changed

- Updating [stellar-sdk] 0.14.0.
- Improve application caching.

## 0.13.8 - 2019-02-14

### Added

- Support for framed display.

### Fixed

- Loading box display.

## 0.13.7 - 2019-02-06

### Changed

- Updating [stellar-sdk] to 0.13.0.

## 0.13.6 - 2019-02-01

### Changed

- Updating [stellar-sdk] to 0.12.0.

## 0.13.5 - 2019-01-18

### Added

- Anti-clickjacking protection.

### Changed

- Update known addresses aliases.

## Older Releases

There is no changelog for older releases. Please look take a look at the [commit
history](https://github.com/cosmic-plus/webapp-stellar-authenticator/commits/master).

[cosmic-lib]: https://github.com/cosmic-plus/node-cosmic-lib/blob/master/CHANGELOG.md
[stellar-sdk]: https://github.com/stellar/js-stellar-sdk/blob/master/CHANGELOG.md
[pwa]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Introduction
