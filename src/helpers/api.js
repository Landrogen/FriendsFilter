export default class API {
    constructor(appId) {
        this.appId = appId;
        this.initVK()
    }
    initVK() {
        VK.init({
            apiId: this.appId
        });

        VK.Auth.login(function(response) {
            if (response.session) {
                console.log('всё ок!');
            } else {
                console.log('Не удалось авторизоваться');
            }
        }, 8);
    }

    call(method, params = {}) {
        params.v = '5.8';

        return new Promise((resolve, reject) => {
            VK.api(method, params, (data) => {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.response);
                }
            })
        })
    }
}