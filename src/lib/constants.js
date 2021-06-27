//const BASE_URL = `http://localhost:3000`;
const BASE_URL = `https://developer.trustnet.csail.mit.edu`
//const CLIENT_URL = `http://localhost:8080`;
const CLIENT_URL = `https://reheadline.csail.mit.edu`;

const SITE_NAME = 'Reheadline';
const LENGTH_TO_HASH = 25;
const MAX_TITLE_LENGTH = 180;
const MIN_TITLE_LENGTH = 18;
const FINDING_TITLES_FUZZY_SCORE_THRESHOLD=0.77;
const IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD=0.77;

export default {
  BASE_URL,
  CLIENT_URL,
  SITE_NAME,
  LENGTH_TO_HASH,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  FINDING_TITLES_FUZZY_SCORE_THRESHOLD,
  IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD
}
