import { Interval } from "luxon";

/**
 * The Resource or Channel doesn't exist.
 */
export class ResourceChannelNotValid extends Error {

    constructor(public readonly resourceName: string, public readonly channelName: string) {
        super(ResourceChannelNotValid.createMessage(resourceName, channelName))
    }

    private static createMessage(resourceName: string, channelName: string): string {
        return `The resource  ${resourceName} or channel ${channelName} does not exist.`;
    }
}
