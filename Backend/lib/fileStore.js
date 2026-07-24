import Datastore from '@seald-io/nedb';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class FileStore {
  constructor(collectionName) {
    this.db = new Datastore({
      filename: path.join(dataDir, `${collectionName}.db`),
      autoload: true,
    });
  }

  async insert(doc) {
    return new Promise((resolve, reject) => {
      this.db.insert(doc, (err, newDoc) => {
        if (err) reject(err);
        else resolve(newDoc);
      });
    });
  }

  async findOne(query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, (err, doc) => {
        if (err) reject(err);
        else resolve(doc || null);
      });
    });
  }

  async find(query = {}) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  async findWithPagination(query = {}, { page = 1, limit = 50, sort } = {}) {
    const skip = (page - 1) * limit;
    return new Promise((resolve, reject) => {
      let cursor = this.db.find(query);
      if (sort) cursor = cursor.sort(sort);
      cursor.skip(skip).limit(limit).exec((err, docs) => {
        if (err) reject(err);
        else {
          this.db.count(query, (err2, total) => {
            if (err2) reject(err2);
            else resolve({ data: docs, total, page, limit });
          });
        }
      });
    });
  }

  async update(query, update) {
    return new Promise((resolve, reject) => {
      this.db.update(query, { $set: update }, { returnUpdatedDocs: true, multi: false }, (err, num, updatedDoc) => {
        if (err) reject(err);
        else resolve(updatedDoc || null);
      });
    });
  }

  async remove(query) {
    return new Promise((resolve, reject) => {
      this.db.remove(query, { multi: false }, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved > 0);
      });
    });
  }

  async exists(query) {
    return new Promise((resolve, reject) => {
      this.db.count(query, (err, count) => {
        if (err) reject(err);
        else resolve(count > 0);
      });
    });
  }

  async count(query = {}) {
    return new Promise((resolve, reject) => {
      this.db.count(query, (err, count) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }
}

export default FileStore;
