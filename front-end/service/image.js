export const ImageService = {
    generateImageUrl: (imgFilename, w) => {
        if (w !== undefined) {
            return `https://sapiens-tools-mindnote.imgix.net/${imgFilename}?w=${w}&rot`;
        } else {
            return `https://sapiens-tools-mindnote.imgix.net/${imgFilename}?rot`;
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
    },
    extractBase64RawDataFromURL: (url) => {
        const imageRawData = url.replace('data:', '');
        const contentType = imageRawData.substring(0, imageRawData.indexOf('base64,'));
        return imageRawData.replace(contentType, '').replace('base64,', '');
    },
    getOrientation: (base64URL) => {
        const arrayBuffer = ImageService.base64ToArrayBuffer(ImageService.extractBase64RawDataFromURL(base64URL));
        var view = new DataView(arrayBuffer);

        if (view.getUint16(0, false) != 0xFFD8) return -2;

        var length = view.byteLength,
            offset = 2;

        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;

            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    return -1;
                }
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;

                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                        return view.getUint16(offset + (i * 12) + 8, little);
            } else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        return -1;
    },
    base64ToArrayBuffer: (base64) => {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
};