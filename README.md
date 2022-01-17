# ChichiNg

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
