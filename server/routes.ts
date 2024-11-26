import { ObjectId } from "mongodb";


import { Router, getExpressRouter } from "./framework/router";
import { Authing, Sessioning, Listing} from "./app";
import { SessionDoc } from "./concepts/sessioning";
import { z } from "zod";
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

  @Router.post("/listings")
  async addListing(session: SessionDoc, name: string, meetup_location: string, image: string , quantity: number ) { //change img back to File
    const user = Sessioning.getUser(session);
    const created = await Listing.addListing(user, name, meetup_location, image, quantity );
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


  /* 
  Claiming
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
    return Requesting.getRequestById(oid);
  }
 
 
  @Router.delete("/requests/:id")
  async deleteRequest(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Requesting.assertAuthor(oid, user);
    return Requesting.delete(oid);
  }
 




}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
