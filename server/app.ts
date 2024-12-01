import AuthenticatingConcept from "./concepts/authenticating";
import ListingConcept from "./concepts/listing";
import RequestingConcept from "./concepts/requesting";
import SessioningConcept from "./concepts/sessioning";
import ExpiringConcept from "./concepts/expiring";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Listing = new ListingConcept("listings");
export const Requesting = new RequestingConcept("requests");
export const Request_Expiring = new ExpiringConcept("request_expirations");
export const Listing_Expiring = new ExpiringConcept("listing_expirations");

//   }
