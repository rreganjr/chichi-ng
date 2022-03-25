import { Component, HostBinding, Input, HostListener } from '@angular/core';

/**
 * Quick and Dirty Modal window
 * I mixed ideas from 
 * https://jasonwatmore.com/post/2020/05/14/angular-9-modal-windows 
 * https://github.com/cornflourblue/angular-9-custom-modal/blob/master/src/app/_modal/modal.component.ts
 * https://stackoverflow.com/questions/38376107/flexible-centered-dialog-using-flexbox-with-a-scrolling-region
 * https://jsfiddle.net/LGSon/4cpxnrz8/6/
 */
@Component({
  selector: 'demo-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  @HostBinding('class.show') @Input() showModal: boolean = false;

  constructor() { }

  @HostListener('click')
  public onClickBackground(): void {
    this.showModal = false;
  }
}
