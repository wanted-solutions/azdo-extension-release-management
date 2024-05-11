import "./Hub.scss";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { showRootComponent } from "../../Common";
import {Card} from "azure-devops-ui/Card";
import {Page} from "azure-devops-ui/Page";
import ProjectService from "../../Services/project-service";
import RepositoryService from "../../Services/repository-service";
import { ContributionsDataService, GitDataService } from "../../Services";
import { GitRef, IVersionControlRepositoryService } from "azure-devops-extension-api/Git";
import {ITableColumn, renderSimpleCell, SimpleTableCell, Table, TableColumnLayout} from "azure-devops-ui/Table";
import {ObservableValue} from "azure-devops-ui/Core/Observable";
import {ArrayItemProvider} from "azure-devops-ui/Utilities/Provider";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { KeywordFilterBarItem } from "azure-devops-ui/TextFilterBarItem";
import { DropdownFilterBarItem } from "azure-devops-ui/Dropdown";
import { Filter, FILTER_CHANGE_EVENT, FilterOperatorType } from "azure-devops-ui/Utilities/Filter";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { Observer } from "azure-devops-ui/Observer";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { Link } from "azure-devops-ui/Link";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { getClient } from "azure-devops-extension-api";
import { ContributionsRestClient } from "azure-devops-extension-api/Contributions";

const filters = new Filter({
    defaultState: {
        keyword: { value: "" },
        branch: { value: ["refs/heads/main"] }
    }
});

interface IHubContentState {
    branch: string;
    branches: ArrayItemProvider<GitRef>;
    project: any;
    repository: any;
    tags: ArrayItemProvider<GitRef>;
}

class HubContent extends React.Component<{}, IHubContentState> {

    private fixedColumns = [{
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "version",
        name: "Version",
        readonly: true,
        renderCell: this.renderVersionColumn.bind(this),
        width: new ObservableValue(-20),
    }, {
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "version",
        name: "Commit ID",
        readonly: true,
        renderCell: this.renderCommitColumn.bind(this),
        width: new ObservableValue(-20),
    }, {
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "creator.displayName",
        name: "Commit Author",
        readonly: true,
        renderCell: this.renderCommitAuthorColumn.bind(this),
        width: new ObservableValue(-20),
    }, {
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "version",
        name: "Reference",
        readonly: true,
        renderCell: this.renderReferenceColumn.bind(this),
        width: new ObservableValue(-20),
    }];

    private branch: DropdownSelection = new DropdownSelection()

    constructor(props: {}) {
        super(props);

        this.state = {
            branch: "refs/heads/main",
            branches: new ArrayItemProvider<GitRef>([]),
            project: {},
            repository: {},
            tags: new ArrayItemProvider<GitRef>([])
        };


    }

    public render(): JSX.Element {
        return (
            <Page className="module-hub-element">
                <Header
                    title={`Release management`}
                    titleSize={TitleSize.Large}
                />
                <div className="page-content">
                    <FilterBar filter={filters}>
                        <KeywordFilterBarItem filterItemKey="keyword" />
                        <DropdownFilterBarItem
                            filterItemKey="branch"
                            items={this.state.branches.value.map(b => ({ id: b.name, text: this.parseBranchFromRefString(b.name), iconProps: { iconName: "BranchMerge" } }))}
                            selection={this.branch}
                            placeholder="Branch"
                        />     
                    </FilterBar>
                    <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>   
                        <Observer currentState={this.state.tags}>
                            {(props: { currentState: ArrayItemProvider<GitRef> }) => (
                                <Table
                                    role="table"
                                    columns={this.fixedColumns}
                                    itemProvider={props.currentState}
                                />
                            )}
                        </Observer> 
                    </Card>
                </div>
            </Page>
        );
    }

    public componentDidMount() {
        SDK.init();
        this.initializeComponent();
        filters.subscribe(this.filterData.bind(this), FILTER_CHANGE_EVENT);
    }

    private async initializeComponent() {
        await SDK.ready();
        await this.initData();
    }

    private renderVersionColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<any>,
        tableItem: any
    ): JSX.Element {
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
            >
                <div>
                    <Icon className="icon-right-padding" size={IconSize.small} ariaLabel="Tag icon" iconName="Tag" />
                    {this.parseTagFromRefString(tableItem.name)}
                    </div>
            </SimpleTableCell>
        );
    }

    private renderReferenceColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<any>,
        tableItem: any
    ): JSX.Element {
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
            >
                <div>
                    <Pill size={PillSize.compact}>{tableItem.name}</Pill>
                </div>
            </SimpleTableCell>
        );
    }

    private renderCommitColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<any>,
        tableItem: any
    ): JSX.Element {
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
            >
                <div>
                    <Icon className="icon-right-padding" size={IconSize.small} ariaLabel="Commit icon" iconName="BranchCommit" />
                    <Link target="_blank" href={this.getCommitHostname(tableItem.peeledObjectId)}>
                        {this.shortenCommitId(tableItem.peeledObjectId)}
                    </Link>
                </div>
            </SimpleTableCell>
        );
    }

    private renderCommitAuthorColumn(
        rowIndex: number,
        columnIndex: number,
        tableColumn: ITableColumn<any>,
        tableItem: any
    ): JSX.Element {
        return (
            <SimpleTableCell
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                key={"col-" + columnIndex}
                contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
            >
                <div>
                    <Icon className="icon-right-padding" size={IconSize.small} ariaLabel="User icon" iconName="Contact" />
                    {tableItem.creator?.displayName || "unknown"}
                </div>
            </SimpleTableCell>
        );
    }

    private getCommitHostname(commitId: string): string {
        return `https://dev.azure.com/${SDK.getHost().name}/${this.state.project.name}/_git/${this.state.repository.name}/commit/${commitId}`;
    }

    private shortenCommitId(commitId: string): string { 
        return commitId.substring(0, 7);
    }    

    private parseBranchFromRefString(ref: string): string {
        console.log("Ref", ref);
        return ref?.replace("refs/heads/", "");
    }

    private parseTagFromRefString(ref: string): string {
        return ref.split("/").pop()!;
    }

    private async initData() {
        const repositoryService = new RepositoryService();
        const currentRepository = await repositoryService.getCurrentGitRepository();

        const projectService = new ProjectService();
        const project = await projectService.get();

        const gitService = new GitDataService();
        const branches = await gitService.getBranches(
            project?.id as string,
            currentRepository!.name,
        )  

        this.setState({
            branches: new ArrayItemProvider(branches),
            project: project,
            repository: currentRepository
        });

        filters.setFilterItemState("branch", { value: [filters.getFilterItemState("branch")?.value[0]] });
        this.filterData();
    }

    private async filterData() {
        
        const gitService = new GitDataService();
        const tags = await gitService.getTagsByBranchContaining(
            this.state.project?.id as string,
            this.state.repository?.name,
            this.parseBranchFromRefString(filters.getFilterItemState("branch")?.value[0]),
            filters.getFilterItemState("keyword")?.value
        );

        this.setState({
            tags: new ArrayItemProvider(tags)
        });
    }
}

showRootComponent(<HubContent />);
