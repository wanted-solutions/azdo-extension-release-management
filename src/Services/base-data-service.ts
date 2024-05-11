import * as SDK from "azure-devops-extension-sdk";
import {
    CommonServiceIds,
    IExtensionDataService
} from "azure-devops-extension-api";
import {
    ExtensionDataCollection,
    IDocumentOptions,
    IExtensionDataManager
} from "azure-devops-extension-api/Common/CommonServices";

export function NewService<T>(service: any): T {
    return new service() as T
}

export const KEY_VALUE_COLLECTION_NAME = "$settings"

export default class BaseDataService {
    service!: IExtensionDataService;
    manager!: IExtensionDataManager;

    public async init() {
        this.service = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        this.manager = await this.service.getExtensionDataManager(SDK.getExtensionContext().id, await SDK.getAccessToken());
    }

    public async listDocuments(collectionName: string, documentOptions?: IDocumentOptions): Promise<any[]> {
        return this.manager.getDocuments(collectionName, documentOptions)
    }

    public async getDocument(collectionName: string, id: string, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.getDocument(collectionName, id, documentOptions)
    }

    public async setDocument(collectionName: string, doc: any, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.setDocument(collectionName,  doc, documentOptions)
    }

    public async createOrUpdateDocument(collectionName: string, doc: any, documentOptions?: IDocumentOptions): Promise<any> {
        return this.setDocument(collectionName, doc, documentOptions)
    }

    public async createDocument(collectionName: string, doc: any, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.createDocument(collectionName,  doc, documentOptions)
    }

    public async updateDocument(collectionName: string, doc: any, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.updateDocument(collectionName, doc, documentOptions)
    }

    public async deleteDocument(collectionName: string, id: string, documentOptions?: IDocumentOptions): Promise<void> {
        return this.manager.deleteDocument(collectionName, id, documentOptions)
    }

    public async queryCollectionsByName(collectionNames: string[]): Promise<ExtensionDataCollection[]> {
        return this.manager.queryCollectionsByName(collectionNames)
    }

    public async queryCollections(collections: ExtensionDataCollection[]): Promise<ExtensionDataCollection[]> {
        return this.manager.queryCollections(collections)
    }

    public async set<T>(key: string, value: T, documentOptions?: IDocumentOptions): Promise<T> {
        return this.manager.setValue(key, value, documentOptions)
    }

    public async get<T>(key: string, documentOptions?: IDocumentOptions): Promise<T> {
        return this.manager.getValue(key, documentOptions)
    }

    public async update(key: string, doc: any, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.updateDocument(KEY_VALUE_COLLECTION_NAME, { ...doc, id: key }, documentOptions)
    }

    public async delete(key: string, documentOptions?: IDocumentOptions): Promise<any> {
        return this.manager.deleteDocument(KEY_VALUE_COLLECTION_NAME, key, documentOptions)
    }

    public async getAll(documentOptions?: IDocumentOptions): Promise<any[]> {
        return this.listDocuments(KEY_VALUE_COLLECTION_NAME, documentOptions)
    }
}
