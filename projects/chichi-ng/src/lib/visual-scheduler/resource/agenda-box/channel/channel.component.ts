import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { AgendaItemLabeler } from '../agenda-item.model';
import { DateTime, Interval } from 'luxon';
import { combineLatest, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';
import { DndDropEvent } from 'ngx-drag-drop';
import { Timescale } from '../../../timescale.model';

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
      // TODO: if we just add drop zones for visible times dropping at either end doesn't fill to the
      // next agenda item, it stops at what is visible so I really want to include the agendaItem before
      // and after the visible bounds to calculate the drop zones at the end of the visible bounds.
      // this._visibleAgendaItemsSubject.next(this.injectDropZones(timeScale, visibleAgendaItems
      //   .filter((agendaItem:AgendaItem) => timeScale.visibleBounds.intersection(agendaItem.bounds) !== null)
      //   .sort((a:AgendaItem, b:AgendaItem)=> a.startDate.toMillis() - b.startDate.toMillis())));

      if (agendaItems && agendaItems.length > 0) {
        agendaItems = agendaItems.sort((a:AgendaItem, b:AgendaItem)=> a.startDate.toMillis() - b.startDate.toMillis());
        let visibleAgendaItems: AgendaItem[] = [];
        let beforeAgendaItem: AgendaItem|undefined;
        let afterAgendaItem: AgendaItem|undefined;
        for (let i:number = 0; i < agendaItems?.length||0; i++) {
          if (timeScale.visibleBounds.intersection(agendaItems[i].bounds) === null) {
            if (visibleAgendaItems.length === 0) {
              beforeAgendaItem = agendaItems[i];
            } else {
              afterAgendaItem = agendaItems[i];
              break;
            }
          } else {
            visibleAgendaItems.push(agendaItems[i]);
          }
        }
        if (beforeAgendaItem) {
          visibleAgendaItems.unshift(beforeAgendaItem);
        }
        if (afterAgendaItem) {
          visibleAgendaItems.push(afterAgendaItem);
        }
        agendaItems = visibleAgendaItems;
      }

      this._visibleAgendaItemsSubject.next(this.injectDropZones(timeScale, agendaItems));
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

  public onDrop($event:DndDropEvent, agendaItem: AgendaItem): void {
    console.log(`${this.resourceName} ${this.channelName} drop agendaItem.id=${agendaItem.id} starting ${agendaItem.startDateAsHtmlDateTimeLocalString} ending ${agendaItem.endDateAsHtmlDateTimeLocalString}`, agendaItem);
    this.visualSchedulerService.addAgendaItem(this.resourceName, this.channelName, agendaItem.bounds.start.toJSDate(), agendaItem.bounds.end.toJSDate(), {label: 'new item'}, (data:any)=>data.label);
  }
  
  public get visibleAgendaItems$(): Observable<AgendaItem[]> {
    return this._visibleAgendaItemsSubject.asObservable();
  }

  private injectDropZones(timescale: Timescale, agendaItems: AgendaItem[]): AgendaItem[] {
    const results: AgendaItem[] = [];
    const bounds: Interval = timescale.boundsInterval;
    if (agendaItems?.length > 0) {
      let previousEnd: DateTime = bounds.start;
      for (let index = 0; index < agendaItems.length; index++) {
        const agendaItem: AgendaItem = agendaItems[index];
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, agendaItem.bounds.start);
        if (intervalBetween.toDuration().as('seconds') > 0) {
          results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
        }
        results.push(agendaItem);
        previousEnd = agendaItem.bounds.end;
      }
      if (previousEnd < bounds.end) {
        // add a trailing drop zone
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, bounds.end);
        results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
      }
    } else {
      // fill the whole visible part of the channel with a drop zone
      results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, bounds, {label: 'drop zone'}, (data)=> data.label));
    }
    return results;
 }

 /**
  * if the visual bounds intersect with the start or end of the out of bounds intervals
  * then adjust the bounds drop zones can be added.
  */
 private getAdjustedVisibleBounds(timescale: Timescale): Interval {
  const intersectingIntervalOfOutOfBoundsStart: Interval|null = timescale.boundsInterval.intersection(timescale.outOfBoundsStartInterval);
  const intersectingIntervalOfOutOfBoundsEnd: Interval|null = timescale.boundsInterval.intersection(timescale.outOfBoundsEndInterval);
  const startBound: DateTime = (intersectingIntervalOfOutOfBoundsStart?intersectingIntervalOfOutOfBoundsStart.end:timescale.boundsInterval.start);
  const endBound: DateTime = (intersectingIntervalOfOutOfBoundsEnd?intersectingIntervalOfOutOfBoundsEnd.start:timescale.boundsInterval.end);
  return Interval.fromDateTimes(startBound, endBound);
 }

}
