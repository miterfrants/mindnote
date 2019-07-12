export const Image = {
    generateImageUrl: (imgFilename, w) => {
        if (w !== undefined) {
            return `https://sapiens-tools-mindmap.imgix.net/${imgFilename}?w=${w}`;
        } else {
            return `https://sapiens-tools-mindmap.imgix.net/${imgFilename}`;
        }

    }
}