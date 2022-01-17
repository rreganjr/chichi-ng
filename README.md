# ChichiNg

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

# Fubar Fix

Updating from 8.1.1 wasn't working so I created a new project with angular 13 and then pushed it to the repo as branch angular13.

```
git push origin angular13 -f
```

I took master and created branch angular8 for posterity.

I then did this to replace master with the angular13 branch based on [this](https://stackoverflow.com/questions/2862590/how-to-replace-master-branch-in-git-entirely-from-another-branch)

```
git merge --allow-unrelated-histories -s ours origin/master
git checkout master
git merge angular13
```

# clean up global angular
npm uninstall -g @angular/cli
npm cache verify
npm install -g @angular/cli@latest

# create monorepo project workspace
ng new chichi-ng --create-application false
cd chichi-ng

# create the library 
ng generate library chichi-ng --prefix cc
# add the components to the library
ng generate component bypass-panel --project=chichi-ng
ng generate component turning-globe --project=chichi-ng
ng generate component visual-scheduler  --project=chichi-ng


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.3.
