import { ObjectId } from "mongodb";

import { z } from "zod";
import { Authing, Listing, Requesting, Sessioning } from "./app";
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

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
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
    const oid = new ObjectId(id);
    const listing = await Listing.getListingById(oid);
    return Responses.listing(listing);
  }

  @Router.post("/listings")
  async addListing(session: SessionDoc, name: string, meetup_location: string, image: string, quantity: number) {
    //change img back to File
    const user = Sessioning.getUser(session);
    const created = await Listing.addListing(user, name, meetup_location, image, quantity);
    return { msg: created.msg, listing: await Responses.listing(created.listing) };
  }

  @Router.patch("/listings/:id")
  async editlisting(session: SessionDoc, id: string, name?: string, meetup_location?: string, image?: string, quantity?: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    return await Listing.editlisting(oid, name, meetup_location, image, quantity);
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
  async getRequests(requester?: string, include_hidden: boolean = false) {
    let requests;
    if (requester) {
      const user_id = (await Authing.getUserByUsername(requester))._id;
      requests = await Requesting.getByRequester(user_id);
    } else if (include_hidden) {
      requests = await Requesting.getRequests();
    } else {
      requests = await Requesting.getRequestsOngoing();
    }
    return requests;
  }

  @Router.get("/requests/:id")
  async getRequest(id: string) {
    const oid = new ObjectId(id);
    return await Requesting.getRequestById(oid);
  }

  //add needed by
  @Router.post("/requests")
  async addRequest(session: SessionDoc, name: string, quantity: number, needBy: Date, image?: File, description?: string) {
    const user = Sessioning.getUser(session);
    const created = await Requesting.add(user, name, quantity, image, description);
    //call expiring to set needBy date as expiration date of the resource
    return { msg: created };
  }

  //handles editing and hiding request by author (we also use hide request in a synchronization when offer is accepted etc)
  //set hideSwitch to true for "hide" button in the requesting front end
  @Router.patch("/requests/:id")
  async updateRequest(session: SessionDoc, id: string, name?: string, quantity?: number, image?: File, description?: string, hideSwitch?: boolean) {
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
    return Requesting.delete(oid);
  }

  /*
  Claming
  */
  @Router.post("/claims")
  async claim(session: SessionDoc, listingId: string, quantity: number) {
    const user = Sessioning.getUser(session);
    //Reporting.checkIfUserReported(claimer)
    //Claiming.claim(claimer, item, quantity)
    const oid = new ObjectId(listingId);
    //Listing.getListingById(oid)
    //get curr_quantity and calc new_quantity
    //await Listing.editlisting(quantity=new_quantity)
  }

  @Router.get("/claims")
  async getClaims(listingId?: string, claimer?: string) {
    let claims;
    if (listingId) {
      //get all claims for that listing
    } else if (claimer) {
      //get all claims authored by that claimer
    } else {
      //get all claims
    }
    return claims;
  }

  @Router.get("/claims/:id")
  async getClaim(claimId: string) {
    const oid = new ObjectId(claimId);
    // return Claiming/getClaimById(oid)
  }

  @Router.delete("/claims/:id")
  async unclaimItem(session: SessionDoc, claimId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(claimId);
    //Claiming.unclaim(item)
    //Listing edit quantity
  }

  @Router.post("/offers")
  async offer(session: SessionDoc, requestId: string, image: string, location: string, message: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(requestId);
    //set accepted to false
    //get request and check it exist
    //check user not author
    //Offering.offer(user, oid, image, location, message)
  }

  @Router.get("/offers")
  async getOffers(requestId?: string, offerer?: string) {
    if (requestId) {
      //return offers made on request
    } else if (offerer) {
      //return offers made by the user including accepted and not accepted
    } else {
      //return all offers
    }
  }

  @Router.get("/offers/:id")
  async getOffer(offerId: string) {
    const oid = new ObjectId(offerId);
    //return Offering.getOfferById(oid)
  }

  @Router.patch("/offers/hide") //can we select one param in route?
  async acceptOffer(session: SessionDoc, offerId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    //get offer check it exists
    //Offering.accept(offerId) will  hide the offer and
    //get request of the offer
    //Requesting.hideSwitch(item)
  }

  @Router.patch("/offers/:id")
  async editOffer(session: SessionDoc, offerId: string, image?: string, location?: string, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    //get offer check it exists
    //Offering.edit(offer, item, IMG, message)
  }

  @Router.delete("/offers/:id")
  async deleteOffer(session: SessionDoc, offerId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    //get offer check if exists
    //Offering.checkIfAuthor(user, offer)
    //Offering.remove(offer)
  }

  @Router.post("/reviews")
  async review(session: SessionDoc, offerId: string, rating: number, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(offerId);
    //Claiming.checkIfClaimed(user, oid)
    //Reviewing.addReview(user, oid, rating, message)
  }

  @Router.patch("/reviews/:id")
  async editReview(session: SessionDoc, reviewId: string, rating?: number, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(reviewId);
    //Reviewing.checkIfReviewAuthor(user, oid)
    //Reviewing.editReview(user, oid, rating, message)
  }

  @Router.delete("/reviews/:id")
  async deleteReview(session: SessionDoc, reviewId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(reviewId);
    //Reviewing.checkIfReviewAuthor(user, oid)
    //Reviewing.delete(user, oid)
  }

  @Router.get("/reviews")
  async getReviews(userId?: string) {
    const oid = new ObjectId(userId);
    //return reviews on the user
    //otherwise return all reviews
  }

  @Router.get("/reviews/:id")
  async getReview(id: string) {
    const oid = new ObjectId(id);
    //return await Reviewing.getReviewById(oid)
  }

  @Router.post("/reports")
  async report(session: SessionDoc, reportedId: string, message?: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(reportedId);
    const reported = Authing.getUserById(oid);
    //Reporting.checkIfUserReported(user, reported, messsage)
    //Reporting.report(reporter, reported)
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
