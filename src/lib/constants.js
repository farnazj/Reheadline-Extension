//const BASE_URL = `http://localhost:3000`;
const BASE_URL = `https://developer.trustnet.csail.mit.edu`
//const CLIENT_URL = `http://localhost:8080`;
const CLIENT_URL = `https://reheadline.csail.mit.edu`;

const SITE_NAME = 'Reheadline';
const LENGTH_TO_HASH = 25;
const MAX_TITLE_LENGTH = 200;
const MIN_TITLE_LENGTH = 17;
const FINDING_TITLES_FUZZY_SCORE_THRESHOLD=0.54;
const IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD=0.54;

const STRICTER_FUZZY_SCORE_THRESHOLD=0.65;

const INIDRECT_URL_DOMAINS = [
  'www.reddit.com'
]

const THROWAWAY_BEG_TERMS = [
  'Analysis:',
  'Opinion |',
  'Perspective |' //for washington post,
]
const THROWAWAY_END_TERMS = [
  ' - The New York Times',
  '| Vanity Fair Read More',
  '- AMAC',
  '- The Boston Globe',
  '| The Guardian',
  '- Slashdot'
]

export default {
  BASE_URL,
  CLIENT_URL,
  SITE_NAME,
  LENGTH_TO_HASH,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  FINDING_TITLES_FUZZY_SCORE_THRESHOLD,
  IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD,
  STRICTER_FUZZY_SCORE_THRESHOLD,
  INIDRECT_URL_DOMAINS,
  THROWAWAY_BEG_TERMS,
  THROWAWAY_END_TERMS
}
