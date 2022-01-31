# Building tips

!!! tip

    [The build tasks do not run on PowerShell](https://github.com/go-task/task/issues/319), instead Windows users should use [WSL](https://docs.microsoft.com/en-us/windows/wsl/).

## Initialize

```bash title="Clone the repository"
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

```bash
yarn outdated
yarn upgrade-interactive --latest
```

## Update version stamp

!!! error

    This information is out of date

```bash
edit Taskfile.yml
```

```yml
vars:
  VERSION: "0.0.0"
```

```sh
# apply VERSION stamp to the manifest and package json files.
task version-set

# or set the VERSION and then submit to GitHub
task commit
```

## Browser addon stores

``` title="Complete builds location"
RetroTxt/web-ext-artifacts/
```

+ [Chrome developer dashboard](https://chrome.google.com/webstore/devconsole/g00502785627994558074?hl=en_GB) for the Chrome Web Store
+ [Microsoft Edge Developer](https://developer.microsoft.com/en-us/microsoft-edge/extensions) for Microsoft Edge Add-ons
+ [Firefox Add-on developer hub](https://addons.mozilla.org/en-US/developers/addons) for Firefox Add-ons
