import { TimescaleValidatorErrorCode } from "./timescale.model";

export class TimescaleInvalid extends Error {
    constructor(public readonly validatorCode: TimescaleValidatorErrorCode, message: string) {
        super(message);
    }
}
