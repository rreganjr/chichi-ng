import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';

@Component({
  selector: 'cc-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit {

  @Input() resourceName!: string;
  @Input() channelName!: string;

  private _agendaItemsSubscription?: Subscription;
  private _agendaItems!: AgendaItem[];

  constructor(
    public visualSchedulerService: VisualSchedulerService,
    private channelElement: ElementRef
  ) { }

  ngOnInit(): void {
    console.log(`resource: ${this.resourceName} channel: ${this.channelName} subscribing`);
    this._agendaItemsSubscription = this.visualSchedulerService.getAgendaItemsByResourceChannel$(this.resourceName, this.channelName).subscribe((agendaItems: AgendaItem[]) => {
      this._agendaItems = agendaItems;
      console.log(`resource: ${this.resourceName} channel: ${this.channelName} agendaItems: `, this._agendaItems);
    });
    console.log(`observable: `, this.visualSchedulerService.getAgendaItemsByResourceChannel$(this.resourceName, this.channelName));
  }
  
  ngAfterViewInit(): void {
   if (this.channelElement !== undefined) {
     this.channelElement.nativeElement.className = `channel-${this.channelName}`;
   }
  }

  onAgendaItemClick(agendaItem: AgendaItem, index: number): void {
    console.log(`onAgendaItemClick ${index}`)
  }
}
