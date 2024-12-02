import AuthenticatingConcept from "./concepts/authenticating";
import ClaimingConcept from "./concepts/claiming";
import ListingConcept from "./concepts/listing";
import OfferingConcept from "./concepts/offering";
import RequestingConcept from "./concepts/requesting";
import SessioningConcept from "./concepts/sessioning";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Listing = new ListingConcept("listings");
export const Requesting = new RequestingConcept("requests");
export const Claiming = new ClaimingConcept("claims");
export const Offering = new OfferingConcept("offers");
//   }
