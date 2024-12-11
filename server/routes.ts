import { ObjectId } from "mongodb";
import { z } from "zod";

import { Authing, Claiming, Listing, Listing_Expiring, Offering, Reporting, Request_Expiring, Requesting, Reviewing, Sessioning, Tagging } from "./app";
import { NotAllowedError, NotFoundError } from "./concepts/errors";
import { SessionDoc } from "./concepts/sessioning";
import { Router, getExpressRouter } from "./framework/router";
import Responses from "./responses";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  /*  
  Sessioning
  */
  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.get("/username/:userId")
  async getUsername(userId: string) {
    const oid = new ObjectId(userId);
    return await Authing.getUserById(oid);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string, phone: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password, phone);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  /* 
  Listing
  */

  @Router.get("/listings")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getListings(author?: string) {
    let listings;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      listings = await Listing.getByAuthor(id);
    } else {
      listings = await Listing.getAllListings();
    }
    return Responses.listings(listings);
  }

  @Router.get("/listings/:id")
  async getListingByID(id: string) {
    //console.log("in listing routes");
    const oid = new ObjectId(id);
    const listing = await Listing.getListingById(oid);
    return Responses.listing(listing);
    // return listing
  }

  @Router.post("/listings")
  async addListing(session: SessionDoc, name: string, meetup_location: string, image: string, quantity: number, expireDate: string, description: string, tags: string[]) {
    const user = Sessioning.getUser(session);
    const created = await Listing.addListing(user, name, meetup_location, image, quantity, description, tags);

    if (created.listing) {
      const create_expireObj = await Listing_Expiring.allocate(created.listing._id, expireDate, "00:00");
      for (const tag of tags) {
        await Tagging.tagItem(created.listing._id, tag);
      }
      return { msg: created.msg, listing: await Responses.listing(created.listing) };
    }
  }

  @Router.patch("/listings/:id")
  async editlisting(session: SessionDoc, id: string, name?: string, meetup_location?: string, image?: string, quantity?: number, expireDate?: string, description?: string, tags?: string[]) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    const updatedListing = await Listing.editlisting(oid, name, meetup_location, image, quantity, description, tags);
    //update Expiring date for oid
    return updatedListing;
  }

  @Router.delete("/listings/:id")
  async deleteListing(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    return Listing.delete(oid);
  }

  //add system action that hides expired listings and requests

  /* 
  Requesting
  */
  @Router.get("/requests")
  async getRequests(requester?: string) {
    let requests;
    if (requester) {
      const user_id = (await Authing.getUserByUsername(requester))._id;
      requests = await Requesting.getByRequester(user_id);
    } else {
      requests = await Requesting.getRequests();
    }
    return Responses.requests(requests);
  }

  @Router.get("/requests/:id")
  async getRequest(id: string) {
    const oid = new ObjectId(id);
    return Responses.request(await Requesting.getRequestById(oid));
  }

  //add needed by
  // add synchronization with tagging
  @Router.post("/requests")
  async addRequest(session: SessionDoc, name: string, quantity: number, needBy: string, image?: string, description?: string) {
    const user = Sessioning.getUser(session);
    const created = await Requesting.add(user, name, quantity, image, description);
    //expiration date of the resource
    if (created.request) {
      const create_needBy = await Request_Expiring.allocate(created.request._id, needBy, "00:00");
      return { msg: created.msg, request: await Responses.request(created.request) };
    }
  }

  //handles editing and hiding request by author (we also use hide request in a synchronization when offer is accepted etc)
  //set hideSwitch to true for "hide" button in the requesting front end
  @Router.patch("/requests/:id")
  async updateRequest(session: SessionDoc, id: string, name?: string, quantity?: number, image?: string, description?: string, hideSwitch?: boolean) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    if (hideSwitch) {
      await Requesting.assertAuthor(oid, user);
      await Requesting.hideSwitch(oid);
    } else {
      await Requesting.edit(user, oid, name, quantity, image, description);
    }
    return await Requesting.getRequestById(oid);
  }

  @Router.delete("/requests/:id")
  async deleteRequest(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Requesting.assertAuthor(oid, user);

    const RequestExp = await Request_Expiring.getExpireByItem(oid);
    await Request_Expiring.delete(RequestExp._id);

    await Offering.removeAllItemOffers(oid);

    return Requesting.delete(oid);
  }

  /*
  Claming
  */
  @Router.post("/claims")
  async claim(session: SessionDoc, listingId: string, quantity: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(listingId);
    const listing = await Listing.getListingById(oid);
    if (quantity <= listing.quantity) {
      const newQuantity = listing.quantity - quantity;
      const created = await Claiming.claim(user, quantity, oid);
      await Listing.editlisting(oid, listing.name, listing.meetup_location, listing.image, newQuantity);
      console.log(listing);
      if (quantity === listing.quantity) {
        await Listing.hideSwitch(oid);
      }
      return { msg: created.msg, claim: await Responses.claim(created.claim) };
    } else {
      return { msg: "Attempted to claim more items than are available." };
    }
  }

  @Router.get("/claims")
  async getClaims(listingId?: string, claimer?: string) {
    let claims;
    if (listingId) {
      const listingIdObj = new ObjectId(listingId);
      claims = await Claiming.getClaimsByListing(listingIdObj);
    } else if (claimer) {
      console.log("getting claimer ", claimer);
      const oid = (await Authing.getUserByUsername(claimer))._id;
      claims = await Claiming.getClaimsByClaimer(oid);
    } else {
      claims = await Claiming.getAllClaims();
    }
    return Responses.claims(claims);
  }

  @Router.get("/claims/:id")
  async getClaim(claimId: string) {
    const oid = new ObjectId(claimId);
    return Responses.claim(await Claiming.getClaimById(oid));
  }

  @Router.delete("/claims/:id")
  async unclaimItem(session: SessionDoc, claimId: string) {
    const oid = new ObjectId(claimId);
    await Claiming.unclaim(oid);
    //Listing edit quantity
  }

  /*
  Offering
  */

  @Router.post("/offers")
  async offer(session: SessionDoc, requestId: string, location: string, image?: string, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(requestId);
    //get request and check it exist
    //check user not author
    const created = await Offering.offer(user, oid, location, image, message);
    return { msg: created.msg, offer: Responses.offer(created.offer) };
  }

  @Router.get("/offers")
  async getOffers(requestId?: string, offerer?: string) {
    if (requestId) {
      const oid = new ObjectId(requestId);
      return await Responses.offers(await Offering.getOfferByItem(oid));
    } else if (offerer) {
      const oid = (await Authing.getUserByUsername(offerer))._id;
      return await Responses.offers(await Offering.getOfferByOfferer(oid));
    } else {
      return await Responses.offers(await Offering.getAllOffers());
    }
  }

  @Router.get("/offers/:offerId")
  async getOffer(offerId: string) {
    console.log("in routes");
    const oid = new ObjectId(offerId);
    const offer = await Offering.getOfferById(oid);
    return offer;
  }

  @Router.patch("/offers/hide")
  async acceptOffer(session: SessionDoc, offerId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    const offer = await Offering.getOfferById(oid);
    await Requesting.hideSwitch(offer.item);
    await Offering.accept(oid);
    // await Offering.removeAllItemOffers(offer.item);
    return { msg: "Accepted offer!" };
    //get offer check it exists
    //get offer check it exists and user is not author
    //Offering.accept(offerId) will  hide the offer and
    //get request of the offer
    //Requesting.hideSwitch(item)
  }

  @Router.patch("/offers/:id")
  async editOffer(session: SessionDoc, offerId: string, image?: string, location?: string, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    const offer = await Offering.getOfferById(oid); //check if exists and user is offerer
    await Offering.editOffer(oid, image, location, message);
  }

  @Router.delete("/offers/:offerId")
  async deleteOffer(session: SessionDoc, offerId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    const offer = await Offering.getOfferById(oid);
    if (await Offering.checkAuthor(oid, user)) {
      return await Offering.removeOffer(oid);
    }
  }

  @Router.post("/reviews")
  async review(session: SessionDoc, subjectId: string, rating: number, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(subjectId);
    //Claiming.checkIfClaimed(user, oid)
    const created = await Reviewing.add(user, oid, rating, message);
    return { msg: created.msg, review: Responses.review(created.post) };
  }

  @Router.patch("/reviews/:id")
  async editReview(session: SessionDoc, id: string, rating?: number, message?: string) {
    console.log("Received ID:", id);
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Reviewing.edit(oid, user, rating, message);
  }

  @Router.delete("/reviews/:id")
  async deleteReview(session: SessionDoc, reviewId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(reviewId);
    return await Reviewing.delete(user, oid);
  }

  @Router.get("/reviews")
  async getReviews(subjectId?: string) {
    let reviews;
    //get reviews on the user
    if (subjectId) {
      const oid = new ObjectId(subjectId);
      reviews = await Reviewing.getReviewsOfSubject(oid);
    } else {
      //otherwise get all reviews
      reviews = await Reviewing.getReviews();
    }
    return Responses.reviews(reviews);
  }

  @Router.get("/reviews/:id")
  async getReview(id: string) {
    const oid = new ObjectId(id);
    return Responses.review(await Reviewing.getReviewById(oid));
  }

  @Router.get("/reviews/average")
  async getAverageRating(subjectId: string) {
    console.log(subjectId);
    const oid = new ObjectId(subjectId);
    const reviews = await Reviewing.getReviewsOfSubject(oid);

    if (reviews.length > 0) {
      const ratings = reviews.map((review) => review.rating);
      return ratings.reduce((a, b) => a + b) / ratings.length;
    } else {
      return 0; // No reviews, return 0
    }
  }
  @Router.post("/reports")
  async report(session: SessionDoc, reportedId: string, message?: string) {
    // Retrieve the reporting user from the session
    const user = Sessioning.getUser(session);

    // Validate and convert reportedId to ObjectId
    let oid: ObjectId;
    try {
      oid = new ObjectId(reportedId);
    } catch (_) {
      throw new NotAllowedError("Invalid reportedId format.");
    }

    // Fetch the reported entity to ensure it exists
    const reported = await Authing.getUserById(oid);
    if (!reported) {
      throw new NotFoundError(`Entity with ID ${reportedId} does not exist.`);
    }

    // Create the report
    const reportResult = await Reporting.report(user, oid, message);
    return { msg: reportResult.msg, report: reportResult.report };
  }

  @Router.get("/reports")
  async getNumberOfReports(session: SessionDoc, reportedId: string) {
    const oid = new ObjectId(reportedId);
    const countReports = await Reporting.getNumberOfReports(oid);
    console.log("Number of reports: " + countReports);
    const isUserReported = await Reporting.checkIfUserReported(oid);
    return { message: `User has been reported: ${isUserReported}`, "numberOfReports:": countReports };
  }

  @Router.get("/expirations/:listingId") //getting expiration by item
  async getExpirationOfItem(listingId: string) {
    const oid = new ObjectId(listingId);
    return await Listing_Expiring.getExpireByItem(oid);
  }

  @Router.patch("/expirations/:id")
  async editExpirationDate(session: SessionDoc, id: string, expireDate: string) {
    const oid = new ObjectId(id);
    const user = Sessioning.getUser(session);

    //await Listing.assertAuthorIsUser(expire.item, user);
    await Listing_Expiring.editExpiration(oid, expireDate, "00:00");
  }

  // @Router.get("expirations/item")
  // async getExpireOfItem(itemId: string) {
  //   const oid = new ObjectId(itemId);
  //   return await Listing_Expiring.getExpireByItem(oid);
  // }

  //routes for displaying the count in profile
  @Router.get("/userCounts/:userId")
  async getUserCounts(userId: string) {
    const oid = new ObjectId(userId);
    const listings = await Listing.getNumberOfListingsByAuthor(oid);
    const requests = await Requesting.getNumberOfRequestsByRequester(oid);
    // const offers = await Offering.getNumberOfOffersByOfferer(oid);
    // const claims = await Claiming.getClaimsByClaimer(oid);
    // const reviews = await Reviewing.getReviewsOfSubject(oid);
    return { listings: listings, requests: requests };
  }

  @Router.get("/tagged/:tag")
  async getItemsWithTag(tag: string) {
    return await Tagging.getItemsWithTag(tag)
  }

  @Router.post("/tags/:tag")
  async createTag(tag:string) {
    return await Tagging.createTag(tag);
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
