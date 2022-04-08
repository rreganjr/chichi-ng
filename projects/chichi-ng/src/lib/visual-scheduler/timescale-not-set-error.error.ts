
export class TimescaleNotSetError extends Error {
    public readonly whoYouGonnaCall: string;

    constructor(whoYouGonnaCall: string) {
        super(TimescaleNotSetError.createMessage(whoYouGonnaCall));
        this.whoYouGonnaCall = whoYouGonnaCall;
    }

    private static createMessage(whoYouGonnaCall: string): string {
        return `TimescaleNotSet. Did you call ${whoYouGonnaCall} yet?`;
    }
}
