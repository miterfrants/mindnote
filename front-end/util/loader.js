window['MindnoteLoaderCache'] = [];
export function Loader() {
    this.max = 10000;
    this.checkCount = 0;
    const self = this;
    this.load = async (dependency) => {
        for (let i = 0; i < dependency.length; i++) {
            if (dependency[i].dependency) {
                const loader = new Loader();
                await loader.load(dependency[i].dependency);
            }
        }
        await _load(dependency);
    };

    this.loadHTML = async (url) => {
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
        return resp.text();
    };

    async function _load(dependency) {
        for (let i = 0; i < dependency.length; i++) {
            if (!window[dependency[i].checkVariable] && window.MindnoteLoaderCache.indexOf(dependency[i].url) === -1) {
                const script = document.createElement('script');
                script.src = dependency[i].url;
                document.body.appendChild(script);
                window.MindnoteLoaderCache.push(dependency[i].url);
            }
        }

        return new Promise((resolve, reject) => {
            _check(dependency, resolve, reject);
        });
    }

    async function _check(dependency, resolve, reject) {
        let isReady = true;
        for (let i = 0; i < dependency.length; i++) {
            if (dependency[i].checkVariable && !window[dependency[i].checkVariable]) {
                isReady = false;
                break;
            }
        }

        if (isReady) {
            resolve();
        } else {
            self.checkCount += 1;
            // console.log(self.checkCount);
            if (self.checkCount < self.max) {
                setTimeout(() => {
                    _check(dependency, resolve, reject);
                }, 10);
            } else {
                // refactor throw error
                console.error(dependency);
            }

        }
    }
}