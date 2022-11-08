import type {HydratedDocument, Types} from 'mongoose';
import type {Relevance, PopulatedRelevance} from './model';

// Update this if you add a property to the Relevance type!
type RelevanceResponse = {
  _id: string;
  category: string;
  freet: any;
  relevanceScore: number;
  relevantVotes: number;
  totalVotes: number;
};

/**
 * Transform a raw Relevance object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Freet>} relevance - A relevance
 * @returns {RelevanceResponse} - The relevance object formatted for the frontend
 */
const constructRelevanceResponse = (relevance: HydratedDocument<Relevance>): RelevanceResponse => {
  const relevanceCopy: PopulatedRelevance = {
    ...relevance.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  return {
    ...relevanceCopy,
    _id: relevanceCopy._id.toString(),
    category: relevanceCopy.category.toString(),
    freet: formatFreet(relevanceCopy.freetId),
    relevanceScore: relevanceCopy.relevanceScore,
    relevantVotes: relevanceCopy.relevantVotes,
    totalVotes: relevanceCopy.totalVotes,
  };
};

const formatFreet = (freet: any): any => {
  const freetCopy = {...freet}
  const author = freetCopy.authorId;
  delete freetCopy.authorId;
  freetCopy.author = author.username;
  return freetCopy;
}

export {
  constructRelevanceResponse,
};
