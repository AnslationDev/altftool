/**
 * Top 49 — catalog registry.
 *
 * Every catalog file registers here. lib/data.js compiles this array once at
 * module load and serves all queries from the result.
 */

import { moviesCatalog } from './catalogs/movies.js';
import { entertainmentCatalogs } from './catalogs/entertainment.js';
import { techCatalogs } from './catalogs/tech.js';
import { lifestyleCatalogs } from './catalogs/lifestyle.js';
import { foodTravelCatalogs } from './catalogs/foodtravel.js';
import { sportsCatalogs } from './catalogs/sports.js';
import { businessCatalogs } from './catalogs/business.js';
import { knowledgeCatalogs } from './catalogs/knowledge.js';

export const catalogs = [
  moviesCatalog,
  ...entertainmentCatalogs,
  ...techCatalogs,
  ...lifestyleCatalogs,
  ...foodTravelCatalogs,
  ...sportsCatalogs,
  ...businessCatalogs,
  ...knowledgeCatalogs,
];
