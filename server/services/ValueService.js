import { dbContext } from "../db/DbContext";

class ValuesService {
  async find(query) {
    let values = await dbContext.Values.find(query);
    return values;
  }

  async findAndPopulate(query, populate) {
    return await dbContext.Values.find(query).populate(populate);
  }

  async findById(id) {
    let value = await dbContext.Values.findById(id);
    return value;
  }

  async create(valueData) {
    dbContext.Values.create(valueData);
  }

  async update(id, update) {
    let value = await dbContext.Values.findByIdAndUpdate(id, update, {
      new: true
    });
    return value;
  }
  async delete(id) {
    await dbContext.Values.findByIdAndRemove(id);
  }
}

export const valuesService = new ValuesService();
