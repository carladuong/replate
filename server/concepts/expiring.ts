import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ExpiringDoc extends BaseDoc {
  item: ObjectId;
  expireAt: Date;
}

/**
 * concept: Expiring [Item]
 */
export default class ExpiringConcept {
  public readonly expirings: DocCollection<ExpiringDoc>;

  /**
   * Make an instance of Expiring.
   */
  constructor(collectionName: string) {
    this.expirings = new DocCollection<ExpiringDoc>(collectionName);
  }


  async allocate(itemId: ObjectId, expirationString: string) {
    const [month, day, year] = expirationString.split("/").map(Number);
    const expirationDate = new Date(year, month - 1, day);

    const ttlSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
    if (ttlSeconds <= 0) {
      throw new Error("Expiration date must be in the future.");
    }
  
    const expirationObj = await this.expirings.createOne({ item: itemId, expireAt: expirationDate});
    return { msg: "Expiration Created:" + expirationObj};
  }


  async editExpiration(_id: ObjectId, expirationString: string){
    const [month, day, year] = expirationString.split("/").map(Number);
    const expireAt = new Date(year, month - 1, day);
    const updateDoc = { expireAt }; // The object structure should match the ExpiringDoc
  
    // Now call partialUpdateOne with the correct object format
    await this.expirings.partialUpdateOne({ _id }, updateDoc);
  
    return { msg: "Listing successfully created!: ",  };
  }
   
  async getAllExpired(){
    const expireAt = new Date(); //today
    return await this.expirings.readMany({ expireAt });

  }

  async delete(_id: ObjectId) {
    await this.expirings.deleteOne({ _id });
    return { msg: "Listing deleted successfully!" };
  }
}

