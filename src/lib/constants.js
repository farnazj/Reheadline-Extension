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
  'www.reddit.com',
  'https://news.ycombinator.com'
]

const THROWAWAY_BEG_TERMS = [
  'Analysis:',
  'Opinion |',
  'Opinion:',
  'Perspective |', //for washington post,
  'Perspective:'
]

const THROWAWAY_END_TERMS = [
  ' - The New York Times',
  '| Vanity Fair Read More',
  '- AMAC',
  '- The Boston Globe',
  '| The Guardian',
  '- Slashdot'
]

const GLOBAL_BLACKLISTED_DOMAINS = [
  'calendar.google.com',
  'drive.google.com',
  'play.hbomax.com',
  'netflix.com',
  'hulu.com',
  'amazon.com',
  'weather.com',
  'paypal.com',
  'ups.com',
  'bankofamerica.com',
  'chase.com',
  'pnc.com',
  'betterment.com'
]


/*
Domains where a resource is identified using a query parameter
*/
const DOMAINS_WITH_QUERY_PARAMS = [
  'facebook.com/photo/?fbid',
  'facebook.com/watch',
  'youtube.com/watch',
  'news.ycombinator.com/item'
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
  THROWAWAY_END_TERMS,
  GLOBAL_BLACKLISTED_DOMAINS,
  DOMAINS_WITH_QUERY_PARAMS
}
