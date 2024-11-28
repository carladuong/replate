import { Authing } from "./app";
import { ListingDoc } from "./concepts/listing";


/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert ListingDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async listing(listing: ListingDoc | null) {
    if (!listing) {
      return listing;
    }
    const author = await Authing.getUserById(listing.author);
    return { ...listing, author: author.username };
  }

  /**
   * Same as {@link listing} but for an array of ListingDoc for improved performance.
   */
  static async listings(listings: ListingDoc[]) {
    const authors = await Authing.idsToUsernames(listings.map((listing) => listing.author));
    return listings.map((listing, i) => ({ ...listing, author: authors[i] }));
  }  
}

