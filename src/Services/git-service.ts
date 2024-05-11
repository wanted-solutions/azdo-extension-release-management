import Git from "azure-devops-extension-api/Git";
import { GitRef } from "azure-devops-extension-api/Git/Git";
import BaseClient from "./base-client";
import { GitRestClient } from "azure-devops-extension-api/Git/GitClient";
import { GitServiceIds } from "azure-devops-extension-api/Git/GitServices";

const BRANCHES_PREFIX = "heads"
const REFS_PREFIX = ""
const TAGS_PREFIX = "tags"

export default class GitDataService extends BaseClient<GitRestClient> {
    constructor() {
        super(GitRestClient);
    }

    async getTags(projectId: string, repositoryId: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, TAGS_PREFIX, undefined, true, undefined, undefined, true)
    }

    async getRefs(projectId: string, repositoryId: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, REFS_PREFIX, undefined, true, undefined, undefined, true)
    }

    async getBranches(projectId: string, repositoryId: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, BRANCHES_PREFIX, undefined, true, undefined, undefined, true)
    }

    async tagContains(projectId: string, repositoryId: string, expresion: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, TAGS_PREFIX, undefined, true, undefined, undefined, true, expresion)   
    }

    async branchContains(projectId: string, repositoryId: string, expresion: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, BRANCHES_PREFIX, undefined, true, undefined, undefined, true, expresion)   
    }

    async refContains(projectId: string, repositoryId: string, expresion: string): Promise<GitRef[]> {
        return this.client.getRefs(repositoryId, projectId, REFS_PREFIX, undefined, true, undefined, undefined, true, expresion)   
    }

    async getTagsByBranch(projectId: string, repositoryId: string, branchName: string) {
        const tags = await this.getTags(projectId, repositoryId)
        const commits = await this.getBranchCommits(projectId, repositoryId, branchName)
        const commitIds = commits.map(c => c.commitId);
        return tags.filter(t => commitIds.includes(t.peeledObjectId));
    }

    async getTagsByBranchContaining(projectId: string, repositoryId: string, branchName: string, expresion: string) {
        const tags = await this.tagContains(projectId, repositoryId, expresion)
        const commits = await this.getBranchCommits(projectId, repositoryId, branchName)
        const commitIds = commits.map(c => c.commitId);
        return tags.filter(t => commitIds.includes(t.peeledObjectId));
    }

    async getBranchCommits(projectId: string, repositoryId: string, branchName: string) {
        const commitCriteria: Git.GitQueryCommitsCriteria = <Git.GitQueryCommitsCriteria>{$skip: 0, $top: 1000, itemVersion: {version: branchName, versionType: 0}};
        return this.client.getCommits(repositoryId, commitCriteria,  projectId)
    }
}