import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cc-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit {

  @Input() channelName!: string;

  constructor(
    private channelElement: ElementRef
  ) { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
   if (this.channelElement !== undefined) {
     this.channelElement.nativeElement.className = `channel-${this.channelName}`;
   }
  }
}
