import crypto from "crypto";
import azure from "azure-storage";
import { AzureStorageService } from "./AzureStorageService";
import { BadRequest } from "../Utils/Errors";
export var entGen = azure.TableUtilities.entityGenerator;

function generateKey() {
  return crypto.randomBytes(16).toString("hex");
}
class AzureStorageEntity {
  /**
   * @param {typeof AzureStorageModel} data
   */
  constructor(data, partitionKey = "general", rowKey = generateKey()) {
    // @ts-ignore
    if (data.id) {
      // @ts-ignore
      rowKey = data.id.split("::")[1];
    }
    this.PartitionKey = entGen.String(partitionKey);
    this.RowKey = entGen.String(rowKey);
    this.Id = entGen.String(this.PartitionKey._ + "::" + this.RowKey._);
    this.Data = entGen.String(JSON.stringify(data));
    for (let k in data) {
      let val = data[k];
      switch (typeof data[k]) {
        case "string":
          val = entGen.String(val);
          break;
        case "number":
          val = entGen.Double(val);
          break;
        case "boolean":
          val = entGen.Boolean(val);
          break;
        default:
          continue;
      }
      this[k] = data[k];
    }
  }
}

export class AzureStorageModel {
  /**
   * @param {AzureStorageEntity} azureStorageEntity
   */
  ___fromStorageEntity(azureStorageEntity) {
    this.id = azureStorageEntity.Id
      ? azureStorageEntity.Id._
      : azureStorageEntity.PartitionKey._ + "::" + azureStorageEntity.RowKey._;
    let data = JSON.parse(azureStorageEntity.Data._);
    for (let k in data) {
      this[k] = data[k];
    }
  }
}

/**
 * @template T
 */
export class AzureStorageSet {
  /**
   * @param {string} partitionKey
   * @param {typeof AzureStorageModel } model
   * @param {AzureStorageService} storageService
   */
  constructor(partitionKey, model, storageService) {
    this.___partitionKey = partitionKey;
    this.___Model = model;
    this.___storageService = storageService;
  }

  /**
   * @param {any} entityData
   * @returns {Promise<T>}
   */
  async CreateOrUpdate(entityData) {
    let model = this.___mapDataToModel(entityData);
    if (typeof model["validate"] == "function") {
      model["validate"]();
    }
    // @ts-ignore
    let entity = new AzureStorageEntity(model, this.___partitionKey);
    await this.___storageService.UpdateEntity(this.___partitionKey, entity);
    // @ts-ignore
    model.___fromStorageEntity(entity);
    // @ts-ignore
    return model;
  }

  /**
   * @param {string} id
   * @returns {Promise<T>}
   */
  async findById(id) {
    let { partitionKey, rowKey } = this.___getKeysFromId(id);
    let res = await this.___storageService.GetEntity(
      this.___partitionKey,
      partitionKey,
      rowKey
    );
    let model = new this.___Model();
    model.___fromStorageEntity(res.result);
    // @ts-ignore
    return model;
  }

  /**
   * @param {string} id
   */
  async findByIdAndRemove(id) {
    // @ts-ignore
    let { partitionKey, rowKey } = this.___getKeysFromId(id);
    let res = await this.___storageService.GetEntity(
      this.___partitionKey,
      partitionKey,
      rowKey
    );
    await this.___storageService.deleteEntity(this.___partitionKey, res.result);
    return true;
  }

  /**
   * 
   * @param { {
    where?: string;
    select?: string;
    top?: number;
    and?: string;
    or?: string;} | undefined } [query] 
   * @param {string} [continuationToken] 
   * @returns {Promise<{results:T[], continuationToken: string | undefined}>}
   */
  async find(query, continuationToken) {
    let res = await this.___storageService.GetEntities(
      this.___partitionKey,
      query,
      continuationToken
    );
    let results = res.result.entries.map(entity => {
      let model = new this.___Model();
      model.___fromStorageEntity(entity);
      return model;
    });
    return { results, continuationToken: res.result.continuationToken };
  }

  /**
   * @param {string} id
   */
  ___getKeysFromId(id) {
    let splits = id.split("::");
    let partitionKey = splits[0];
    let rowKey = splits[1];
    return { partitionKey, rowKey };
  }
  ___mapDataToModel(entityData) {
    let model = new this.___Model();
    Object.keys(model).forEach(key => {
      model[key] = entityData[key] || model[key];
    });
    return model;
  }
}
