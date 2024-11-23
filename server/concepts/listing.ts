import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


/* export interface ListOptions {
  backgroundColor?: string;       //if I wanted to let users edit the background color of their 
} */

export interface ListingDoc extends BaseDoc {
  author: ObjectId;
  name: string;
  meetup_location: string;
  image: File;
  quantity: number;
  remaining: number;
  hidden: boolean;
  // options?: ListOptions;
}

/**
 * concept: Listing [Author]
 */
export default class ListingConcept {
  public readonly listings: DocCollection<ListingDoc>;

  /**
   * Make an instance of Listing.
   */
  constructor(collectionName: string) {
    this.listings = new DocCollection<ListingDoc>(collectionName);
  }


  async addListing(author: ObjectId, name: string, meetup_location: string, image: File, quantity: number ) {
    const remaining= quantity;     //quantity remaining is set to quantity because it is the same when the listing is just created, no user input in that field
    const hidden= false;
    const _id = await this.listings.createOne({ author, name, meetup_location, image, quantity, remaining , hidden});
    const listing = await this.listings.readOne({ _id }); 
    return { msg: "Listing successfully created!", listing};

  }

  async delete(_id: ObjectId) {
    await this.listings.deleteOne({ _id });
    return { msg: "Listing deleted successfully!" };}

  async editlisting(_id: ObjectId, name?: string, meetup_location?: string, image?: File, quantity?: number) {// questions about , remaining?: number, hidden?: boolean
    await this.listings.partialUpdateOne({ _id }, { name, meetup_location, image, quantity});
    return { msg: "Listing successfully updated!" };
  }


  async getAllListings() {
    return await this.listings.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.listings.readMany({ author });
  }

  async getRemainingQuantity(_id: ObjectId) {
    const listing = await this.listings.readOne({ _id });
    if (!listing) {
        throw new NotFoundError(`Listing ${_id} does not exist!`);
      }
    const remaining= await listing.remaining;
    return { msg: "Remaining quantity",  remaining};

  }

  async updateRemainingQuantity(_id:ObjectId, substract: number) {
    const listing = await this.listings.readOne({ _id });
    if (!listing) {
        throw new NotFoundError(`Listing ${_id} does not exist!`);
      }
    const currentRemaining= await listing.remaining;
    const updatedRemaining= currentRemaining - substract;
    await this.listings.partialUpdateOne({ _id }, {remaining: updatedRemaining});
    
    if (updatedRemaining == 0){
        await this.listings.partialUpdateOne({ _id }, {hidden: true});
    }

    return { msg: "Listing successfully updated!" };
  }


  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const listing = await this.listings.readOne({ _id });
    if (!listing) {
      throw new NotFoundError(`Listing ${_id} does not exist!`);
    }
    if (listing.author.toString() !== user.toString()) {
      throw new ListingAuthorNotMatchError(user, _id);
    }
  }

}

export class ListingAuthorNotMatchError extends NotAllowedError {
    constructor(
      public readonly author: ObjectId,
      public readonly _id: ObjectId,
    ) {
      super("{0} is not the author of listing {1}!", author, _id);
    }
  }