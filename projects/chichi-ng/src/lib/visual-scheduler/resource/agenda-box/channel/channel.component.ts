import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

@Component({
  selector: 'cc-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit {

  @Input() resourceName!: string;
  @Input() channelName!: string;

  constructor(
    private visualSchedulerService: VisualSchedulerService,
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
