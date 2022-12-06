import { DateTime, Duration, Interval } from "luxon";
import { TimescaleInvalid } from "./timescale-invalid.error";
import { VisualSchedulerService } from "./visual-scheduler.service";

export enum TimescaleValidatorErrorCode {
    BoundsIntervalUndefined,
    BoundsIntervalInvalid,
    BoundsIntervalZeroDuration,
    BoundsIntervalTooShort,
    OffsetDurationUndefined,
    OffsetDurationOutOfBounds,
    OffsetDurationInvalidDuration,
    VisibleDurationUndefined,
    VisibleDurationOutOfBounds,
    VisibleDurationInvalidDuration,
    OffsetDurationPlusVisibleDurationOutOfBounds
}


export class TimescaleValidator {

     public static checkBoundsInterval(boundsInterval?: Interval): void {
        if (!boundsInterval) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalUndefined, `The boundsInterval cannot be undefined or null.`);
        } else if (boundsInterval && !boundsInterval.isValid) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalInvalid, `The boundsInterval is invalid: ${boundsInterval.invalidExplanation}`);
        } else if (boundsInterval && boundsInterval.start.equals(boundsInterval.end)) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalZeroDuration, `The boundsInterval end ${boundsInterval.end} cannot equal the start interval.`);
        } else if (boundsInterval && boundsInterval.toDuration().as('milliseconds') < VisualSchedulerService.MIN_VIEWPORT_DURATION.as('milliseconds')) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalTooShort, `The boundsInterval must be at least ${VisualSchedulerService.MIN_VIEWPORT_DURATION.as('minutes')} minutes long.`);
        }
    }

    public static checkOffsetDuration(boundsInterval: Interval, offsetDuration?: Duration): void {
        if (!offsetDuration) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.OffsetDurationUndefined, `The offsetDuration cannot be undefined or null.`);
        } else if (offsetDuration.as('seconds') > boundsInterval.toDuration().as('seconds')) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.OffsetDurationOutOfBounds, `The offsetDuration ${offsetDuration.as('seconds')} (seconds) cannot be longer than the duration of the boundsInterval ${boundsInterval.toDuration().as('seconds')} (seconds).`);
        } else if (!offsetDuration.isValid) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.OffsetDurationInvalidDuration, `The offsetDuration is invalid: ${offsetDuration.invalidExplanation}`);
        }
    }

    public static checkVisibleDuration(boundsInterval: Interval, visibleDuration?: Duration): void {
        if (!visibleDuration) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.VisibleDurationUndefined, `The visibleDuration cannot be undefined or null.`);
        } else if (visibleDuration.as('seconds') > boundsInterval.toDuration().as('seconds')) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.VisibleDurationOutOfBounds, `The visibleDuration cannot be longer than the duration of the boundsInterval.`);
        } else if (!visibleDuration.isValid) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.VisibleDurationInvalidDuration, `The visibleDuration is invalid: ${visibleDuration.invalidExplanation}`);
        }
    }

    public static checkVisibleDurationWithOffsetDurationToBounds(boundsInterval: Interval, visibleDuration: Duration, offsetDuration: Duration): void {
        const visibleEnd: DateTime = boundsInterval.start.plus(offsetDuration).plus(visibleDuration);
        if (visibleEnd > boundsInterval.end) {
            throw new TimescaleInvalid(TimescaleValidatorErrorCode.OffsetDurationPlusVisibleDurationOutOfBounds,
                `The visibleDuration ${visibleDuration.as('seconds')} (seconds) ` +
                `plus the offsetDuration ${offsetDuration.as('seconds')} (seconds) ends at ${visibleEnd}, ` +
                `which extend passed the end of the boundsInterval ${boundsInterval.end}.`);
        }
    }
}
