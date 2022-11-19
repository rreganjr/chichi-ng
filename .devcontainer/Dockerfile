# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.6/containers/javascript-node/.devcontainer/base.Dockerfile
# set these in the devcontainer.json docker build task
ARG ANGULAR_CLI_VERSION=""
ARG VARIANT=""

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# install the latest angular CLI globally
RUN npm install -g @angular/cli@${ANGULAR_CLI_VERSION}

# For running tests in the container
# see https://itnext.io/angular-development-in-docker-with-dev-containers-49d2cabad445
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable

EXPOSE 4200
