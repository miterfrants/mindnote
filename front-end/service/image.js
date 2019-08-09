export const ImageService = {
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
    },
    extractBase64DataFromURL: (url) => {
        return new Promise((resolve) => {
            const imageRawData = url.replace('data:', '');
            const contentType = imageRawData.substring(0, imageRawData.indexOf('base64,'));
            const img = new Image();
            img.src = url;
            img.addEventListener('load', () => {
                resolve({
                    data: imageRawData.replace(contentType, '').replace('base64,', ''),
                    contentType: contentType.replace(';', ''),
                    width: img.width,
                    height: img.height
                });
            });
        });
    }
};