import { GitRepository } from "azure-devops-extension-api/Git/Git";
import BaseService from "./base-service";
import { GitServiceIds, IVersionControlRepositoryService } from "azure-devops-extension-api/Git/GitServices";

export default class RepositoryService extends BaseService<IVersionControlRepositoryService> {
    constructor() {
        super(GitServiceIds.VersionControlRepositoryService);
    }

    public async getCurrentGitRepository(): Promise<GitRepository | null> {
        return (await this.service).getCurrentGitRepository();
    }
}