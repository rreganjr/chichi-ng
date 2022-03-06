import { DateTime, Duration, DurationUnit, Interval } from "luxon";

export type AgendaItemLabeler = (data:object) => string;

export class AgendaItem {
    constructor(
        private _resource: string, 
        private _channel: string, 
        private _bounds: Interval, 
        private _data: object, 
        private _labeler: AgendaItemLabeler) {
    }

    public get label(): string {
        if (this._labeler instanceof Function) {
            return this._labeler(this._data);
        }
        return '';
    }

    public get startDate(): DateTime {
        return this._bounds.start;
    }

    public get endDate(): DateTime {
        return this._bounds.end;
    }

    public durationAs(units: DurationUnit): Duration {
        return this._bounds.toDuration(units);
    }

}
