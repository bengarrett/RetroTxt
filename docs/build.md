# Building RetroTxt

!!! note "Windows"

      [Tasks do not run on PowerShell](https://github.com/go-task/task/issues/319), Windows users should use Windows Subsystem for Linux.

### Clone, initialize and branch the repo

```sh
gh repo clone bengarrett/RetroTxt
cd RetroTxt
task init
```

```sh
# Create a dev branch
git checkout -b dev
```

```sh
# Create a pull request to merge the dev branch into main
gh pr create
gh pr status
gh pr merge
```

### Package dependencies to newer versions

```sh
yarn outdated
yarn upgrade-interactive --latest
```

### Update VERSION stamp

```sh
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

## Store submissions

```title="Build artifacts location"
RetroTxt/web-ext-artifacts/
```

#### [Chrome developer dashboard](https://chrome.google.com/webstore/devconsole/g00502785627994558074?hl=en_GB)

#### [Firefox Add-on developer hub](https://addons.mozilla.org/en-US/developers/addons)

#### [Microsoft Edge Developer](https://developer.microsoft.com/en-us/microsoft-edge/extensions)
