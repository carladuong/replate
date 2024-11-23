import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface UserDoc extends BaseDoc {
  requester: ObjectId;
  quantity: number;
  image: File;
  hide: boolean;
}

/**
 * concept: Requesting
 */
export default class RequestingConcept {
  public readonly requests: DocCollection<UserDoc>;

  /**
   * Make an instance of Requesting.
   */
  constructor(collectionName: string) {
    this.requests = new DocCollection<UserDoc>(collectionName);
  }

  async add(author: ObjectId, item: ObjectId, quantity: number) {
    //a request is added to requests containing the requester, a given item, its quantity and (opt) its image
    //hide is set to false
  }

  async edit(request: ObjectId, quantity: number) {
    //request’s quantity if updated to Qt
  }

  async request(request: ObjectId) {
    //request is removed from requests
  }
}
