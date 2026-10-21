# Contributing to Tempest Isles

Thanks for wanting to help. Tempest Isles is a free, open-source hobby project by Driftwood Games, a
solo developer, so replies can take a while.

## Ways to help

- **Report a bug** or **suggest a change**: open an issue using one of the templates.
- **Remember a rule differently from the original?** Open a *Rule correction* issue, ideally quoting
  the original manual.
- **Fix or improve something**: fork the repo, make your change and open a pull request. Small, focused
  pull requests are easiest to review.
- **Make your own version**: you don't need permission. See [MODDING.md](MODDING.md). To have it
  featured on the [community page](https://driftwood-games.onrender.com/community.html), email the link
  to driftwoodgames@proton.me.

## Before opening a pull request

```sh
npm ci
npm run build      # typecheck + bundle
npm run validate   # map integrity
npm run sim -- 50  # headless AI games; watch for "HIT TURN CAP"
```

CI runs the same checks on every pull request. A maintainer approves the first run for new
contributors.

## Ground rules

- Contributions are accepted under the project's [MIT License](LICENSE).
- Tempest Isles is an unofficial tribute. Never add art, sound, text or files from the original
  *Isle Wars Pro* or any other commercial game.
- Be kind. See the [Code of Conduct](CODE_OF_CONDUCT.md).
