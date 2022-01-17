# Chi Chi Ng

## Fancy pants UI components for Angular

[chichi - frilly or elaborate ornamentation](https://www.merriam-webster.com/dictionary/chichi)  

## Bypass Panel

Like a closet with bypass doors where a panel (door) can be slid back and forth to show content behind. The panels also have content and buttons for sliding them.

I didn't concieve of this design, I watched a [video](https://www.youtube.com/watch?v=mUdo6w87rh4) by Traversy Media that put this together based on the article [DOUBLE SLIDER - SIGN IN/UP FORM](https://www.florin-pop.com/blog/2019/03/double-slider-sign-in-up-form/) by Florin Pop who was inspired by the [Diprella Login](https://dribbble.com/shots/5311359-Diprella-Login) posted by Selecto on dribbble. I took the basic concept and created an Angular component that generalized the sliding panel.

![Slider Animation](https://github.com/rreganjr/chichi-ng/raw/master/projects/chichi-ng/assets/ccbypasspanel.gif)

[Gif by OnlineConverter.com](https://www.onlineconverter.com/mp4-to-gif)

### Using

the library is now published to npm, so install it

```
npm i chichi-ng
```
import the module into your app.module.ts

```
...
import { ChichiNgModule } from 'chichi-ng';
...
@NgModule({
  ...
  imports: [
  ...
  ChichiNgModule
...
```
Use the `cc-bypass-panel` component in your own component. create a variable in your component to hold the state of which side the bypass overlay is located, for example:
```
 rightPanelActive: boolean = false;
```
Use the element in your template. You need to have 4 containers with classes `left-panel-content`, `right-panel-content`, `overlay-left-content`, and `overlay-right-content`:
```
<cc-bypass-panel [rightPanelActive]="rightPanelActive">
  <div class="left-panel-content">
      ...
  </div>

   <div class="right-panel-content">
    ...
  </div>

  <div class="overlay-left-content">
  ...
		<button class="ghost" id="signUp" (click)="rightPanelActive=false">Left Panel Active</button>
	</div>

  <div class="overlay-right-content">
    ...
    <button class="ghost" id="signIn" (click)="rightPanelActive=true">Right Panel Active</button>
  </div>

  </cc-bypass-panel>
```
You can style the overlay with css like:
```
:host ::ng-deep .overlay {
  background: #1565C0;
	background: -webkit-linear-gradient(to right, #b92b27, #1565C0);
	background: linear-gradient(to right, #b92b27, #1565C0);
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 0 0;
}
```

## Spinning Globe

This simulates a spinning globe by animating a surface map in the background of a div. The div sides are rounded to make it a circle and then optionally shadowing is applied to give a 3d effect. The original idea for this is from Rahul Arora's [article](https://w3bits.com/css-earth/) which I used as a basis and converted to angular with help from various sources like Jeff Delaney's [article](https://angularfirebase.com/lessons/animation-examples-in-angular-4-3/) about animation in Angular, Eliyas Hossain's answer for the [stack overflow question](https://stackoverflow.com/questions/44535108/how-do-i-perform-infinite-animations-in-angular-2) to make the animation infinite, and Jette's answer to the [stack overflow question](https://stackoverflow.com/questions/50806212/how-to-use-input-parameters-in-angular-6-animation) on parameterizing the animation so I could pass in the time for speeding or slowing the animtaion. Finally I'd like to thank the team at Inove for making texture maps freely availabe under the [creative commons license](https://creativecommons.org/licenses/by/4.0/) on this [site](https://www.solarsystemscope.com/textures/)

### Using

See the top of the bypass panel using notes for adding the module to your project.

Add a cc-turning-globe element. Add an id so that you can style the element directly for size and spacing.

* globeImage - This is the url to the image to use for the globe. The image should be a surface image.
* secondsPerRotation - this controls how fast the animation "spins", higher numbers spin slower. The actual time will depend on the size of the image.
* withShadow - This controls if there will be a shadow. For planets you want this to make them look round. it doesn't make sense for the sun and maybe non-planets.

In the html add the element:
```
      <cc-turning-globe id="earth"  secondsPerRotation="30s" withShadow="true"
        globeImage="https://cdn.pixabay.com/photo/2013/07/12/12/54/world-map-146505_960_720.png">
      </cc-turning-globe>
```

In the css set the size:
```
#earth {
  height: 200px;
  width: 200px;
}

```


## Running Tests

I've setup ```ng test``` to run headless chrome and firefox, single run and exit. To have karma open chrome, watch files and rerun tests as files are change, use the alternative karma config file via ```ng test -c debug```

to generate test code coverage report use ```ng test --code-coverage``` in the workspace root look for the coverage folder 



This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.0.

## Code scaffolding

Run `ng generate component component-name --project chichi-ng` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project chichi-ng`.
> Note: Don't forget to add `--project chichi-ng` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build chichi-ng` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build chichi-ng`, go to the dist folder `cd dist/chichi-ng` and run `npm publish`.

## Running unit tests

Run `ng test chichi-ng` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
