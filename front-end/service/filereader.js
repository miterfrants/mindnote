export const MindmapFileReader = {
    readFileToBase64: (file) => {
        return new Promise((resolve, reject) => {
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
        })
    },
    readFilesToBase64: (files) => {
        return new Promise((resolve, reject) => {
            let loadImageCount = 0;
            const _base64Files = [];
            for (var i = 0; i < files.length; i++) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(files[i]);
                fileReader.addEventListener('loadend', (e) => {
                    loadImageCount += 1;
                    if (loadImageCount === files.length) {
                        resolve(_base64Files);
                    }
                    const imageResult = e.currentTarget.result.replace('data:', '');
                    const contentType = imageResult.substring(0, imageResult.indexOf('base64,'));
                    _base64Files.push({
                        data: imageResult.replace(contentType, '').replace('base64,', ''),
                        contentType: contentType.replace(';', '')
                    });
                });
            }
        });
    }
}