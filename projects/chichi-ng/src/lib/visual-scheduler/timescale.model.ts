import { DateTime, DateTimeUnit, Duration, Interval } from "luxon";
import { VisualSchedulerService } from "./visual-scheduler.service";

/**
 * The {@link Timescale} defines the boundaries of when items can be scheduled in the scheduler and
 * the boundaries of what is visible in the scheduler.
 * 
 * It also defines the {@link TimelineComponent} boundaries, the primary units and sub-unit marks on
 * the timeline.
 */
export class Timescale {
 
    constructor(
        private _boundsInterval: Interval, // The min and max date range in the visual scheduler
        private _visibleDuration: Duration = Duration.fromDurationLike({hours: 12}), // The duration visible in the scheduler
        private _offsetDuration:  Duration = Duration.fromDurationLike({hours: 0}) // The duration from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
    ) {
        // TODO: validate
    }

    /**
     * The schedule boundaries, items can't be scheduled out of this range.
     */
    public get boundsInterval(): Interval {
        return this._boundsInterval;
    }

    /**
     * @param dateTime - the dateTime to check if it is outside the schedule boundaries
     * @returns true if the supplied dateTime is >= schedule boundaries start and < the schedule boundaries end
     */
     isOutOfBounds(dateTime: DateTime): boolean {
        return ! this._boundsInterval.contains(dateTime);
    }

    /**
     * The {@link Duration} from the start of the schedule boundaries to the visible time in the scheduler
     */
    public get offsetDuration(): Duration {
        return this._offsetDuration;
    }
    
    /**
     * The {@link Duration} of time visible in the scheduler
     */
     public get visibleDuration(): Duration {
        return this._visibleDuration;
    }
    
    /**
     * @returns The {@link Interval} visible in the scheduler
     */
     public get visibleBounds(): Interval {
        const start:DateTime = this.startOfVisibleTimeline;
        return Interval.fromDateTimes(start, start.plus(this._visibleDuration));
    }

    /**
     * The timeline should start at the beginning of a unit to make it easier to read, for example if the start of
     * the bounds is 1:15 PM and the view size is 7 days, having the timelines show 1:15 PM 7 times is harder to read
     * than if the time line starts at the beginning of the day and shows the dates marked for each day.
     * 
     * NOTE: this will vary based on the {@link Duration} visible
     * 
     * @returns a {@link DateTimeUnit} indicating when the timeline starts, for example start of day or hour
     */
    public get primaryDateTimeUnit(): DateTimeUnit {
        if (this._visibleDuration.hours < 3*24) {
        return 'hour';
        } else {
        return 'day';
        }
    }

    /**
     * This is the first time unit (hour or day) visible in the timeline equal to or less than the start of the 
     * schedule boundaries.
     * @returns the {@link DateTime} of the first {@link DateTimeUnit} in the {@link Timescale#visibleDuration}
     */
     public get startOfVisibleTimeline(): DateTime {
        return this._boundsInterval.start.startOf(this.primaryDateTimeUnit).plus(this._offsetDuration);
    }

    /**
     * This is the last time unit (hour or day) visible in the timeline equal to or greater than the end of the 
     * schedule boundaries.
     * @returns the {@link DateTime} of the last {@link DateTimeUnit} in the {@link Timescale#visibleDuration}
     */
     public get endOfVisibleTimeline(): DateTime {
        return this.startOfVisibleTimeline.plus(this._visibleDuration);
    }

    /**
     * The timeline starts at the hour or day before the schedule bounds, this demarks the start and end of that area.
     * @returns the Interval at the beginning of the timeline between the timeline start and the bounds start
     */
     public get outOfBoundsStartInterval(): Interval {
        return Interval.fromDateTimes(this._boundsInterval.start.startOf(this.primaryDateTimeUnit), this._boundsInterval.start);
    }

    /**
     * The duration from where the timeline starts versus the timescale bounds start 
     * given the {@link Timescale#primaryDateTimeUnit}.
     * 
     * ex 1:
     *   bounds start: 1/1/2020 12:14 pm
     *   visible duration 1 day -> startAtDateTimeUnit = hour
     *   timeline starts at 1/1/2020 12:00 pm
     *   startAtDuration 840 seconds (14 minutes in seconds)
     * 
     *   bounds start: 1/1/2020 12:14 pm
     *   visible duration 1 week -> startAtDateTimeUnit = day
     *   timeline starts at 1/1/2020 12:00 am
     *   startAtDuration 44,040 seconds (12 hours and 14 minutes in seconds)
     */
    public get outOfBoundsStartDuration(): Duration {
        return this.outOfBoundsStartInterval.toDuration('seconds');
    }

    /**
     * The timeline ends at the hour or day after the schedule bounds, this demarks the start and end of that area.
     * @returns the Interval at the beginning of the timeline between the timeline start and the bounds start
     */
     public get outOfBoundsEndInterval(): Interval {
        return Interval.fromDateTimes(this._boundsInterval.end, this._boundsInterval.end.endOf(this.primaryDateTimeUnit));
    }

    /**
     * The duration from where the schedule bounds end and the time line ends
     */
     public get outOfBoundsEndDuration(): Duration {
        return this.outOfBoundsEndInterval.toDuration('seconds');
    }

    public get timelineBounds(): Interval {
        return Interval.fromDateTimes(this.outOfBoundsStartInterval.start, this.outOfBoundsEndInterval.end);
    }

    /**
     * This is the first time unit (hour or day) in the timeline equal to or less than the start of the 
     * schedule boundaries.
     * @returns the {@link DateTime} of the first {@link DateTimeUnit} in the {@link Timescale#boundsInterval}
     */
     public get startOfTimeline(): DateTime {
        return this._boundsInterval.start.startOf(this.primaryDateTimeUnit);
    }

    public get endOfTimeline(): DateTime {
        return VisualSchedulerService.getStartOfNext(this._boundsInterval.end, this.primaryDateTimeUnit);
    }


}
