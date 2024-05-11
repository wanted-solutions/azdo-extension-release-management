import * as SDK from "azure-devops-extension-sdk";

export default class BaseService<T> {
    protected readonly service: Promise<T>;

    constructor(serviceType: any) {
        this.service = SDK.getService<T>(serviceType);
    }
}
