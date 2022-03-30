import { DateTime, DateTimeUnit, Duration, Interval } from "luxon";

export class Timescale {
 
    constructor(
        private _boundsInterval: Interval, // The min and max date range in the visual scheduler
        private _visibleDuration: Duration = Duration.fromDurationLike({hours: 12}), // The duration visible in the scheduler
        private _offsetDuration:  Duration = Duration.fromDurationLike({hours: 0}) // The duration from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
    ) {
        // TODO: validate
    }

    public get boundsInterval(): Interval {
        return this._boundsInterval;
    }

    public get visibleDuration(): Duration {
        return this._visibleDuration;
    }

    public get offsetDuration(): Duration {
        return this._offsetDuration;
    }

    /**
     * This is the first time unit visible in the timeline.
     * @returns the {@link DateTime} of the first {@link DateTimeUnit} in the {@link Timescale#visibleDuration}
     */
    public get startOfVisibleDateTime(): DateTime {
        return this.boundsInterval.start.startOf(this.startAtDateTimeUnit).plus(this.offsetDuration);
    }

    /**
     * 
     * @param dateTime - the dateTime to check if it is outside the boundsInterval
     */
    isOutOfBounds(dateTime: DateTime): boolean {
        return ! this._boundsInterval.contains(dateTime);
    }

    /**
     * The timeline should start at the beginning of a unit to make it easier to read, for example if the start of
     * the bounds is 1:15 PM and the view size is 7 days, having the timelines show 1:15 PM 7 times is harder to read
     * than if the time line starts at the beginning of the day and shows the dates marked for each day.
     * 
     * @returns a {@link DateTimeUnit} indicating when the timeline starts, for example start of day or hour
     */
    public get startAtDateTimeUnit(): DateTimeUnit {
        if (this._visibleDuration.hours < 3*24) {
        return 'hour';
        } else {
        return 'day';
        }
    }

    /**
     * The duration from where the timeline starts versus the timescale bounds start 
     * given the {@link Timescale#startAtDateTimeUnit}.
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
    public get startAtDurationInSeconds(): Duration {
        return this._boundsInterval.start.diff(this._boundsInterval.start.startOf(this.startAtDateTimeUnit), 'seconds');
    }

    /**
     * The duration from where the timescale bounds end and the time line ends
     */
    public get endAtDurationInSeconds(): Duration {
        return this._boundsInterval.end.endOf(this.startAtDateTimeUnit).diff(this._boundsInterval.end, 'seconds');
    }

    /**
     * @returns The {@link Interval} visible in the scheduler
     */
    public get visibleBounds(): Interval {
        const start:DateTime = this._boundsInterval.start.plus(this._offsetDuration);
        return Interval.fromDateTimes(start, start.plus(this._visibleDuration));
    }

    /**
     * The timeline starts at the hour or day before the schedule bounds, this demarks the start and end of that area.
     * @returns the Interval at the beginning of the timeline between the timeline start and the bounds start
     */
    public get outOfBoundsStartInterval(): Interval {
        return Interval.fromDateTimes(this.boundsInterval.start, this.boundsInterval.start.plus(this.startAtDurationInSeconds));
    }

    /**
     * The timeline ends at the hour or day after the schedule bounds, this demarks the start and end of that area.
     * @returns the Interval at the beginning of the timeline between the timeline start and the bounds start
     */
    public get outOfBoundsEndInterval(): Interval {
        console.log(`this.boundsInterval.end = ${this.boundsInterval.end} this.endAtDurationInSeconds=${this.endAtDurationInSeconds}`);
        return Interval.fromDateTimes(this.boundsInterval.end, this.boundsInterval.end.plus(this.endAtDurationInSeconds));
    }
}
