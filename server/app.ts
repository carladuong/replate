import AuthenticatingConcept from "./concepts/authenticating";
import ListingConcept from "./concepts/listing";
import OfferingConcept from "./concepts/offering";
import RequestingConcept from "./concepts/requesting";
import ReviewingConcept from "./concepts/reviewing";
import SessioningConcept from "./concepts/sessioning";
import ClaimingConcept from "./concepts/claiming";

import ExpiringConcept from "./concepts/expiring";

import ReportingConcept from "./concepts/reporting";
// import TaggingConcept from "./concepts/tagging";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Listing = new ListingConcept("listings");
export const Requesting = new RequestingConcept("requests");
export const Reviewing = new ReviewingConcept("reviews");
export const Claiming = new ClaimingConcept("claims");
export const Offering = new OfferingConcept("offers");
export const Request_Expiring = new ExpiringConcept("request_expirations");
export const Listing_Expiring = new ExpiringConcept("listing_expirations");

export const Reporting = new ReportingConcept("reports");
// export const Tagging = new TaggingConcept("tags");
//   }
