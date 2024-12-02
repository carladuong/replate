import { Authing } from "./app";
import { ListingDoc } from "./concepts/listing";
import { RequestDoc } from "./concepts/requesting";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link ListingDoc} into a more readable format for the frontend.
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
   * Convert RequestDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async request(request: RequestDoc | null) {
    if (!request) {
      return request;
    }
    const requester = await Authing.getUserById(request.requester);
    return { ...request, requester: requester.username };
  }

  /**
   * Same as {@link listing} but for an array of ListingDoc for improved performance.
   */
  static async listings(listings: ListingDoc[]) {
    const authors = await Authing.idsToUsernames(listings.map((listing) => listing.author));
    return listings.map((listing, i) => ({ ...listing, author: authors[i] }));
  }

  /**
   * Same as {@link request} but for an array of RequestDoc for improved performance.
   */
  static async requests(requests: RequestDoc[]) {
    const requesters = await Authing.idsToUsernames(requests.map((request) => request.requester));
    return requests.map((request, i) => ({ ...request, requester: requesters[i] }));
  }
}
