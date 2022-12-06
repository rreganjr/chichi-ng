
export class TimescaleNotSet extends Error {
    public readonly whoYouGonnaCall: string;

    constructor(whoYouGonnaCall: string) {
        super(TimescaleNotSet.createMessage(whoYouGonnaCall));
        this.whoYouGonnaCall = whoYouGonnaCall;
    }

    private static createMessage(whoYouGonnaCall: string): string {
        return `TimescaleNotSet. Did you call ${whoYouGonnaCall} yet?`;
    }
}
