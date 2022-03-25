import { Component, HostBinding, Input, HostListener, Output, EventEmitter } from '@angular/core';

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
  @Output() clickToCancel: EventEmitter<void> = new EventEmitter();

  constructor() { }

  @HostListener('click')
  public onClickBackground(): void {
    console.log(`click on modal background, emit cancel`);
    this.clickToCancel.emit();
  }

  public onClickDialogContainer($event:Event): void {
    console.log(`stopping click in dialog container`);
    $event.stopPropagation();
  }
}
