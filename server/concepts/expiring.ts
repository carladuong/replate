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

  /**
   * Allocate a new expiring item with a date and 24-hour time.
   */
  async allocate(itemId: ObjectId, expirationString: string, expirationTime24hrs: string) {
    const [month, day, year] = expirationString.split("/").map(Number);
    const [hours, minutes] = expirationTime24hrs.split(":").map(Number);

    // Combine date and time into a single Date object
    const expirationDate = new Date(year, month - 1, day, hours, minutes);

    if (expirationDate <= new Date()) {
      throw new Error("Expiration date and time must be in the future.");
    }

    const _id = await this.expirings.createOne({ item: itemId, expireAt: expirationDate });
    const expiringObject = await this.expirings.readOne({ _id });

    return { msg: expiringObject };
  }

  /**
   * Edit the expiration date and/or time of an existing item.
   */
  async editExpiration(_id: ObjectId, expirationString?: string, expirationTime24hrs?: string) {
    if (!expirationString || !expirationTime24hrs) {
      return { msg: "No expiration date or time provided. No updates made." };
    }

    const [month, day, year] = expirationString.split("/").map(Number);
    const [hours, minutes] = expirationTime24hrs.split(":").map(Number);

    const expireAt = new Date(year, month - 1, day, hours, minutes);

    if (expireAt <= new Date()) {
      throw new Error("Expiration date and time must be in the future.");
    }

    const updateDoc = { expireAt };
    await this.expirings.partialUpdateOne({ _id }, updateDoc);

    return { msg: "Expiration date and time successfully updated!" };
  }

  async getAll(){
    const expireAt = new Date(); //today
    return await this.expirings.readMany({}, { sort: { _id: -1 } });
  }

  /**
   * Get all expired items (considering both date and time).
   */
  async getAllExpired() {
    const now = new Date();
    return await this.expirings.readMany({ expireAt: { $lte: now } });
  }

  /**
   * Get a specific expiration record by item.
   */
  async getExpireByItem(item: ObjectId) {
    const expire = await this.expirings.readOne({ item });
    if (!expire) {
      throw new NotFoundError("No expiration record found for the given item ID.");
    }

    return expire;
  }

  /**
   * Delete an expiring item by its ID.
   */
  async delete(_id: ObjectId) {
    await this.expirings.deleteOne({ _id });
    return { msg: "Listing deleted successfully!" };
  }
}





// import { ObjectId } from "mongodb";

// import DocCollection, { BaseDoc } from "../framework/doc";
// import { NotAllowedError, NotFoundError } from "./errors";

// export interface ExpiringDoc extends BaseDoc {
//   item: ObjectId;
//   expireAt: Date;
// }

// /**
//  * concept: Expiring [Item]
//  */
// export default class ExpiringConcept {
//   public readonly expirings: DocCollection<ExpiringDoc>;

//   /**
//    * Make an instance of Expiring.
//    */
//   constructor(collectionName: string) {
//     this.expirings = new DocCollection<ExpiringDoc>(collectionName);
//   }


//   async allocate(itemId: ObjectId, expirationString: string, expirationTime24hrs:) {
//     const [month, day, year] = expirationString.split("/").map(Number);
//     const expirationDate = new Date(year, month - 1, day);

//     // const ttlSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
//     // if (ttlSeconds <= 0) {
//     //   throw new Error("Expiration date must be in the future.");
//     // }
  
//     const _id = await this.expirings.createOne({ item: itemId, expireAt: expirationDate});
//     const expiringObject= await this.expirings.readOne({ _id }) 

//     return { msg: expiringObject};
//   }


//   async editExpiration(_id: ObjectId, expirationString?: string) {
//     // Check if expirationString is provided
//     if (!expirationString) {
//       return { msg: "No expiration date provided. No updates made." };
//     }
    
//     const [month, day, year] = expirationString.split("/").map(Number);
//     const expireAt = new Date(year, month - 1, day);
//     const ttlSeconds = Math.floor((expireAt.getTime() - Date.now()) / 1000);
//     if (ttlSeconds <= 0) {
//       throw new Error("Expiration date must be in the future.");
//     }

//     const updateDoc = { expireAt };
//     await this.expirings.partialUpdateOne({ _id }, updateDoc);
//     return { msg: "Expiration date successfully updated!" };
//   }
  
//   async getAll(){
//     const expireAt = new Date(); //today
//     return await this.expirings.readMany({}, { sort: { _id: -1 } });

//   }

//   async getAllExpired(){
//     const expireAt = new Date(); //today
//     return await this.expirings.readMany({ expireAt });

//   }

//   async getExpireByItem(item: ObjectId){
//     const expire = await this.expirings.readOne({ item })
//     if (!expire) {
//       throw new NotFoundError("No expiration record found for the given item ID.");
//     }
    
//     return expire
//   }

//   async delete(_id: ObjectId) {
//     await this.expirings.deleteOne({ _id });
//     return { msg: "Listing deleted successfully!" };
//   }
// }

