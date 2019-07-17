export const MINDNOTE_ERROR_TYPE = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARN: 'WARN',
    INFO: 'INFO'
};

export class MindnoteError extends Error {
    constructor(type, reason) {
        super(reason);
        this.type = type;
        this.reason = reason;
    }
}