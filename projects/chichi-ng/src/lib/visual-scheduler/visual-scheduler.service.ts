import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Duration, Interval } from 'luxon';
import { Timescale } from './timescale.model';
import { AgendaItem, AgendaItemLabeler } from './resource/agenda-box/agenda-item.model';

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

  private _agendaItems: AgendaItem[] = [];
  private _agendaItemsSubject: ReplaySubject<AgendaItem[]> = new ReplaySubject(1);
  private _agendaItemsByResourceChannelMap: Map<ResourceChannelMapKey,ResourceChannelMapData> = new Map<ResourceChannelMapKey, ResourceChannelMapData>();

  constructor() {
    this._timescaleSubject.next(this._timescale);
  }

  public getTimescale$(): Observable<Timescale> {
    return this._timescaleSubject.asObservable();
  }

  /**
   * The min and max date/time of schedules
   * @param interval the start date and time to the end date and time
   */
  public setBoundsInterval(interval: Interval): void {
    this._timescale = new Timescale(interval, this._timescale.visibleDuration, this._timescale.offsetDuration);
    this._timescaleSubject.next(this._timescale);
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

  /**
   * 
   * @returns All the {@link AgendaItem}s in the {@link VisualSchedulerComponent}
   */
  public getAgendaItems$(): Observable<AgendaItem[]> {
    return this._agendaItemsSubject.asObservable();
  }

  /**
   * 
   * @param resourceName The name of a specific {@link ResourceComponent}
   * @param channelName The name of a {@link ChannelComponent} in the named resource
   * @returns The {@link AgendaItem}s in that channel of the resource
   */
  public getAgendaItemsByResourceChannel$(resourceName: string, channelName: string): Observable<AgendaItem[]> {
    const key = this.getResourceChannelMapKey(resourceName, channelName);
    const mapData = this.getResourceChannelMapData(key);
    return mapData.subject.asObservable();
  }

  public addAgendaItem(resourceName: string, channelName: string, startDate: Date, endDate: Date, data: object, labeler: AgendaItemLabeler<any>): void {
    const agendaItem = new AgendaItem(resourceName, channelName, Interval.fromDateTimes(startDate, endDate), data, labeler);
    this._agendaItems.push(agendaItem);
    this._agendaItemsSubject.next(this._agendaItems);

    const key = this.getResourceChannelMapKey(resourceName, channelName);
    const mapData = this.getResourceChannelMapData(key);
    mapData.agendaItems.push(agendaItem);
    mapData.subject.next(mapData.agendaItems);
  }

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
