# Building RetroTxt

Please note: [Tasks do not run on Powershell](https://github.com/go-task/task/issues/319), Windows users should use WSL.

### Clone and initialize the repo

```sh
gh repo clone bengarrett/RetroTxt
cd RetroTxt
task init
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

### Submit RetroTxt daily with version stamp

```sh
task publish-private
```

### Build for public Github

```sh
task publish
```

### Commit to public Github

```sh
task publish-public
```

## Store submissions

### Build artifacts location `/retrotxt-daily/web-ext-artifacts/`

### [Chrome developer dashboard](https://chrome.google.com/webstore/devconsole/g00502785627994558074?hl=en_GB)

### [Firefox Add-on developer hub](https://addons.mozilla.org/en-US/developers/addons)

### [Microsoft Edge Developer](https://developer.microsoft.com/en-us/microsoft-edge/extensions)
