import { TimescaleValidatorErrorCode } from "./timescale-validator.util";

export class TimescaleInvalid extends Error {
    constructor(public readonly validatorCode: TimescaleValidatorErrorCode, message: string) {
        super(message);
    }
}
