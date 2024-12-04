import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";
import DocCollection from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface TaggingDoc extends BaseDoc {
  name: string;
  taggedItems: ObjectId[];
}

/**
 * concept: Tagging
 */
export default class TaggingConcept {
  public readonly tags: DocCollection<TaggingDoc>;

  /**
   * Create an instance of Tagging.
   */
  constructor(collectionName: string) {
    this.tags = new DocCollection<TaggingDoc>(collectionName);
  }

  /**
   * Create a new tag or list of tags
   */
  async createTag(names: string | string[]) {
    const tagNames = Array.isArray(names) ? names : [names];
    const createdTags = [];

    for (const name of tagNames) {
      const existingTag = await this.tags.readOne({ name });
      if (existingTag) {
        throw new NotAllowedError(`Tag '${name}' already exists!`);
      }

      const _id = await this.tags.createOne({ name, taggedItems: [] });
      const tag = await this.tags.readOne({ _id });
      createdTags.push(tag);
    }

    return { msg: "Tags successfully created!", tags: createdTags };
  }

  async getTagByName(name: string): Promise<TaggingDoc | null> {
    return await this.tags.readOne({ name });
  }

  async getTagsByNames(names: string[]): Promise<string[]> {
    const tags = await this.tags.readMany({ name: { $in: names } });

    if (tags.length !== names.length) {
      throw new NotFoundError("One or more tags not found.");
    }

    return tags.map((tag) => tag.name);
  }

  /**
   * Tag an item with an existing tag
   */
  async tagItem(item: ObjectId, name: string) {
    const tagDoc = await this.tags.readOne({ name });
    if (!tagDoc) {
      throw new NotFoundError(`Tag '${name}' does not exist!`);
    }
    if (!tagDoc.taggedItems.includes(item)) {
      tagDoc.taggedItems.push(item);
      await this.tags.partialUpdateOne({ _id: tagDoc._id }, { taggedItems: tagDoc.taggedItems });
    }
    return { msg: "Item successfully tagged!" };
  }

  /**
   * Get all items associated with a specific tag
   */
  async getItemsWithTag(name: string) {
    const tagDoc = await this.tags.readOne({ name });
    if (!tagDoc) {
      throw new NotFoundError(`Tag '${name}' does not exist!`);
    }
    return tagDoc.taggedItems;
  }

  /**
   * Remove an item from a tag
   */
  async removeItemFromTag(item: ObjectId, name: string) {
    const tagDoc = await this.tags.readOne({ name });
    if (!tagDoc) {
      throw new NotFoundError(`Tag '${name}' does not exist!`);
    }

    const updatedTaggedItems = tagDoc.taggedItems.filter((taggedItem) => !taggedItem.equals(item));

    if (updatedTaggedItems.length === tagDoc.taggedItems.length) {
      return { msg: `Item was not tagged with '${name}', no changes made.` };
    }

    await this.tags.partialUpdateOne({ _id: tagDoc._id }, { taggedItems: updatedTaggedItems });
    return { msg: `Item successfully removed from tag '${name}'!` };
  }

  async getTagsByIds(tagIds: ObjectId[]): Promise<TaggingDoc[]> {
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      throw new Error("Invalid tag IDs provided.");
    }

    const tags = await this.tags.readMany({ _id: { $in: tagIds } });

    if (tags.length !== tagIds.length) {
      throw new NotFoundError("One or more tags not found.");
    }

    return tags;
  }
  /**
   * Get all available tags
   */
  async getAllTags() {
    const tags = await this.tags.readMany({});
    return { msg: "All tags retrieved successfully!", tags };
  }
}
