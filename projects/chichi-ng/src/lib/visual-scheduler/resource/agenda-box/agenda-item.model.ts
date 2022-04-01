import { DateTime, Duration, DurationUnit, Interval } from "luxon";
import { Utils } from "../../utils";

export type AgendaItemLabeler<T> = (data: T) => string;

export class AgendaItem {
    // internal id generator seed
    private static nextId: number = 1;
    public readonly id: number;

    constructor(
        private _resource: string, 
        private _channel: string, 
        private _bounds: Interval, 
        private _data: object, 
        private _labeler: AgendaItemLabeler<any>
    ) {
        this.id = AgendaItem.nextId++;
    }

    public get resourceName(): string {
        return this._resource;
    }

    public get channelName(): string {
        return this._channel;
    }

    public get label(): string {
        if (this._labeler instanceof Function) {
            return `[${this.id}]: ${this._labeler(this._data)}`;
        }
        return `${this.resourceName}.${this.channelName}[${this.id}]`;
    }

    public get startDate(): DateTime {
        return this._bounds.start;
    }

    public get startDateAsHtmlDateTimeLocalString(): string {
        return this.startDate ? Utils.toHtmlDateTimeLocalString(this.startDate) : '';
    }

    public get endDate(): DateTime {
        return this._bounds.end;
    }

    public get endDateAsHtmlDateTimeLocalString(): string {
        return this.endDate ? Utils.toHtmlDateTimeLocalString(this.endDate) : '';
    }

    public durationAs(units: DurationUnit): Duration {
        return this._bounds.toDuration(units);
    }

    public get bounds(): Interval {
        return this._bounds;
    }
}
