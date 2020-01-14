import ValueSchema from "../models/Value";
import { VALUE } from "./Collections";
import mongoose from "mongoose";

class DbContext {
  Values = mongoose.model(VALUE, ValueSchema);
}

export const dbContext = new DbContext();
