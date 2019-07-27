export const MindnoteFileReader = {
    readFileToBase64: (file) => {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener('loadend', (e) => {
                const imageResult = e.currentTarget.result.replace('data:', '');
                const contentType = imageResult.substring(0, imageResult.indexOf('base64,'));
                resolve({
                    data: imageResult.replace(contentType, '').replace('base64,', ''),
                    contentType: contentType.replace(';', '')
                });
            });
        });
    },
    readFilesToBase64: (files) => {
        return new Promise((resolve) => {
            let loadImageCount = 0;
            const _base64Files = [];
            for (var i = 0; i < files.length; i++) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(files[i]);
                fileReader.addEventListener('loadend', (e) => {
                    const imageResult = e.currentTarget.result.replace('data:', '');
                    const contentType = imageResult.substring(0, imageResult.indexOf('base64,'));
                    const img = new Image();
                    img.src = e.currentTarget.result;
                    img.addEventListener('load', () => {
                        loadImageCount += 1;
                        if (loadImageCount === files.length) {
                            resolve(_base64Files);
                        }
                        _base64Files.push({
                            data: imageResult.replace(contentType, '').replace('base64,', ''),
                            contentType: contentType.replace(';', ''),
                            width: img.width,
                            height: img.height
                        });
                    });
                });
            }
        });
    }
};