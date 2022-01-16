# ChichiNg Library

# Dev Notes

## Using the devcontainer

This project is setup to develop in a devcontainer such that the environment to run and debug is defined in the project. As long as you have VS Code and Docker Desktop installed.

see https://code.visualstudio.com/docs/remote/containers for requirements and setup.

### In VS Code

F1 > Remote-Containers: Clone Repository in Container Volume

*Provide repository URL or pick a repository source.*

Clone a repository from GitHub in a Container Volume

*Repository name (type to search)*

rreganjr/gol-ng

*branch*

master

### Rebuilding

If you make changes to the devcontainer.json or Dockerfile you need to rebuild the container via 

F1 > Remote-Containers: Rebuild Container without Cache

## Running

On the Run and Debug start the ng serve launch. this will run the npm start task and then open a chrome browser.

