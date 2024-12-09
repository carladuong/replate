import { Authing } from "./app";
import { ClaimDoc } from "./concepts/claiming";
import { ListingDoc } from "./concepts/listing";
import { OfferDoc } from "./concepts/offering";
import { RequestDoc } from "./concepts/requesting";
import { ReviewDoc } from "./concepts/reviewing";
import { TaggingDoc } from "./concepts/tagging";
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
   * Convert ReviewtDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async review(review: ReviewDoc | null) {
    if (!review) {
      return review;
    }
    const requester = await Authing.getUserById(review.reviewer);
    return { ...review, reviewer: requester.username };
  }

  /**
   * Convert OfferDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async offer(offer: OfferDoc | null) {
    if (!offer) {
      return offer;
    }
    const offerer = await Authing.getUserById(offer.offerer);
    return { ...offer, offerer: offerer.username };
  }

  /**
   * Convert OfferDoc into more readable format for the frontend by converting the author id into a username.
   */

  static async claim(claim: ClaimDoc | null) {
    if (!claim) {
      return claim;
    }
    const claimer = await Authing.getUserById(claim.claimer);
    return {
      ...claim,
      claimer: claimer.username,
      claimerPhone: claimer.phone, // Include if needed
      // Note: Do not include authorPhone here as it's being handled separately in the route
    };
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

  /**
   * Same as {@link review} but for an array of ReviewDoc for improved performance.
   */
  static async reviews(reviews: ReviewDoc[]) {
    const reviewers = await Authing.idsToUsernames(reviews.map((review) => review.reviewer));
    return reviews.map((review, i) => ({ ...review, reviewer: reviewers[i] }));
  }

  /**
   * Same as {@link offer} but for an array of OfferwDoc for improved performance.
   */
  static async offers(offers: OfferDoc[]) {
    const offerers = await Authing.idsToUsernames(offers.map((offer) => offer.offerer));
    return offers.map((offer, i) => ({ ...offer, offerer: offerers[i] }));
  }

  /**
   * Same as {@link claim} but for an array of ClaimDoc for improved performance.
   */
  static async claims(claims: ClaimDoc[]) {
    const claimers = await Authing.idsToUsernames(claims.map((claim) => claim.claimer));
    return claims.map((claim, i) => ({ ...claim, claimer: claimers[i] }));
  }

  static report(reportResult: { _id: string; reporter: string; reported: string; message: string; createdAt: Date }) {
    return {
      id: reportResult._id,

      reporter: reportResult.reporter,

      reported: reportResult.reported,

      message: reportResult.message,

      createdAt: reportResult.createdAt,
    };
  }
  static async tag(tag: TaggingDoc) {
    return {
      _id: tag._id,
      name: tag.name,
      taggedItems: tag.taggedItems,
    };
  }
}
