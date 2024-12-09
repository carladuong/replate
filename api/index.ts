import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import logger from "morgan";
import * as path from "path";
//import cron from "node-cron";
import { ObjectId } from "mongodb";




// The following line sets up the environment variables before everything else.
dotenv.config();

import MongoStore from "connect-mongo";
import { connectDb } from "../server/db";
import { appRouter } from "../server/routes";
import { Authing, Listing, Requesting, Sessioning, Request_Expiring, Listing_Expiring } from "../server/app";  


export const app = express();
const PORT = process.env.PORT || 3000;
app.use(logger("dev"));

app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

app.use(express.json()); // Enable parsing JSON in requests and responses.
app.use(express.urlencoded({ extended: false })); // Also enable URL encoded request and responses.

// Session allows us to store a cookie 🍪.
app.use(
  session({
    secret: process.env.SECRET || "Hello 6.1040",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SRV,
      dbName: "mongo-sessions",
    }),
  }),
);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/", appRouter);

// For all unrecognized requests, return a not found message.
app.all("*", (req, res) => {
  res.status(404).json({
    msg: "Page not found",
  });
});

void connectDb().then(() => {
  app.listen(PORT, () => {
    console.log("Started listening on port", PORT);
  });
});


//Expiring schedule

// cron.schedule("* * * * *", async () => {
//   console.log("Running scheduled tasks...");
//   await handleListingsExpired();
//   await handleRequestsExpired();
// });


// Function to handle expired listings
async function handleListingsExpired() {
  const expiredDocs = await Listing_Expiring.getAllExpired();
  if (!expiredDocs || expiredDocs.length === 0) {
    console.log("No expired listings to process.");
    return;
  }

  for (const doc of expiredDocs) {
    const itemOid = new ObjectId(doc.item);
    const listingExp = await Listing_Expiring.getExpireByItem(itemOid);

    // if listing is expired and still avalable(not hidden) then delete 
    //when item are created hidden is set to false 
    const listing = await Listing.getListingById(itemOid);
    if (listingExp && listing && !listing.hidden) {
      await Listing_Expiring.delete(listingExp._id);
      await Listing.delete(itemOid);
    }
  }
  console.log("Processed expired listings.");
}

// Function to handle expired requests
async function handleRequestsExpired() {
  const expiredDocs = await Request_Expiring.getAllExpired();
  if (!expiredDocs || expiredDocs.length === 0) {
    console.log("No expired requests to process.");
    return;
  }

  for (const doc of expiredDocs) {
    const itemOid = new ObjectId(doc.item);
    const requestExp = await Request_Expiring.getExpireByItem(itemOid);
    // if listing is expired and still avalable(not hidden) then delete 
    //when item are created hidden is set to false 
    if (requestExp && !(await Requesting.getRequestById(itemOid)).hidden ) {
      await Request_Expiring.delete(requestExp._id);
      await Requesting.delete(itemOid);
    }
  }
  console.log("Processed expired requests.");
}


export default app;