import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface ClaimDoc extends BaseDoc {
  claimer: ObjectId;
  quantity: number;
  item: ObjectId;
}

/**
 * concept: Claiming
 */
export default class ClaimingConcept {
  public readonly claims: DocCollection<ClaimDoc>;

  /**
   * Make an instance of Claiming.
   */
  constructor(collectionName: string) {
    this.claims = new DocCollection<ClaimDoc>(collectionName);
  }

  async claim(claimer: ObjectId, quantity: number, item: ObjectId) {
    const _id = await this.claims.createOne({ claimer, quantity, item });
    return { msg: "Successfully claimed item!" };
  }

  async unclaim(claimId: ObjectId) {
    if (!this.checkIfClaimed(claimId)) {
      throw new ObjectNotClaimedError();
    }
    await this.claims.deleteOne({ claimId });
    return { msg: "Successfully unclaimed item!" };
  }

  async deleteAllClaimsOnItem(itemId: ObjectId) {
    if (!this.checkIfClaimed(itemId)) {
      throw new ObjectNotClaimedError();
    }
    await this.claims.deleteMany({ item: itemId });
    return { msg: "Successfully deleted claims on item!" };
  }

  async checkIfClaimed(item: ObjectId) {
    const claim = await this.claims.readOne({ item: item });
    if (claim) {
      return true;
    }
    return false;
  }

  async getClaimById(claimId: ObjectId) {
    const claim = await this.claims.readOne({ _id: claimId });
    if (claim) {
      return claim;
    }
    throw new NotAllowedError("Claim does not exist.");
  }

  async getClaimsByListing(listingId: ObjectId) {
    if (!this.checkIfClaimed(listingId)) {
      throw new ObjectNotClaimedError();
    }
    return await this.claims.readMany({ item: listingId });
  }

  async getClaimsByClaimer(claimerId: ObjectId) {
    return await this.claims.readMany({ claimer: claimerId });
  }

  async getAllClaims() {
    return await this.claims.readMany({});
  }
}

export class ObjectNotClaimedError extends NotAllowedError {
  constructor() {
    super("Item has not been claimed!");
  }
}
