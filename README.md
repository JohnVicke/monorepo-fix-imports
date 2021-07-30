# Monorepo auto import

## Description

mono-repo-auto-import is an extension for people working in mono-repos that don't feel like manually fixing their imports every time vscode has added added a relative import instead of a package import.

## Prerequestis

Monorepo auto import depends on:
[eslint-plugin-monorepo](https://www.npmjs.com/package/eslint-plugin-monorepo)

## How to use:

### **1. Open command pallete**

### Windows/Linux:

    ctrl + shift + p

### Mac:

    command + shift + p

### **2. Search for extension**

    fix monorepo imports

## Extension Settings

...

### Expermintal features

`mono-repo-import.fixOnSave: boolean` | turn on/off automatic fix on save .

## Known Issues

Prettier re-organizes imports on save which can cause strange side-effects (mono-repo-import will fix the wrong line-number)

## Release Notes

### 1.0.0

- Initial release of monorepo-auto-import

### 1.0.1

- Update documentation
- Rename `format monorepo imports` to `fix monorepo imports`

### 1.0.2

- Add icon
