import store from '@/store'
import constants from '@/lib/constants'

//function to sort sources by full name or username (for news publishing entities)
function compareNames(a, b) {

  let sourceNames = []
  Array.from(arguments).forEach(source => sourceNames.push(
    source.systemMade
    ? source.userName
    : source.firstName.toLowerCase() + ' ' + source.lastName.toLowerCase())
  );

  return sourceNames[0].localeCompare(sourceNames[1]);
}

/*
compare two sources based on whether one or both are the auth user,
and the trust and follow relationships of the sources with the auth user
*/
function compare2Sources(aId, bId) {

  if (aId == bId)
    return 0;

  let authUserId = store.getters['auth/user'].id;

  if (aId == authUserId)
    return -1;
  else if (bId == authUserId)
    return 1;
  else {
    let trustedIds = store.getters['relatedSources/trustedIds'];
    let followedIds = store.getters['relatedSources/followedIds'];

    if (trustedIds.includes(aId) && trustedIds.includes(bId)) {
      if (followedIds.includes(aId))
        return -1;
      else if (followedIds.includes(bId))
        return 1;
      else
        return -1
    }
    else if (trustedIds.includes(aId))
      return -1;
    else if (trustedIds.includes(bId))
      return 1;
    else if (followedIds.includes(aId))
      return -1;
    else if (followedIds.includes(bId))
      return 1;
    else
      return 0;
  }

}


function compareAssessments(a, b) {
  if (!a.lastVersion.isTransitive && b.lastVersion.isTransitive)
    return -1;
  else if (a.lastVersion.isTransitive && !b.lastVersion.isTransitive)
    return 1;
  //anonymous requests for assessment do not have a SourceId
  else if (a.assessor.SourceId && !b.assessor.SourceId)
    return -1;
  else if (!a.assessor.SourceId && b.assessor.SourceId)
    return 1;
  else if (!a.assessor.SourceId && !b.assessor.SourceId) {
    for (let date of ['createdAt', 'updatedAt']) {
      let aDate = new Date(a.lastVersion[date]);
      let bDate = new Date(b.lastVersion[date]);
      if (aDate < bDate)
        return -1;
      else if (aDate > bDate)
        return 1;
    }

    return a.lastVersion.id - b.lastVersion.id;
  }
  else {
    let compareVal = compare2Sources(a.assessor.SourceId, b.assessor.SourceId);
    if (compareVal != 0)
      return compareVal;
    else {
      let aCredVal = Math.abs(a.lastVersion.postCredibility);
      let bCredVal = Math.abs(b.lastVersion.postCredibility);

      if ( (aCredVal == 0 && bCredVal != 0) || (aCredVal > bCredVal) )
        return -1;
      else if ( (aCredVal != 0 && bCredVal == 0) || (aCredVal < bCredVal) )
        return 1;
      else
        return compareNames(a.assessor, b.assessor);
    }
  }

}


function compareSources(a, b) {

  let compareVal = compare2Sources(a.id, b.id);
  if (compareVal != 0)
    return compareVal;
  else
    return compareNames(a, b);
}

function compareBoosters(a, b) {

  let compareVal = compare2Sources(a.booster.id, b.booster.id);
  if (compareVal != 0)
    return compareVal;
  else
  {
    let aDate = new Date(a.updatedAt);
    let bDate = new Date(b.updatedAt);
    if (aDate < bDate)
      return -1;
    else if (aDate > bDate)
      return 1;
    else
      return compareNames(a.booster, b.booster);
  }
}

function compareTitles(a, b) {
  let authUserId = store.getters['auth/user'].id;

  if (a.author.id == authUserId && b.author.id != authUserId)
    return -1;
  else if (b.author.id == authUserId && !a.author.id == authUserId )
    return 1;

  if (a.userEndorsed && !b.userEndorsed)
    return -1;
  if (b.userEndorsed && !a.userEndorsed)
    return 1;

  let compareVal = compare2Sources(a.author.id, b.author.id);
  if (compareVal != 0)
    return compareVal;
  else {

    if (a.lastVersion.Endorsers.length > b.lastVersion.Endorsers.length)
      return -1;
    else if (a.lastVersion.Endorsers.length < b.lastVersion.Endorsers.length)
      return 1;

    let aDate = new Date(a.lastVersion.updatedAt);
    let bDate = new Date(b.lastVersion.updatedAt);
    if (aDate < bDate)
      return 1;
    else if (aDate > bDate)
      return -1;
    else
      return compareNames(a.author, b.author);
  }
}

function getUnique(arr, comp) {

  const unique = arr.map(e => e[comp])
  .map((e, i, final) => final.indexOf(e) === i && i)
  .filter(e => arr[e]).map(e => arr[e]);

 return unique;
}

function isTrusted(source) {

  let trustedIds = store.getters['relatedSources/trustedIds'];

  if (trustedIds.includes(source.id))
    return true;
  else
    return false;
}

function isFollowed(source) {

 let followedIds = store.getters['relatedSources/followedIds'];

 if (followedIds.includes(source.id))
   return true;
 else
   return false;
}

function addLimitOffsetToQuery(params) {
  let appendStr = '';
  if (params.limit) {
    appendStr += '/?limit=' + params.limit;
    if (params.offset) {
      appendStr += '&offset=' + params.offset;
    }
  }

  return appendStr;
}

function hashCode(s) {
  return s.split("").reduce(function(a,b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a&a },
    0);              
}


function extractFacebooklink(link) {
  let sanitizedLink = link.substr(link.indexOf('l.php?u=') + 8); // remove before ?u=
  sanitizedLink = sanitizedLink.substr(0, sanitizedLink.indexOf('&')); // remove after &

  return decodeURIComponent(sanitizedLink);
}

function extractHostname(url, removeProtocol) {
  let hostname = url;
  //find & remove protocol (http, ftp, etc.) and get hostname

  let keepQueryParam = false;
  if (constants.DOMAINS_WITH_QUERY_PARAMS.some(el => 
    url.includes(el)))
    keepQueryParam = true;

  if (url.includes('https://l.facebook.com/l.php?'))
    hostname = extractFacebooklink(hostname);

  if (url.includes('cnn.com/videos')) {
    let index = url.indexOf('/video/playlists/');
    if (index != -1 ) {
      hostname = url.substring(0, index);
    }
  }
    
  if (url.indexOf("//") != -1 ) {
    if (keepQueryParam)
      hostname = hostname.split('&')[0];
    else {
      let indexOfFirstParam = hostname.indexOf('?', hostname.indexOf("//") + 2);
      if (indexOfFirstParam != -1)
        hostname = hostname.substring(0, indexOfFirstParam);
    }
  }
  else {
    console.log('what kind of url is it', url);
  }

  if (removeProtocol)
    hostname = hostname.split('//')[1];    

  if (hostname[hostname.length - 1] == '/')
    return hostname.substring(0, hostname.length - 1);

  return hostname;
}


export default {
  compareNames,
  compareSources,
  compareBoosters,
  compareTitles,
  compareAssessments,
  getUnique,
  isTrusted,
  isFollowed,
  addLimitOffsetToQuery,
  hashCode,
  extractHostname
}
