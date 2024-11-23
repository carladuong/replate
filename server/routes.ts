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
  async addListing(session: SessionDoc, name: string, meetup_location: string, image: File, quantity: number ) {
    const user = Sessioning.getUser(session);
    const created = await Listing.addListing(user, name, meetup_location, image, quantity );
    return { msg: created.msg, listing: await Responses.listing(created.listing) };
  }

  @Router.patch("/listings/:id")
  async editlisting(session: SessionDoc, id: string, name?: string, meetup_location?: string, image?: File, quantity?: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    return await Listing.editlisting(oid, name, meetup_location, image, quantity);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    return Listing.delete(oid);
  }

  @Router.get("/posts/:id")
  async getRemainingQuantity(session: SessionDoc, id: string) {
    const oid = new ObjectId(id);
    const remaining = await Listing.getRemainingQuantity(oid)
    return {msg: remaining.msg}
  }

  @Router.patch("/listings/:id")
  async updateRemainingQuantity(session: SessionDoc, id: string, substract: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Listing.assertAuthorIsUser(oid, user);
    return await Listing.updateRemainingQuantity(oid, substract);
  }



}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
