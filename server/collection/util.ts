import type {HydratedDocument, Types} from 'mongoose';
import type {Collection, PopulatedCollection} from './model';
import type {FreetResponse} from '../freet/util';
import {constructFreetResponse} from '../freet/util';

// Update this if you add a property to the Collection type!
type CollectionResponse = {
  _id: string;
  user: string;
  name: string;
  freets: Array<any>;
};

/**
 * Transform a raw Collection object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Collection>} collection - A collection
 * @returns {CollectionResponse} - The collection object formatted for the frontend
 */
const constructCollectionResponse = (collection: HydratedDocument<Collection>): CollectionResponse => {
  const collectionCopy: PopulatedCollection = {
    ...collection.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  
  const { username } = collectionCopy.userId;
  delete collectionCopy.userId;
  return {
    ...collectionCopy,
    name: collectionCopy.name.toString(),
    user: username,
    _id: collectionCopy._id.toString(),
    freets: collectionCopy.freets.map((freet) => formatFreet(freet)),
  };
};

const formatFreet = (freet: any): any => {
  const freetCopy = { ...freet };
  
  // author
  const { username } = freetCopy.authorId;
  delete freetCopy.authorId;
  freetCopy.author = username;

  // refreetOf
  if (freetCopy.refreetOf) {
    const { refreetOf } = freetCopy;
    const { username } = refreetOf.authorId;
    delete refreetOf.authorId;
    refreetOf.author = username;
    freetCopy.refreetOf = refreetOf;
  }

  // replyTo
  if (freetCopy.replyTo) {
    const { replyTo } = freetCopy;
    const { username } = replyTo.authorId;
    delete replyTo.authorId;
    replyTo.author = username;
    freetCopy.refreetOf = replyTo;
  }

  return freetCopy;
}

export {
  constructCollectionResponse,
};
