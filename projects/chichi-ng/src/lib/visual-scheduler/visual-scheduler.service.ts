import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Duration, Interval } from 'luxon';
import { Timescale } from './timescale.model';
import { AgendaItem, AgendaItemLabeler } from './resource/agenda-box/agenda-item.model';
import { ToolEvent } from './toolbox/tool/tool-event.model';

type ResourceChannelMapKey = string;

class ResourceChannelMapData {
  public readonly agendaItems: AgendaItem[] = [];
  public readonly subject: Subject<AgendaItem[]> = new ReplaySubject<AgendaItem[]>(1);
}

@Injectable({
  providedIn: null
})
export class VisualSchedulerService {

  private _timescale = new Timescale(
    Interval.fromDateTimes(new Date(), new Date(new Date().getTime() + 24 * 60 * 60 * 1000)),
  );
  private _timescaleSubject: ReplaySubject<Timescale> = new ReplaySubject(1);

  private _toolEventsSubject: Subject<ToolEvent> = new BehaviorSubject(ToolEvent.CLEAR);
  
  private _agendaItemsById: Map<number,AgendaItem> = new Map<number, AgendaItem>();
  private _agendaItems: AgendaItem[] = [];
  private _agendaItemsSubject: ReplaySubject<AgendaItem[]> = new ReplaySubject(1);
  private _agendaItemsByResourceChannelMap: Map<ResourceChannelMapKey,ResourceChannelMapData> = new Map<ResourceChannelMapKey, ResourceChannelMapData>();

  constructor() {
    this._timescaleSubject.next(this._timescale);
  }

  public dragStart($event: DragEvent, toolType: string): void {
    console.log(`dragStart: ${toolType}`, $event);
    this._toolEventsSubject.next(new ToolEvent('START', toolType, $event));
  }

  public dragEnd($event: DragEvent, toolType: string): void {
    console.log(`dragEnd: ${toolType}`, $event);
    this._toolEventsSubject.next(new ToolEvent('END', toolType, $event));
  }
  
  /**
   * Open a viewer/editor for the supplied {@link AgendaItem}
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns true if the viewer/editor
   */
   public openAgendaItemDetail(agendaItemOrId: AgendaItem|number, $event: Event): boolean {
    const agendaItem: AgendaItem|undefined = this.toAgendaItem(agendaItemOrId);
    if (agendaItem !== undefined) {
      this._toolEventsSubject.next(new ToolEvent('EDIT', agendaItem.channelName, $event, agendaItem));
        console.log(`open agenda item: ${agendaItem.label} in resource ${agendaItem.resourceName} channel ${agendaItem.channelName}`);
    }
    return false;
  }

  public getToolEvents$(): Observable<ToolEvent> {
    return this._toolEventsSubject.asObservable();
  }

  public getTimescale$(): Observable<Timescale> {
    return this._timescaleSubject.asObservable();
  }

