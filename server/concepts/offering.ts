import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface OfferDoc extends BaseDoc {
  offerer: ObjectId;
  item: ObjectId;
  imageUrl: string;
  location: string;
  message: string;
  accepted: boolean;
}

/**
 * concept: Offering
 */
export default class OfferingConcept {
  public readonly offers: DocCollection<OfferDoc>;

  /**
   * Make an instance of Offering.
   */
  constructor(collectionName: string) {
    this.offers = new DocCollection<OfferDoc>(collectionName);
  }

  async offer(offerer: ObjectId, item: ObjectId, location: string, imageUrl?: string, message?: string) {
    const _id = await this.offers.createOne({ offerer, item, imageUrl, location, message, accepted: false });
    const offer = await this.offers.readOne({ _id });
    return { msg: "Successfully sent offer!", offer: offer };
  }

  async accept(offerId: ObjectId) {
    await this.offers.partialUpdateOne({ _id: offerId }, { accepted: true });
    return { msg: `Successfully accepted offer! ${offerId}` };
  }

  async editOffer(offerId: ObjectId, imageUrl?: string, location?: string, message?: string) {
    await this.offers.partialUpdateOne({ _id: offerId }, { imageUrl, location, message });
    return { msg: "Successfully edited offer!" };
  }

  async removeOffer(offerId: ObjectId) {
    await this.offers.deleteOne({ _id: offerId });
    return { msg: "Successfully removed offer!" };
  }

  async removeAllItemOffers(itemId: ObjectId) {
    await this.offers.deleteMany({ item: itemId });
    return { msg: "Successfully removed all offers for item!" };
  }

  async getOfferById(offerId: ObjectId) {
    const offer = await this.offers.readOne({ _id: offerId });
    if (offer) {
      return offer;
    }
    throw new NotAllowedError("Offer does not exist.");
  }

  async getOfferByOfferer(offererId: ObjectId) {
    return await this.offers.readMany({ offerer: offererId });
  }

  async getOfferByItem(itemId: ObjectId) {
    return await this.offers.readMany({ item: itemId });
  }

  async getAllOffers() {
    return await this.offers.readMany({});
  }

  async checkAuthor(offerId: ObjectId, offerer: ObjectId) {
    const match = await this.offers.readOne({ _id: offerId, offerer: offerer });
    if (match) {
      return true;
    }
    return false;
  }
}
