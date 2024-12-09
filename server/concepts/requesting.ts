import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface RequestDoc extends BaseDoc {
  requester: ObjectId;
  name: string;
  quantity: number;
  hidden: boolean;
  image?: string;
  description?: string;
}

/**
 * concept: Requesting
 */
export default class RequestingConcept {
  public readonly requests: DocCollection<RequestDoc>;

  /**
   * Make an instance of Requesting.
   */
  constructor(collectionName: string) {
    this.requests = new DocCollection<RequestDoc>(collectionName);
  }

  async add(requester: ObjectId, name: string, quantity: number, image?: string, description?: string) {
    const hidden = false;
    const _id = await this.requests.createOne({ requester, name, quantity, hidden, image, description });
    const request = await this.requests.readOne({ _id });
    return { msg: "Request successfully created!", request };
  }

  async edit(requester: ObjectId, _id: ObjectId, name?: string, quantity?: number, image?: string, description?: string) {
    await this.assertAuthor(_id, requester);
    await this.requests.partialUpdateOne({ _id }, { name, quantity, image, description });
    return { msg: "Request successfully updated!" };
  }

  async delete(_id: ObjectId) {
    //request is removed from requests
    await this.requests.deleteOne({ _id });
    return { msg: "Request deleted successfully!" };
  }

  async hideSwitch(_id: ObjectId) {
    const request = await this.requests.readOne({ _id });
    if (!request) {
      throw new NotFoundError(`Request ${_id} does not exist!`);
    }
    const hidden = !request.hidden;
    await this.requests.partialUpdateOne({ _id }, { hidden });
    return { msg: "Request successfully updated!" };
  }

  async getRequestById(_id: ObjectId) {
    const request = await this.requests.readOne({ _id });
    if (!request) {
      throw new NotFoundError(`Request ${_id} does not exist!`);
    }

    return request;
  }

  async getRequests() {
    return await this.requests.readMany({}, { sort: { _id: -1 } });
  }

  async getRequestsOngoing() {
    const hidden = false;
    return await this.requests.readMany({ hidden }, { sort: { _id: -1 } });
  }

  async getByRequester(requester: ObjectId) {
    return await this.requests.readMany({ requester }, { sort: { _id: -1 } });
  }

  //assert author
  async assertAuthor(_id: ObjectId, user: ObjectId) {
    const request = await this.requests.readOne({ _id });
    if (!request) {
      throw new NotFoundError(`Request ${_id} does not exist!`);
    }
    if (request.requester.toString() !== user.toString()) {
      throw new RequestAuthorNotMatchError(user, _id);
    }
  }

  async getNumberOfRequestsByRequester(requester: ObjectId) {
    return await this.requests.count({ requester });
  }
}

export class RequestAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly requester: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", requester, _id);
  }
}
