import azure from "azure-storage";
import { BadRequest } from "../Utils/Errors";

export const Permissions = azure.BlobUtilities.SharedAccessPermissions;

class MemCache {
  constructor() {
    this.valid = false;
    /** @type {any[]} */
    this.images = [];
    /** @type {any[]} */
    this.files = [];
  }
}

/**
 * @typedef {{ name: string, key: string, containers: string[] }} AzureStorageConfig
 * @typedef {{ name: string, base64: string }} Base64File
 */

export class AzureStorageService {
  /**
   * Creates a promise based wrapper around common AzureStorage methods
   * @param {AzureStorageConfig} config
   */
  constructor({ name, key, containers = [] }) {
    if (!name || !key) {
      throw new Error("[AZURE_STORAGE_ERROR] Invalid Config");
    }
    this.name = name;
    this.storageAccount = azure.createBlobService(this.name, key);
    this.containers = containers;
    this._memCache = {};
    this.containers.forEach(this.__checkContainer);
  }

  /**
   * @param {string} container
   */
  async GetContainerFilesAsync(container) {
    if (!this._memCache.valid) {
      await this.__GetBlobFilesAsync(container);
    }
    return this._memCache.files;
  }

  /**
   * @param {string} container
   */
  async GetPublicImagesAsync(container) {
    await this.GetContainerFilesAsync(container);
    return this._memCache[container].images;
  }

  /**
   * @param {string} container
   * @param {string} path
   */
  async GetFilesByContainerPathAsync(container, path) {
    let files = await this.GetContainerFilesAsync(container);
    /**
     * @param {{ name: string | any[]; }} f
     */
    return files.filter(f => f.name.includes(path));
  }

  /**
   * @param {string} container
   * @param {string} filename
   */
  async RemoveFileAsync(container, filename) {
    await this.__checkContainer(container);
    return new Promise((resolve, reject) => {
      this.storageAccount.deleteBlobIfExists(
        container,
        filename,
        (err, result, azureResponse) => {
          if (err) {
            return reject(err);
          }
          this._memCache[container].valid = false;
          return resolve(azureResponse);
        }
      );
    });
  }

  /**
   * @param {string} container
   * @param {string} path
   * @param {string} permission
   * @param {number?} expires
   */
  async GetSharedAccessToken(container, path, permission, expires = 30) {
    await this.__checkContainer(container);
    let startDate = new Date();
    let expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + expires);
    startDate.setMinutes(startDate.getMinutes() - 10);

    let token = this.storageAccount.generateSharedAccessSignature(
      container,
      path,
      {
        AccessPolicy: {
          Permissions: Permissions[permission],
          Start: startDate,
          Expiry: expiryDate
        }
      }
    );
    let sasUrl = this.storageAccount.getUrl(container, path, token);
    return { sasUrl, token };
  }

  /**
   * @param {string} container
   * @param {Base64File} file
   */
  async WriteBase64FileToContainerAsync(container, path = "", file) {
    await this.__checkContainer(container);
    path = this.__validateFilePath(file, container, path);
    return new Promise((resolve, reject) => {
      var matches = file.base64.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
      if (!matches) {
        throw BadRequest("Bad Request: File data malformed");
      }
      let type = matches[1];
      path += "." + type.slice(type.indexOf("/") + 1);
      let buffer = Buffer.from(matches[2], "base64");

      this.storageAccount.createBlockBlobFromText(
        container,
        path,
        buffer,
        {
          contentSettings: {
            contentType: type
          }
        },
        (error, result, response) => {
          if (error) {
            return reject(error);
          }
          try {
            this._memCache[container].valid = false;
            this._memCache[container].lastWrite = Date.now();
            this._memCache[container].files.push(result);
            if (type.includes("image")) {
              result.contentSettings = {
                contentType: type
              };
              this._memCache[container].images.push(result);
            }
          } catch (e) {
            reject(e);
          }
          return resolve(
            `https://${this.name}.blob.core.windows.net/${container}/${path}`
          );
        }
      );
    });
  }

  /**
   * @param {Base64File} file
   * @param {string} container
   * @param {string} path
   */
  __validateFilePath(file, container, path) {
    if (!file || !container) {
      throw BadRequest(
        "[AZURE_STORAGE_ERROR] invalid file or container specified"
      );
    }
    if (path.includes("undefined") || file.name.includes("undefined")) {
      throw BadRequest("[BAD REQUEST]: Path or filename is undefined");
    }
    if (file.name.includes(".")) {
      file.name = file.name.slice(0, file.name.lastIndexOf("."));
    }
    if (path && path[path.length - 1] != "/") {
      path += "/";
    }
    path += `${file.name}`;
    path = path.replace(
      `https://${this.name}.blob.core.windows.net/${container}/`,
      ""
    );
    path = path.replace("//", "/");
    return path;
  }

  /**
   * @param {string} container
   */
  async __GetBlobFilesAsync(container) {
    await this.__checkContainer(container);
    return new Promise((resolve, reject) => {
      this.storageAccount.listBlobsSegmented(container, null, function(
        error,
        result
      ) {
        if (error) {
          return reject(error);
        } else {
          this._memCache[container].files = result.entries;
          this._memCache[container].images = result.entries.filter(f => {
            try {
              return f.contentSettings.contentType.includes("image");
            } catch (e) {
              return false;
            }
          });
          this._memCache.valid = true;
          return resolve(result.entries);
        }
      });
    });
  }
  /**
   * @param {string} container
   */
  __checkContainer(container) {
    return new Promise((resolve, reject) => {
      this.storageAccount.createContainerIfNotExists(container, err => {
        if (err) {
          return reject(err);
        }
        this._memCache[container] = this._memCache[container] || new MemCache();
        resolve();
      });
    });
  }
}
