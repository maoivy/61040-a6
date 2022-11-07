import type {HydratedDocument, Types} from 'mongoose';
import type {Collection, PopulatedCollection} from './model';
import type {Freet} from '../freet/model';
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
  console.log(collectionCopy);
  const { username } = collectionCopy.userId;
  delete collectionCopy.userId;
  return {
    ...collectionCopy,
    name: collectionCopy.name.toString(),
    user: username,
    _id: collectionCopy._id.toString(),
    freets: collectionCopy.freets.map((freet) => formatFreetObject(freet)),
  };
};

const formatFreetObject = (freet: any): any => {
  const freetCopy = { ...freet };
  delete freetCopy.authorId.password;
  return freetCopy;
}

export {
  constructCollectionResponse,
};
