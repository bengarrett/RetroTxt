---
title: Source code building tips
authors:
    - Ben Garrett
date: 2022-08-30
---

## Initialize

Clone the repository.

=== "git"
    ```bash
    git clone https://github.com/bengarrett/RetroTxt.git
    ```

=== "gh"
     ```bash
     gh repo clone bengarrett/RetroTxt
     ```


```bash title="Initialize the build"
cd RetroTxt
task init
```

## Branching and pull request

```bash title="Create a new branch named dev"
git checkout -b dev
```

```bash title="Create a pull request to merge the dev branch into main"
gh pr create
gh pr status
gh pr merge
```

## Update packages

Use [pnpm update](https://pnpm.io/cli/update).

```bash
pnpm update --interactive
pnpm update --latest
pnpm update --prod
pnpm update --dev
```

Use [Task](https://taskfile.dev/) to update the RetroTxt dependencies.

```bash
task dep-update
```

## Browser addon stores

``` title="Location of builds"
RetroTxt/web-ext-artifacts/
```

---

+ [Chrome developer dashboard](https://chrome.google.com/webstore/devconsole/g00502785627994558074?hl=en_GB) for the Chrome Web Store
+ [Microsoft Edge Developer](https://developer.microsoft.com/en-us/microsoft-edge/extensions) for Microsoft Edge Add-ons
+ [Firefox Add-on developer hub](https://addons.mozilla.org/en-US/developers/addons) for Firefox Add-ons
