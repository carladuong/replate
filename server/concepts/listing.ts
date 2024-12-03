import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import TaggingConcept from "./tagging"; // Import TaggingConcept

export interface ListingDoc extends BaseDoc {
  author: ObjectId;
  name: string;
  meetup_location: string;
  image: string;
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
  private readonly tagging: TaggingConcept;

  /**
   * Make an instance of Listing.
   */
  constructor(collectionName: string, tagging: TaggingConcept) {
    this.listings = new DocCollection<ListingDoc>(collectionName);
    this.tagging = tagging;
  }

  async addListing(author: ObjectId, name: string, meetup_location: string, image: string, quantity: number, description: string, tags: string[]) {
    const remaining = quantity;
    const hidden = false;
    const _id = await this.listings.createOne({ author, name, meetup_location, image, quantity, remaining, hidden, description, tags });
    const listing = await this.listings.readOne({ _id });

    // Associate tags with the listing
    for (const tag of tags) {
      await this.tagging.tagItem(_id, tag);
    }

    console.log("Incoming data:", { author, name, meetup_location, image, quantity, description, tags });
    return { msg: "Listing successfully created!", listing };
  }

  async delete(_id: ObjectId) {
    await this.listings.deleteOne({ _id });
    return { msg: "Listing deleted successfully!" };
  }

  async editlisting(_id: ObjectId, name?: string, meetup_location?: string, image?: string, quantity?: number, description?: string, tags?: string[]) {
    const updateData: Partial<ListingDoc> = { name, meetup_location, image, quantity, description, tags };
    const filteredUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== undefined));
    await this.listings.partialUpdateOne({ _id }, filteredUpdateData);

    // // Update tags
    // if (tags) {
    //   const listing = await this.listings.readOne({ _id });
    //   if (listing) {
    //     // Remove old tags
    //     for (const tag of listing.tags) {
    //       await this.tagging.removeItemFromTag(_id, tag);
    //     }
    //     // Add new tags
    //     for (const tag of tags) {
    //       await this.tagging.tagItem(_id, tag);
    //     }
    //   }
    // }

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