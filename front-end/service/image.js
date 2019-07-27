export const Image = {
    generateImageUrl: (imgFilename, w) => {
        if (w !== undefined) {
            return `https://sapiens-tools-mindnote.imgix.net/${imgFilename}?w=${w}`;
        } else {
            return `https://sapiens-tools-mindnote.imgix.net/${imgFilename}`;
        }
    },
    replaceImage: () => {
        console.log(document.querySelectorAll('img'));
    },
    getPngDimensions: (base64) => {
        const header = atob(base64.slice(0, 50)).slice(16, 24);
        const uint8 = Uint8Array.from(header, c => c.charCodeAt(0));
        const dataView = new DataView(uint8.buffer);
        return {
            width: dataView.getInt32(0),
            height: dataView.getInt32(4)
        };
    }
};