export const MINDMAP_ERROR_TYPE = {
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS',
    WARN: 'WARN',
    INFO: 'INFO'
};

export class MindmapError extends Error {
    constructor(type, reason) {
        super(reason);
        this.type = type;
        this.reason = reason;
    }
}