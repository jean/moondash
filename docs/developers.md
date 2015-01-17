# Developers documentation

## Generate a distribution

Regular distribution:
```bash
$ gulp --dist
```

Distribution containing ngMock:
```bash
$ gulp --dist --mock
```

## Running tests

```bash
$ gulp test
```

## Update ng-grid
`ng-grid` is not on NPM and its official repository does not contain the
distribution files.
That is why it has been forked in the MoonshotProject GitHub organization.
To update `ng-grid`, do the following:
```bash
$ git clone git@github.com:MoonshotProject/ng-grid.git
$ cd ng-grid
$ npm install
$ grunt install
$ grunt build
$ git push
```

And then, update `node_modules/ui-grid` in Moondash.
