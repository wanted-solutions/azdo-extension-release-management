import BaseClient from "./base-client";
import { ContributionsRestClient } from "azure-devops-extension-api/Contributions";

export default class ContributionsDataService extends BaseClient<ContributionsRestClient> {
    constructor() {
        super(ContributionsRestClient);
    }

    public async getContributions(): Promise<any> {
        return this.client.getInstalledExtensions();
    }
}