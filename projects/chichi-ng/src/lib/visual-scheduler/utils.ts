import { DateTime, DateTimeUnit } from "luxon";

export class Utils {

    public static readonly LUXON_ISO8601_HTML_DATETIME_LOCAL_OPTS = {suppressMilliseconds: false, includeOffset: false};

    /**
     * 
     * @param dateTime - the dateTime to convert
     * @returns a string suitable for an HTML datetime-local input element
     */
    public static toHtmlDateTimeLocalString(dateTime:DateTime|Date): string {
        dateTime = (dateTime instanceof Date?DateTime.fromJSDate(dateTime):dateTime);
        if (dateTime instanceof DateTime) {
            // NOTE: interesting note: suppressMilliseconds only works if the milliseconds is zero
            // see https://stackoverflow.com/questions/49171431/luxon-set-milliseconds-for-toiso
            return dateTime.startOf('second').toISO(Utils.LUXON_ISO8601_HTML_DATETIME_LOCAL_OPTS);
        } else {
            return '';
        }
    }

  /**
   * Given a dateTime get the start of the next unit.
   *
   * @param dateTime - the starting {@link DateTime}
   * @param unit - the {@link DateTimeUnit} to get the next one of
   * @example
   *   getStartOfNext('2022-01-01T12:15:15.123', 'day');
   *   // returns '2022-01-02T00:00:00.000'
   * @example
   *   getStartOfNext('2022-01-01T12:15:15.123', 'hour');
   *   // returns '2022-01-01T13:00:00.000'
   * @returns The {@link DateTime} instant of the beginning of the next {@link DateTimeUnit} from the supplied {@link DateTime}
   */
   public static getStartOfNext(dateTime: DateTime, unit: DateTimeUnit): DateTime {
        switch (unit) {
            case 'year':
                return dateTime.plus({years: 1}).startOf(unit);
            case 'quarter':
                return dateTime.plus({quarters: 1}).startOf(unit);
            case 'month':
                return dateTime.plus({months: 1}).startOf(unit);
            case 'week':
                return dateTime.plus({weeks: 1}).startOf(unit);
            case 'day':
                return dateTime.plus({days: 1}).startOf(unit);
            case 'hour':
                return dateTime.plus({hours: 1}).startOf(unit);
            case 'minute':
                return dateTime.plus({minutes: 1}).startOf(unit);
            case 'second':
                return dateTime.plus({seconds: 1}).startOf(unit);
            case 'millisecond':
                return dateTime.plus({milliseconds: 1}).startOf(unit);
        }
    }
}
