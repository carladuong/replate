import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
// Ensure correct import path

export interface ListingDoc extends BaseDoc {
  author: ObjectId;
  name: string;
  meetup_location: string;
  image: string; //change back to File after testing with backend
  quantity: number;
  remaining: number;
  hidden: boolean;
  description: string;
  tags: string[];
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

  async addListing(author: ObjectId, name: string, meetup_location: string, image: string, quantity: number, description: string, tags: string[]) {
    const remaining = quantity; //quantity remaining is set to quantity because it is the same when the listing is just created, no user input in that field
    const hidden = false;
    const _id = await this.listings.createOne({ author, name, meetup_location, image, quantity, remaining, hidden, description, tags });
    const listing = await this.listings.readOne({ _id });
    console.log("Incoming data:", { author, name, meetup_location, image, quantity, description, tags });
    return { msg: "Listing successfully created!: ", listing };
  }

  async delete(_id: ObjectId) {
    await this.listings.deleteOne({ _id });
    return { msg: "Listing deleted successfully!" };
  }

  async editlisting(_id: ObjectId, name?: string, meetup_location?: string, image?: string, quantity?: number, description?: string, tags?: string[]) {
    // Create an object with the provided values
    const updateData: Partial<ListingDoc> = { name, meetup_location, image, quantity, description, tags };

    // Filter out properties that are undefined
    const filteredUpdateData = Object.fromEntries(Object.entries(updateData).filter(([value]) => value !== undefined));

    // Pass only the filtered update data to the partial update
    await this.listings.partialUpdateOne({ _id }, filteredUpdateData);

    return { msg: "Listing successfully updated!" };
  }
  async getListingById(_id: ObjectId) {
    const listing = await this.listings.readOne({ _id });
    if (!listing) {
      throw new NotFoundError(`Listing ${_id} does not exist!`);
    }

    return listing;
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
    const remaining = await listing.remaining;
    return { msg: "Remaining quantity: " + remaining };
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
