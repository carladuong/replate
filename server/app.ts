import AuthenticatingConcept from "./concepts/authenticating";
import SessioningConcept from "./concepts/sessioning";
import ListingConcept from "./concepts/listing";
import RequestingConcept from "./concepts/requesting";
// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Listing = new ListingConcept("listings");
export const Requesting = new RequestingConcept("requests");
//   }
