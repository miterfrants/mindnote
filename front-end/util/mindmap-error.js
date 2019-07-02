export const MINDMAP_ERROR_TYPE = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARN: 'WARN',
    INFO: 'INFO'
};

export class MindmapError extends Error {
    constructor(type, when, reason) {
        super(when);
        this.type = type;
        this.when = when;
        this.reason = reason;
    }
}