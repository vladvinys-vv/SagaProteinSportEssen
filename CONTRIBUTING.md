# Contributing

## Commit message format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) so that
[Release Please](https://github.com/googleapis/release-please) can automatically create
release pull requests and changelogs.

### Types

| Type | Version bump | When to use |
|------|-------------|-------------|
| `feat:` | minor | New feature visible to users |
| `fix:` | patch | Bug fix |
| `perf:` | patch | Performance improvement |
| `refactor:` | — | Code change without feature or fix |
| `docs:` | — | Documentation only |
| `chore:` | — | Build / tooling / dependency update |
| `test:` | — | Adding or fixing tests |
| `BREAKING CHANGE:` (footer) | major | Breaking API change |

### Examples

```
feat: add protein cost badge to price table
fix: correct EUR/100g calculation for sub-100g packages
chore: upgrade vitest to 2.x
feat!: remove legacy REST endpoint  (! also bumps major)
```

### Scope (optional)

Add a scope in parentheses after the type to indicate the affected area:

```
feat(prices): show weekly discount percentage
fix(auth): prevent double-submit on login form
```

Only commits of type `feat`, `fix`, and `perf` appear in CHANGELOG and trigger version bumps.
