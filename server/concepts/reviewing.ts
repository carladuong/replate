import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ReviewDoc extends BaseDoc {
  reviewer: ObjectId;
  subject: ObjectId; //user
  rating: number;
  message?: string;
}

/**
 * concept: Reviewing
 */
export default class ReviewingConcept {
  public readonly reviews: DocCollection<ReviewDoc>;

  /**
   * Make an instance of Reviewing.
   */
  constructor(collectionName: string) {
    this.reviews = new DocCollection<ReviewDoc>(collectionName);
  }

  async getReviewById(_id: ObjectId) {
    return await this.reviews.readOne({ _id });
  }
  async getReviews() {
    return await this.reviews.readMany({}, { sort: { _id: -1 } });
  }

  async getReviewsOfSubject(subject: ObjectId) {
    return await this.reviews.readMany({ subject }, { sort: { _id: -1 } });
  }

  async add(reviewer: ObjectId, subject: ObjectId, rating: number, message?: string) {
    const _id = await this.reviews.createOne({ reviewer, subject, rating, message });
    return { msg: "Review successfully created!", post: await this.reviews.readOne({ _id }) };
  }

  async edit(reviewer: ObjectId, _id: ObjectId, rating?: number, message?: string) {
    await this.assertAuthor(_id, reviewer);
    await this.reviews.partialUpdateOne({ _id }, { rating, message });
    return { msg: "Review successfully updated!" };
  }

  async delete(reviewer: ObjectId, _id: ObjectId) {
    await this.assertAuthor(_id, reviewer);
    await this.reviews.deleteOne({ _id });
    return { msg: "Review deleted successfully!" };
  }

  //assert author
  async assertAuthor(_id: ObjectId, user: ObjectId) {
    const review = await this.reviews.readOne({ _id });
    if (!review) {
      throw new NotFoundError(`Review ${_id} does not exist!`);
    }
    if (review.reviewer.toString() !== user.toString()) {
      throw new ReviewAuthorNotMatchError(user, _id);
    }
  }
}

export class ReviewAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly reviewer: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of review {1}!", reviewer, _id);
  }
}
