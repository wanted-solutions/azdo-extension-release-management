import { CommonServiceIds, IProjectInfo, IProjectPageService } from "azure-devops-extension-api";
import BaseService from "./base-service";


export default class ProjectService extends BaseService<IProjectPageService> {
    constructor() {
        super(CommonServiceIds.ProjectPageService);
    }

    public async get(): Promise<IProjectInfo | undefined> {
        return (await this.service).getProject();
    }
}