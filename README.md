# ChichiNg

This file has notes for development. To use the library see [./projects/chichi-ng/README.md](./projects/chichi-ng/README.md) 

The gh pages project site https://rreganjr.github.io/chichi-ng/

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

```bash
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

```bash
node ➜ /workspaces/chichi-ng (master) $ git tag -a -m "test build-release action" v2.0.0-test
node ➜ /workspaces/chichi-ng (master) $ git push origin v2.0.0-test
```

# Angular Components default to "display: inline"

I found [this stackoverflow query](https://stackoverflow.com/questions/51032328/angular-component-default-style-css-display-block) answered
by [rryter](https://stackoverflow.com/users/1219080/rryter) a change in Angular v9.1 detailed in [blog entry](https://blog.rryter.ch/2020/01/19/angular-cli-generating-block-components-by-default/)

I updated angular.json to add "displayBlock": true for future components in the library and demo

```json
"@schematics/angular:component": {
    ...
    "displayBlock": true
}
```
and manually added "display: block" to the existing library components scss files.
```css
:host {
    display: block
}
```

# Fixing Bypass Panel laout

When I looked at the demo page I saw that the size of the panel always fills the width of the page and created [an issue](https://github.com/rreganjr/chichi-ng/issues/32). I was also explicitly setting the height in the bypass panel to a fixed 480px, which isn't good.

I changed the bypass-panel .container to use "display: flex" and changed the panels to not have absolute position. I also removed the height on the .container so
the height will grow to match the supplied content.

In the demo app component I styled the sign-up-or-in component to be 50% and centered left and right.

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

# deploying the demo under the project gh pages

see https://github.com/rreganjr/chichi-ng/settings/pages
Under source set Branch: master and /docs folder

```
ng build demo --configuration production --outputPath=docs/demo/ --baseHref=/chichi-ng/demo/
cp docs/demo/index.html docs/demo/404.html
```

# Testing Library Components

The test turning-glob-component.spec.ts was failing with the error:
```
Error: Unexpected synthetic listener @spin.done found. Please make sure that:
  - Either `BrowserAnimationsModule` or `NoopAnimationsModule` are imported in your application.
  - There is corresponding configuration for the animation named `@spin.done` defined in the `animations` field of the `@Component` decorator (see https://angular.io/api/core/Component#animations).
```

Because this is a library I don't want to include angular references and use `peerDependencies` in the package.json for 
angular dependencies that will be included by the user of the library. To get the test to work I added the `BrowserAnimationsModule`
to the `imports` of `TestBed.configureTestingModule()`

```
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule
      ],
      declarations: [ TurningGlobeComponent ]
    })
    .compileComponents();
  }));
```

## Testing Scheduler Component

The scheduler components have inputs and use the VisualSchedulerService, so extra configuration is needed.

Error:
```
NullInjectorError: R3InjectorError(DynamicTestModule)[VisualSchedulerService -> VisualSchedulerService]:
  NullInjectorError: No provider for VisualSchedulerService!
```

Any component that uses the scheduler must have it added to the testing modules as a provider:
```
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaItemComponent],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });
```
also make sure the service is imported by path and not the chichi-ng
```
import { VisualSchedulerService } from '../../../visual-scheduler.service';
```
see https://stackoverflow.com/questions/54772990/karma-unit-testing-error-unexpected-value-imported-by-the-module-please-add-a

Inputs need to be set on the component:
```
beforeEach(() => {
    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    component.resourceName = 'resource-name';
    component.channelName = 'channel-name';
    fixture.detectChanges();
  });
```
see https://stackoverflow.com/questions/36654834/angular2-unit-test-with-input


# The Visual Scheduler Component

The visual scheduler will have its own module in the chchi-ng library

```
ng g module visual-scheduler --project=chichi-ng
ng g component visual-scheduler --project=chichi-ng
ng g component visual-scheduler/timescale --project=chichi-ng
ng g class visual-scheduler/timescale --type=model --project=chichi-ng
ng g component visual-scheduler/timeline --project=chichi-ng
ng g component visual-scheduler/resource --project=chichi-ng
ng g component visual-scheduler/resource/agenda-box --project=chichi-ng
ng g component visual-scheduler/resource/agenda-box/channel --project=chichi-ng
ng g component visual-scheduler/resource/agenda-box/timeline --project=chichi-ng
ng g component visual-scheduler/resource/agenda-box/agenda-item --project=chichi-ng
ng g component visual-scheduler/resource/agenda-box/drop-zone --project=chichi-ng
ng g class visual-scheduler/resource/agenda-box/agenda-item --type=model --project=chichi-ng

ng g component visual-scheduler/toolbox --project=chichi-ng
ng g component visual-scheduler/toolbox/tool --project=chichi-ng
ng g class visual-scheduler/toolbox/tool/tool-event --type=model --project=chichi-ng
ng g service visual-scheduler/visual-scheduler --project=chichi-ng

ng g class visual-scheduler/timescale-not-set-error --type=error --project=chichi-ng
ng g class visual-scheduler/agenda-item-out-of-bounds --type=error --project=chichi-ng
ng g class visual-scheduler/agenda-item-conflicts --type=error --project=chichi-ng

npm install ngx-drag-drop --save

npm install luxon --save
npm install @types/luxon --save-dev

```

# The Visual Scheduler in the Demo

```
ng g component event-scheduler --project=demo
ng g component event-scheduler/modal --project=demo
ng g component event-scheduler/item-editor --project=demo

```

# Interactive Development of Library and Demo

```
ng build chichi-ng --watch
ng serve demo
```
# Service Providers

I want each visual scheduler to use its own visual scheduler service so that if there is more than one on a page they don't mess up each other. In the VisualSchedulerService I set @Injectable(providedIn: null) so there isn't a default at the root level. I didn't add it to the VisualSchedulerModule as a provider so that there wouldn't be one for all VisualScheduler components. In VisualSchedulerComponent I added it to the providers. I mistakenly added it to the TimescaleComponent and TimelineComponent which made it so that when I zoomed in or out in the timescale the timeline didn't get updated. Watching https://www.youtube.com/watch?v=XpfxmHM6E4E set me straight.

# Testing
The Karma Test Explorer (for Angular, Jasmine, and Mocha) [plugin: lucono.karma-test-explorer] makes it easy to run
angular jasmine tests in the Test Explorer [plugin: hbenl.vscode-test-explorer] and see the status. It shows which
tests pass in the test code and detects changes and reruns tests.

## Code Coverage for Tests
The generate a code coverage report run this
```
ng test chichi-ng --no-watch --code-coverage
```
the results are rendered as html in ./coverage/chichi-ng

the trick is viewing the report inside the devcontainer. I added the Live Server [plugin: ritwickdey.liveserver]
to serve up the files from the devcontainer to the host. right click on the ./coverage/chichi-ng/index.html page
and select "Open with Live Server".

NOTE: rerun this after changing the tests.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.3.
