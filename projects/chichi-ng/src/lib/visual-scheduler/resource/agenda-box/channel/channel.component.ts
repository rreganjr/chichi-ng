import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { AgendaItemLabeler } from '../agenda-item.model';
import { DateTime, Interval } from 'luxon';
import { combineLatest, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';

class DropZoneAgendaItem extends AgendaItem {
  public readonly isDropZone: boolean = true;
  constructor(
     resource: string, 
     channel: string, 
     bounds: Interval, 
     data: object, 
     labeler: AgendaItemLabeler<any>
) {
    super(resource, channel, bounds, data, labeler)
  }
}

@Component({
  selector: 'cc-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() resourceName!: string;
  @Input() channelName!: string;

  private _combinedSubscription?: Subscription;
  private _visibleAgendaItemsSubject: Subject<AgendaItem[]> = new ReplaySubject<AgendaItem[]>(1);

  constructor(
    public visualSchedulerService: VisualSchedulerService,
    private channelElement: ElementRef
  ) { }

  ngOnInit(): void {
    this._combinedSubscription = combineLatest([
      this.visualSchedulerService.getAgendaItemsByResourceChannel$(this.resourceName, this.channelName),
      this.visualSchedulerService.getTimescale$()
    ]).subscribe(([agendaItems, timeScale]) => {
        this._visibleAgendaItemsSubject.next(this.injectDropZones(timeScale.visibleBounds, agendaItems
          .filter((agendaItem:AgendaItem) => timeScale.visibleBounds.intersection(agendaItem.bounds) !== null)
          .sort((a:AgendaItem, b:AgendaItem)=> a.startDate.toMillis() - b.startDate.toMillis())));
    });
  }
  
  ngAfterViewInit(): void {
   if (this.channelElement !== undefined) {
     this.channelElement.nativeElement.className = `channel-${this.channelName}`;
   }
  }

  ngOnDestroy(): void {
    if (this._combinedSubscription) {
      this._combinedSubscription.unsubscribe();
      this._combinedSubscription = undefined;
    }
  }

  onAgendaItemClick(agendaItem: AgendaItem, index: number): void {
    console.log(`onAgendaItemClick ${index}`)
  }

  onDragOver($event:Event): void {
    console.log(`${this.resourceName} ${this.channelName} dragOver`, $event);
  }

  onDrop($event:Event, agendaItem: AgendaItem): void {
    console.log(`${this.resourceName} ${this.channelName} drop`, $event, agendaItem);
  }
  
  public get visibleAgendaItems$(): Observable<AgendaItem[]> {
    return this._visibleAgendaItemsSubject.asObservable();
  }

  private injectDropZones(visibleInterval: Interval, agendaItems: AgendaItem[]): AgendaItem[] {
    const results: AgendaItem[] = [];
    if (agendaItems && agendaItems.length > 0) {
      let previousEnd: DateTime = visibleInterval.start;
      for (let index = 0; index < agendaItems.length; index++) {
        const agendaItem: AgendaItem = agendaItems[index];
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, agendaItem.bounds.start);
        if (intervalBetween.toDuration().as('seconds') > 0) {
          results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
        }
        results.push(agendaItem);
        previousEnd = agendaItem.bounds.end;
      }
      if (previousEnd < visibleInterval.end) {
        // add a trailing drop zone
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, visibleInterval.end);
        results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
      }
    } else {
      // fill the whole visible part of the channel with a drop zone
      results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, visibleInterval, {label: 'drop zone'}, (data)=> data.label));
    }
    return results;
 }

}