  /**
   * 
   * @param resourceName 
   * @param channelName 
   * @param startDate 
   * @param endDate 
   * @returns a list of {@link AgendaItem}s that intersect with the supplied date interval. The list may be empty.
   */
  public getIntersectingAgendaItems(resourceName: string, channelName: string, startDate: Date, endDate: Date): AgendaItem[] {
    return this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName))
      .agendaItems.filter((agendaItem) => agendaItem.bounds.intersection(Interval.fromDateTimes(startDate, endDate)) !== null);
  }

  /**
   * 
   * @param resourceName 
   * @param channelName 
   * @param startDate 
   * @param endDate 
   * @returns true if the supplied date interval doesn't contain any scheduled items
   */
  public isIntervalAvailable(resourceName: string, channelName: string, startDate: Date, endDate: Date): boolean {
    return this.getIntersectingAgendaItems(resourceName, channelName, startDate, endDate).length===0;
  }

  /**
   * The min and max date/time of schedules
   * @param interval the start date and time to the end date and time
   */
  public setBoundsInterval(interval: Interval): void {
    this._timescale = new Timescale(interval, this._timescale.visibleDuration, this._timescale.offsetDuration);
    this._timescaleSubject.next(this._timescale);
    // TODO: remove AgendaItems out of the bounds?
  }

  /**
   * Shift the viewport (visible hours) to the offset from the start time.
   * NOTE: this is the absolute position from the start, not adding to the current offset.
   * 
   * @param offsetHours - the hours from the bounds start time to the start of the visible hours
   */
  public setTimeScaleOffsetHours(offsetHours: number): void {
    console.log(`setTimeScaleOffsetHours(offsetHours = ${offsetHours})`);
    if (offsetHours >= 0) {
      offsetHours = Math.round(offsetHours);
      let newDuration: Duration;
      if (offsetHours > this._timescale.boundsInterval.toDuration("hours").minus(this._timescale.visibleDuration).hours) {
        newDuration = this._timescale.boundsInterval.toDuration("hours").minus(this._timescale.visibleDuration);
      } else {
        newDuration = Duration.fromDurationLike({hours: offsetHours});
      }
      this._timescale = new Timescale(this._timescale.boundsInterval, this._timescale.visibleDuration, newDuration);
      this._timescaleSubject.next(this._timescale);  
    }
  }

  /**
   * Set the viewport of the schedule to the specificed number of hours
   * @param visibleHours - The size of what is visible in hours, minimum = 1 hour maximum = 7 days
   */
  public setTimeScaleVisibleHours(visibleHours: number): void {
    visibleHours = Math.round(visibleHours);
    if (visibleHours < 3) {
      visibleHours = 3;
    } else if (visibleHours > 7 * 24) {
      visibleHours = 7 * 24;
    }
    if (visibleHours > 0 && visibleHours <= 7 * 24) {
      this._timescale = new Timescale(this._timescale.boundsInterval, Duration.fromDurationLike({hours: visibleHours}), this._timescale.offsetDuration);
      this._timescaleSubject.next(this._timescale);
    }
  }

  public getAgendaItemById(id: number): AgendaItem|undefined {
    return this._agendaItemsById.get(id);
  }

  /**
   * 
   * @returns All the {@link AgendaItem}s in the {@link VisualSchedulerComponent}
   */
  public getAgendaItems$(): Observable<AgendaItem[]> {
    return this._agendaItemsSubject.asObservable();
  }

  /**
   * 
   * @param resourceName - The name of a specific {@link ResourceComponent}
   * @param channelName - The name of a {@link ChannelComponent} in the named resource
   * @returns The {@link AgendaItem}s in that channel of the resource
   */
  public getAgendaItemsByResourceChannel$(resourceName: string, channelName: string): Observable<AgendaItem[]> {
    return this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName)).subject.asObservable();
  }

  /**
   * Add an item to the agenda. If the supplied start/end date intersect with another agenda item in the same resource/channel the item is
   * not added.
   * 
   * @param resourceName - The name of a specific {@link ResourceComponent}
   * @param channelName  - The name of a {@link ChannelComponent} in the named resource
   * @param startDate 
   * @param endDate 
   * @param data - Data for the agenda item not specific to the agenda except that the labeler function will use it.
   * @param labeler - A function that takes the supplied data to generate a label to display in the agenda.
   * @returns The id of the agenda item added to the agenda or undefined if not added
   */
  public addAgendaItem(resourceName: string, channelName: string, startDate: Date, endDate: Date, data: object, labeler: AgendaItemLabeler<any>): number|undefined {
    if (this.isIntervalAvailable(resourceName, channelName, startDate, endDate)) {
      const agendaItem = new AgendaItem(resourceName, channelName, Interval.fromDateTimes(startDate, endDate), data, labeler);
      this._agendaItemsById.set(agendaItem.id, agendaItem);
      this._agendaItems.push(agendaItem);
      this._agendaItemsSubject.next(this._agendaItems);
  
      const mapData = this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName));
      mapData.agendaItems.push(agendaItem);
      mapData.subject.next(mapData.agendaItems);
      return agendaItem.id;
    }
    return undefined;
  }

  /**
   * Remove an {@link AgendaItem} from the scheduler.
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns true if the {@link AgendaItem} was found and removed, false if it wasn't found
   */
  public removeAgendaItem(agendaItemOrId: AgendaItem|number): boolean {
    const agendaItem: AgendaItem|undefined = this.toAgendaItem(agendaItemOrId);
    if (agendaItem) {
      const index = this._agendaItems.findIndex((item:AgendaItem) => {
        return item.resourceName === agendaItem.resourceName &&
          item.channelName === agendaItem.channelName &&
          item.bounds == agendaItem.bounds
      })
      if (index > -1) {
        this._agendaItems.splice(index, 1);
        this._agendaItemsSubject.next(this._agendaItems);
        // if the item is in the _agendaItems array, it will also be in the mapped data
        const key = this.getResourceChannelMapKey(agendaItem.resourceName, agendaItem.channelName);
        const mapData = this.getResourceChannelMapData(key);
        const mapDataIndex = mapData.agendaItems.findIndex((item:AgendaItem) => {
          return item.resourceName === agendaItem.resourceName &&
            item.channelName === agendaItem.channelName &&
            item.bounds == agendaItem.bounds
        })
        if (mapDataIndex > -1) {
          mapData.agendaItems.splice(mapDataIndex, 1);
          mapData.subject.next(mapData.agendaItems);    
        }
      }
      return index > -1;
    }
    return false;
  }

  /**
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns the supplied {@link AgendaItem} or the agenda item in the schedule by id
   */
  private toAgendaItem(agendaItemOrId: AgendaItem|number): AgendaItem|undefined {
    if (typeof agendaItemOrId === 'number') {
      return this.getAgendaItemById(agendaItemOrId);
    } else {
      return agendaItemOrId;
    }
  }

  /**
   * 
   * @param key 
   * @returns a {@link ResourceChannelMapData} which may have no items scheduled
   * NOTE: This adds a {@link ResourceChannelMapData} to the _agendaItemsByResourceChannelMap if not found
   */
  private getResourceChannelMapData(key: ResourceChannelMapKey): ResourceChannelMapData {
    let mapData = this._agendaItemsByResourceChannelMap.get(key);
    if (mapData == undefined) {
      mapData = new ResourceChannelMapData();
      this._agendaItemsByResourceChannelMap.set(key, mapData);
    }
    return mapData;
  }

  private getResourceChannelMapKey(resourceName: string, channelName: string): string {
    return `resourceName: ${resourceName}, channelName: ${channelName}`;
  }
}
