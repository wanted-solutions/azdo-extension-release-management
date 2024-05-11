import {getClient} from "azure-devops-extension-api";
import {RestClientFactory} from "azure-devops-extension-api/Common/Client";

export default class BaseClient<T> {
    protected readonly client: T

    constructor(clientType: RestClientFactory<T>) {
        this.client = getClient(clientType) as T
    }
}
