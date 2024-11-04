export class DailyRecordException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RecordException';
    }
}