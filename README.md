# ChichiNg

This file has notes for development. To use the library see [./projects/chichi-ng/README.md](./projects/chichi-ng/README.md) 

# Dev Notes

## Using the devcontainer

This project is setup to develop in a devcontainer such that the environment to run and debug is defined in the project. As long as you have VS Code and Docker Desktop installed.

see https://code.visualstudio.com/docs/remote/containers for requirements and setup.

### In VS Code

F1 > Remote-Containers: Clone Repository in Container Volume

*Provide repository URL or pick a repository source.*

Clone a repository from GitHub in a Container Volume

*Repository name (type to search)*

rreganjr/chichi-ng

*branch*

master

### Rebuilding

If you make changes to the devcontainer.json or Dockerfile you need to rebuild the container via 

F1 > Remote-Containers: Rebuild Container without Cache

## Running

This is a library don't run it.

## Deploy by hand

From https://jasonwatmore.com/post/2020/06/16/angular-npm-how-to-publish-an-angular-component-to-npm

```
ng build chichi-ng --prod
cd dist/chichi-ng
npm login
npm publish
```

then look at https://www.npmjs.com/package/chichi-ng

## Building a Release with build-release github action

The action defined in https://github.com/rreganjr/chichi-ng/blob/master/.github/workflows/build-release.yml
is triggered by a push of a tag in the form v*, for example v2.0.0. In the vs code devcontainer open a terminal
and create a tag, then push it. See the action results at https://github.com/rreganjr/chichi-ng/actions/workflows/build-release.yml

```
node ➜ /workspaces/chichi-ng (master) $ git tag -a -m "test build-release action" v2.0.0-test
node ➜ /workspaces/chichi-ng (master) $ git push origin v2.0.0-test
```

# Fubar Fix

Updating from 8.1.1 wasn't working so I created a new project with angular 13 and then pushed it to the repo as branch angular13.

```
git push origin angular13 -f
```

I took master and created branch angular8 for posterity.

I then did this to replace master with the angular13 branch based on [this](https://stackoverflow.com/questions/2862590/how-to-replace-master-branch-in-git-entirely-from-another-branch)

```bash
git merge --allow-unrelated-histories -s ours origin/master
git checkout master
git merge angular13
```

# clean up global angular
```bash
npm uninstall -g @angular/cli
npm cache verify
npm install -g @angular/cli@latest
```

# create monorepo project workspace
```bash
ng new chichi-ng --create-application false
cd chichi-ng
```

# create the library
```bash
ng generate library chichi-ng --prefix cc
```

# add the components to the library
```bash
ng generate component bypass-panel --project=chichi-ng
ng generate component turning-globe --project=chichi-ng
ng generate component visual-scheduler  --project=chichi-ng
```

# The Demo

In the project root I ran

```
ng generate application demo --prefix demo --style scss
```

I added a signup component that uses the slider

```
ng g component SignUpOrIn --project demo --selector sign-up-or-in 
```

I added the spinning globe component to a header on the app page



This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.3.
