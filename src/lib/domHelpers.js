import generalUtils from '@/lib/generalUtils'
import insertedAppRouter from '@/router'
import store from '@/store'
import Fuse from 'fuse.js'
import consts from '@/lib/constants'
import utils from '@/services/utils'

function getElementsContainingText(text) {

    console.log('Trying to find an element with the exact text: ',text)

    let xpath, query;
    let uncurlifiedText = generalUtils.uncurlify(text).toLowerCase();
    let curlifiedText = generalUtils.curlify(text).toLowerCase();

    let results = [];

    let xpathExtension = utils.extractHostname(window.location.href).includes("www.nationalgeographic.com") ? 'or ancestor-or-self::div' : ''; //in National Geographic the links are in fact divs

    try {
        xpath = `//*[(ancestor-or-self::h1 or ancestor-or-self::h2 or ancestor-or-self::h3 or 
        ancestor-or-self::h4 or ancestor-or-self::h5 or ancestor-or-self::h6 or ancestor-or-self::a
        or ancestor-or-self::del ${xpathExtension})
         and ( contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
         "abcdefghijklmnopqrstuvwxyz"), 
         "${text}") or 
         contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
         "abcdefghijklmnopqrstuvwxyz"), 
         "${uncurlifiedText}") or
         contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
         "abcdefghijklmnopqrstuvwxyz"), 
         "${curlifiedText}") 
         )]`;

        query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
    }
    catch (error) {
        console.log('error in xpath because the matching text has double quotes in it', error)
        // if (error.name == 'DOMException') {
            xpath = `//*[(ancestor-or-self::h1 or ancestor-or-self::h2 or ancestor-or-self::h3 or 
            ancestor-or-self::h4 or ancestor-or-self::h5 or ancestor-or-self::h6 or ancestor-or-self::a 
            or ancestor-or-self::del ${xpathExtension})
            and ( contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz"), 
            '${text}') or contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz"), 
            '${uncurlifiedText}') or
            contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz"), 
            '${curlifiedText}')
            )]`;

            query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
        // }
    }
        
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    console.log('results of finding an element with the exact text:', results)

    return results;
}


function addAltTitleNodeToHeadline(args) {
    let altTitle = args.altTitle, originalTitle = args.originalTitle;

    const newEl = document.createElement('em');
    newEl.classList.add('new-alt-headline', `title-${altTitle.id}`);
    newEl.addEventListener('click', function(ev) {
        ev.preventDefault();

        store.dispatch('titles/setDisplayedTitle', { 
            titleId: altTitle.id,
            titleText: altTitle.text,
            offset: window.pageYOffset
        });

        store.dispatch('titles/setTitlesDialogVisibility', true);

        let uniqueCustomTitlesSeen = [];
        let uniqueCustomTitles = [];
    
        let allCustomTitles = altTitle.StandaloneCustomTitles.flat();
        for (let customTitle of allCustomTitles) {
            if (!(customTitle.id in uniqueCustomTitlesSeen)) {
                uniqueCustomTitlesSeen.push(customTitle.id);
                uniqueCustomTitles.push(customTitle);
            } 
        }

        browser.runtime.sendMessage({
            type: 'log_interaction',
            interaction: {
                type: 'show_titles_for_post', 
                data: { 
                    url: window.location.href,
                    standaloneTitleId: altTitle.id,
                    standaloneTitleText: altTitle.text,
                    originalTitleText: originalTitle,
                    postId: altTitle.PostId,
                    displayedCustomTitle: altTitle.sortedCustomTitles[0]['lastVersion'].text,
                    availableCustomTitleIds: uniqueCustomTitles.map(el => el.id)
                }
            }
        })

        insertedAppRouter.push({
            name: 'customTitles'
        });
        
    })

    newEl.appendChild(document.createTextNode(altTitle.sortedCustomTitles[0]['lastVersion'].text + ' '));

    return newEl;
}


function createEditButton () {
    const editButton = document.createElement('button');
    editButton.classList.add('rounded-edit-button');
    
    editButton.innerHTML = `
    <svg style="width:24px;height:24px;margin:0 auto" viewBox="0 0 24 24">
        <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
    </svg>
    `
    editButton.addEventListener('click', openCustomTitlesDialog)
    editButton.classList.add('headline-clickable');
    return editButton;
}

function acceptInputOnHeadline (headlineTag) {

    if (headlineTag.getAttribute('data-headline-id') === null) {

        headlineTag.setAttribute('data-headline-id', Math.random().toString(36).substring(2, 15));

        let color = window.getComputedStyle(headlineTag).color;
        let editButton = createEditButton();

        if (generalUtils.isTextLight(color)) {
            headlineTag.classList.add('title-background-dark');
            editButton.classList.add('title-background-dark')
        }   
        else {
            headlineTag.classList.add('title-background-light');
            editButton.classList.add('title-background-light');
        }

        headlineTag.appendChild(editButton);
    }
}

/*
Finds a text similar to a target text in two cases:
1. Looking for a title text returned by the server based on the hashes sent to it---
    searches within the innerText of the whole document
2. Looking for a title text in the document that matches the content of a meta title tag 
    (og:title, og:twitter) in which case it searches within the innerText of the whole document.
    Or determining whether the text content of a heading tag (passed as a searchSnippet) is
    similar enough to the content of the document's title tag
* @param {String} targetTitleText, Either a title text returned from the server or the text
of a title tag in the document
 * @param {Boolean} isSearchingForServerTitle, whether we're looking for a title that is returned
    from the server as a possible candidate title based on the hashes sent to the server, or
    whether we're looking for a text similar enough to a title tag. The cases are separated
    to allow for different score thresholds (currently set to be the same).
 * @param {String} searchSnippet (optional), the text of a heading tag
 * @return {String} The text that is similar enough to the title we're looking for if found,
    null if not found.
*/
function getFuzzyTextSimilarToHeading(targetTitleText, isSearchingForServerTitle, searchSnippet) {

    console.log(`inside fuzzy search, the text to look for is: ${targetTitleText}; is it searching for
    a title returned from the server? ${isSearchingForServerTitle}`)
    console.log('search snippet is ', searchSnippet ? searchSnippet.trim(): '')

    /*
    By default this function searches the whole content of the document. To not look for the text
    in long paragraphs, we limit the search to only those leaf nodes with fewer than consts.MAX_TITLE_LENGTH
    characters. innerText is style aware and the advantage of using it is (e.g., compared to textContent)
    is that it does not return the content of the hidden elements. However, the text returned by it is
    affected by CSS styling (e.g., upper/lower case). Therefore, here, we convert the search term as well as
    the array containing leaf nodes' contents to lowercase
    */

    let textCorpus, scoreThreshold;
    if (!searchSnippet) { //looking within the entire body of the document to find a server returned title
        textCorpus = document.body.innerText.split('\n').filter(x => x.length <= consts.MAX_TITLE_LENGTH).map(el =>
            el.toLowerCase());
    }
    else { //looking within the title of a tag to see if it is similar enough with 
        textCorpus = [searchSnippet.trim().toLowerCase()];
    }

    scoreThreshold = consts.INIDRECT_URL_DOMAINS.includes(utils.extractHostname(window.location.href, true)) ?
        consts.STRICTER_FUZZY_SCORE_THRESHOLD :
     (isSearchingForServerTitle ? consts.FINDING_TITLES_FUZZY_SCORE_THRESHOLD :
        consts.IDENTIFYING_TITLES_FUZZY_SCORE_THRESHOLD);

    const options = {
        isCaseSensitive: false,
        includeScore: true,
        distance: 200,
        scoreThreshold: scoreThreshold
    }
   
    const fuse = new Fuse(textCorpus, options)
    let uncurlifiedText = generalUtils.uncurlify(targetTitleText);

    let texts = uncurlifiedText != targetTitleText ? [uncurlifiedText, targetTitleText] : [targetTitleText];
    texts = texts.map(el => el.toLowerCase());

    let finalResults = [], tempResults = [];
    for (let text of texts) {
        tempResults = fuse.search(text);
        if (!finalResults.includes(tempResults[0]))
            finalResults.push(tempResults[0]);
    }
    
    console.log('All results from fuzzy search results were:', tempResults, ', final result is', finalResults[0]);
    return (finalResults[0] && finalResults[0].score <= scoreThreshold) ? finalResults[0].item : null;
}

function findAndReplaceTitle(title, remove, withheld, modifyMode) {

    console.log('inside findAndReplaceTitle, title to find:', title);
    console.log('is the title going to be removed', remove);

    let results;

    /*
    modifyMode is true when an alt title already exists on the page and it may need to change,
    e.g., when the user has submitted a new set of custom titles or edited an already existing set
    */
    if (modifyMode) {        
        let modifiedHeadlines = [...document.querySelectorAll('del.headline-modified')];
        results = modifiedHeadlines.filter(modifiedHeadline => {
            let similarText = getFuzzyTextSimilarToHeading(title.text, false, modifiedHeadline.textContent);
            return similarText != null; 
        })
        console.log('in edit mode, what results did we get:', results)
    }
    else {
        results = getElementsContainingText(title.text);
        results = results.filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)) && !el.classList.contains('new-alt-headline') );
    
        console.log('results of looking for elements containing the exact text returned from the server:', results)
        /*
        If exact text was not found, look for text that is *similar enough*
        */
    
        if (!results.length) {
            let similarText = getFuzzyTextSimilarToHeading(title.text, true);
    
            console.log('similar text found', similarText)
    
            if (similarText) {
                let tmpResults = getElementsContainingText(similarText);
                /*
                Take the elements whose href attribute match the URL of the post that is returned
                from the server in order to minimize false positives because of fuzzy matching
                */      
                results = tmpResults.filter( el => {
    
                    // If there's no post associated with the title as a result of an error in the backend
                    if (!title.Post ) 
                        return true;
                    /*
                    If the current page has the same URL as the associated post of the returned title, or if
                    the current page is among the special websites that have indirect URLs, then the result is accepted
                    */
                    if (utils.extractHostname(title.Post.url, true) == utils.extractHostname(window.location.href, true) ||
                        consts.INIDRECT_URL_DOMAINS.includes(utils.extractHostname(window.location.href, true)))
                    return true;
    
                    /*
                    Otherwise, check the href attribute of the closest ancestor of the element
                    */
                    let elementLink = el.closest(["a"]).getAttribute('href');
                    let sanitizedUrl = utils.extractHostname(elementLink, true);
                    
                    return (utils.extractHostname(title.Post.url, true).includes(sanitizedUrl));
                })
                            
            }
               
        }

    }

    let nonScriptResultsCount = 0;

    store.dispatch('pageObserver/disconnectObserver');

    results.forEach(el => {
        if (el.nodeName != 'SCRIPT') {
            nonScriptResultsCount += 1;

            const originalTitle = el.textContent;
            let headlineIsmodified = el.classList.contains('headline-modified');

            /*
            Adding alt headlines to Youtube is a special case. The title of the main video has a structure like the following:
            <h1 class="title style-scope ytd-video-primary-info-renderer title-background-light">
                <yt-formatted-string force-default-style="" class="style-scope ytd-video-primary-info-renderer">
                video title
                </yt-formatted-string>
            </h1>
            When a new video gets dynamically added to the page (because the user clicks on a new video), only the text content
            of the <yt-formated-string> node gets replaced. If the content of the node prior to loading the new video is empty,
            then for some reason the new text does not get added. If the content changes before the new video is loaded, sometimes 
            the new title is appended to the old title. Therefore, the <yt-formatted-string> node needs to be preserved as is.
            Therefore, the <yt-formatted-string> node is simply made invisible by setting its display to none. The container of the 
            <yt-formatted-string> node rather than the <yt-formatted-string> node itself is taken as the element to which the
            alt headline (em node) and the the stylized original headline (del node) need to be added.
            Because when after page mutations, the same alt headlines may be looked for replacement on the page, the container element
            in the case of Youtube is given a special class that is checked for. In non-Youtube pages, because the original text is
            deleted and only resides inside the <del> node, it suffices to give the <del> node the special class which serves both
            for presentational aspects and for checking whether the original headline has been modified.
            */
            if (utils.extractHostname(window.location.href).includes('youtube.com')) {
                el = el.parentNode;
                headlineIsmodified = el.classList.contains('headline-modified-youtube-container');
            }

            //if headline has not been modified yet, add the alt headline, stylize the headlines, and remove the edit button
            if (!headlineIsmodified) {

                let newFirstChild, newSecondChild;
                if (!withheld) {

                    if (!utils.extractHostname(window.location.href).includes('youtube.com')) {
                        el.textContent = "";

                        newFirstChild = addAltTitleNodeToHeadline({ altTitle: title, originalTitle: originalTitle });

        
                        newSecondChild = document.createElement('del');
                        newSecondChild.classList.add('headline-modified');
                        newSecondChild.appendChild(document.createTextNode(originalTitle));

                    }
                    else {
                        //the parent element is given a special class
                        el.classList.add('headline-modified-youtube-container');

                        //removing the edit button
                        [...el.children].filter(childEl => childEl.nodeName == 'BUTTON' && childEl.classList.contains('rounded-edit-button')).forEach(childEl => {
                            childEl.parentNode.removeChild(childEl);
                        });

                        //the special element that needs to be preserved is made to disappear via CSS
                        [...el.children].filter(childEl => childEl.nodeName == 'YT-FORMATTED-STRING' && childEl.classList.contains('ytd-video-primary-info-renderer') &&
                        childEl.hasAttribute('force-default-style')).forEach(childEl => {
                            childEl.style.display = "none";
                        });

                        newFirstChild = addAltTitleNodeToHeadline({ altTitle: title, originalTitle: originalTitle });
                        newSecondChild = document.createElement('del');
                        newSecondChild.classList.add('headline-modified');
                        newSecondChild.appendChild(document.createTextNode(originalTitle));
                    }
                      
                }

                let clickTarget = withheld ? el : newSecondChild;

                /*
                For Youtube, the ancestor element that contains the title (for videos suggested on the side,
                in a playlist, etc., rather than the main video that is being played) has a sibling that contains
                a few of the frames of the video . If that video is clicked, because it is a sibling of the title,
                any event listener defined on the title will not be triggered. Therefore, To capture clicks on both
                siblings, we traverse up the DOM tree until we arrive at an ancestor element that contains both. This
                element has the id #dismissible.
                */
                if (utils.extractHostname(window.location.href).includes('youtube.com')) {
                    clickTarget = el.closest('#dismissible');
                }

                /*
                Because the class headline-modified is not set on a title that is withheld
                for experimental purposes, this part of the code can repeatedly get executed
                as the page changes and therefore, multiple click event handlers can be added
                to the title element. To avoid this, a special attribute is set on the title element
                even if the title is not modified.
                */
                let customAttr = el.getAttribute('data-reheadline-click-check');
                if (withheld && !customAttr)
                    el.setAttribute('data-reheadline-click-check', true);
                /*
                if not on the actual article's page, e.g., on a homepage of a news website
                */
                if ( (!title.Post ||
                    utils.extractHostname(title.Post.url, true) != utils.extractHostname(window.location.href, true)
                    ) && !customAttr) {

                    clickTarget.addEventListener('click', function(ev) {

                        /*
                        It is possible that the target element that has been clicked on Youtube is a direct descendent
                        of (i.e., a contained element within) the menu that is used for dismissing the video, adding it
                        to a queue, etc., rather than actually clicking on the video. I choose to consider those cases
                        as clicking on the video because otherwise, special cases need to be considered for the various
                        Youtube pages, e.g., history, suggested videos on the side, playlists, homepage, etc. as the menu
                        contents change depending on what the page is.
                        */
                        
                        browser.runtime.sendMessage({
                            type: 'log_interaction',
                            interaction: {
                                type: 'visit_article', 
                                data: { 
                                    titleId: title.id,
                                    target: title.Post.url,
                                    source: window.location.href,
                                    titleWithheld: withheld ? 1 : 0
                                }
                            }
                        })
                    }, true) //the event should run on the capture phase to make sure this is executed before the click handler on the element itself which redirects to another page
                }
                
                if (!withheld) {
                    el.appendChild(newFirstChild);
                    el.appendChild(newSecondChild);
                }

            }
            else {
                /*if headline has already been modified, the displayed alt headline either needs to change to another 
                (in case of headline editing or removing), or the alt headline should be removed altogether and the style 
                of the original headline should be restored back to its original state (in case there is no alt headline
                left for the headline)
                 */
                let headlineContainer = utils.extractHostname(window.location.href).includes('youtube.com') ? el : el.parentNode;

                if (headlineContainer.children.length >= 2) {
                    
                    let childtoRemove = [...headlineContainer.children].filter(childEl => childEl.nodeName == 'EM' && 
                        childEl.classList.contains('new-alt-headline'))[0];
                    headlineContainer.removeChild(childtoRemove);

                    let originalTextHolderEl = [...headlineContainer.children].filter(childEl => childEl.nodeName == 'DEL' && 
                    childEl.classList.contains('headline-modified'))[0];

                    if (remove == true) {
                        headlineContainer.appendChild(originalTextHolderEl.textContent);
                        headlineContainer.removeChild(originalTextHolderEl);

                        acceptInputOnHeadline(headlineContainer);

                    }
                    else {
                        let newAltContainerEl = addAltTitleNodeToHeadline({ altTitle: title, originalTitle: originalTitle });
                        headlineContainer.insertBefore(newAltContainerEl, originalTextHolderEl);
                    }
                    
                }
            }

        }
    })
    store.dispatch('pageObserver/reconnectObserver');

    return nonScriptResultsCount;
}

/*
This function is used when the URL changes without the page refreshing. All modified headlines will be
deleted and their container restored back to their original style. For headlines that did not have suggestions, 
the edit button will be removed.
The pageDetails store module is responsible for invoking the function for identifying headlines on the page 
(for alt headline suggestion) or finding the headlines that already have.
*/
function removeAllModifications() {
    console.log('removing previous headline modifications')
    store.dispatch('pageObserver/disconnectObserver');

    [...document.querySelectorAll('em.new-alt-headline')].forEach(el => {
        el.parentNode.removeChild(el);
    });

    if (!utils.extractHostname(window.location.href).includes('youtube.com')) {
    
        let originalTextHolderEl = [...document.querySelectorAll('del.headline-modified')];
        let headlineContainers = originalTextHolderEl.map(el => el.parentNode);

        headlineContainers.forEach(container => {
            container.removeChild(container.children[0]);
            container.appendChild(document.createTextNode(container.children[0].textContent));
            container.removeChild(container.children[0]);
        })
    }

    /* On Youtube, the URL can change as a new video is clicked. The alt titles that were previously added to the page
    need to be removed removing edit buttons from unmodified headlines in Youtube where the headline gets dynamically replaced,
    leaving the previous button on the DOM
    */
    if (utils.extractHostname(window.location.href).includes('youtube.com')) {
      
        [...document.querySelectorAll('del.headline-modified')].forEach(el => {
            el.parentNode.removeChild(el);
        });

        [...document.querySelectorAll('yt-formatted-string.ytd-video-primary-info-renderer[force-default-style]')].forEach(el => {
            el.style.display = "initial"; });

        [...document.querySelectorAll('.headline-modified-youtube-container')].forEach(el => {
            el.classList.remove('headline-modified-youtube-container');
        })

        let headingContainers = [...document.querySelectorAll('[data-headline-id]')];
        let editButtons = headingContainers.map(el => [...el.children]).flat().filter(el =>
            el != undefined && el.nodeName == 'BUTTON' && el.classList.contains('rounded-edit-button'));
        editButtons.forEach(editButton => {
            editButton.parentNode.removeChild(editButton);
        })

        headingContainers.forEach(headingContainer => {
            headingContainer.removeAttribute('data-headline-id');
        })

    }
    
    store.dispatch('pageObserver/reconnectObserver');

}


function htmlDecode(input) {
    let doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}


function openCustomTitlesDialog(ev) {
    ev.preventDefault();

    let titleEl;
    let domainName = utils.extractHostname(window.location.href);

    if (["dailymail.co.uk", "politico.com", "theweek.com"].some((domain) =>
     domainName.includes(domain)))
        titleEl = ev.target.closest('h2');
    else if (domainName.includes("news.slashdot.org"))
        titleEl = Array.prototype.slice.call(ev.target.closest('h2').children).filter((el) => el.classList.contains('story-title'))[0].children[0];
    else if (domainName.includes("feedly.com"))
        titleEl = ev.target.closest('a');
    else
        titleEl = ev.target.closest('h1');

    //The economist h1's have a subtitle as well as a title node inside them (separated by a br node)
    if (utils.extractHostname(window.location.href).includes("www.economist.com") && titleEl.children.length == 3 )
        titleEl = document.querySelector('[data-test-id="Article Headline"]');
    
    store.dispatch('titles/setTitlesDialogVisibility', true);
    store.dispatch('titles/setDisplayedTitle', { 
        titleText: titleEl.textContent.trim(),
        titleElementId: titleEl.getAttribute('data-headline-id'),
        offset: window.pageYOffset
    });

    insertedAppRouter.push({
        name: 'customTitles'
    });
}

function removeEventListenerFromTitle(headlineId) {
    let heading = document.querySelector(`[data-headline-id="${headlineId}"]`);
    heading.removeEventListener('click', openCustomTitlesDialog);
    heading.classList.remove('headline-clickable');
}

function identifyPotentialTitles() {

    console.log('trying to identify titles on the page')
    let elResults = [];

    if (utils.extractHostname(window.location.href).includes('feedly.com')) {
        elResults = [document.querySelector('.entryTitle')].filter(el => el != null);
    }
    /*
    A special case is made for Youtube because when a video is clicked on, the page doesn't refresh
    and the OGP metadata do not refresh either. Therefore, the exact element that holds the video title
    is looked for. This needs to change if Youtube changes their UI.
    */
    else if (utils.extractHostname(window.location.href).includes('youtube.com')) {
        elResults = [document.querySelector('h1.title.ytd-video-primary-info-renderer')];
    }
    else {
        try {
            let origOgTitle = htmlDecode(document.querySelector('meta[property="og:title"]').getAttribute('content'));
            console.log('original og title', origOgTitle)

            let manipulatedOgTitles = [origOgTitle];

            consts.THROWAWAY_BEG_TERMS.forEach((begTerm) => {
                let throwawayBegIndex = origOgTitle.indexOf(begTerm);
                let truncatedText = origOgTitle;
                
                if (throwawayBegIndex != -1) {
                    truncatedText = origOgTitle.substring(throwawayBegIndex + begTerm.length + 1);

                    if (!manipulatedOgTitles.includes(truncatedText))
                        manipulatedOgTitles.push(truncatedText);
                }

                consts.THROWAWAY_END_TERMS.forEach((endTerm) => {
                    let throwawayEndIndex = origOgTitle.indexOf(endTerm);
                    if (throwawayEndIndex != -1) {
                        truncatedText = truncatedText.substring(0, throwawayEndIndex);

                        if (!manipulatedOgTitles.includes(truncatedText))
                            manipulatedOgTitles.push(truncatedText);
                    }
                    
                    if (!manipulatedOgTitles.includes(truncatedText))
                        manipulatedOgTitles.push(truncatedText);
                })
                
            })

            console.log('here are manipulated og titles', manipulatedOgTitles)
            
            manipulatedOgTitles.forEach((ogTitle) => {
                if (ogTitle.length >= consts.MIN_TITLE_LENGTH) {
                    elResults = getElementsContainingText(ogTitle).filter(el => 
                        !(['SCRIPT', 'TITLE'].includes(el.nodeName)) && !el.classList.contains('new-alt-headline') );

                    console.log('was exact title found', elResults)
                
                    //if the exact ogTitle text was not found, look for text that is similar enough
                    if (!elResults.length) {
                        let similarText = getFuzzyTextSimilarToHeading(ogTitle, false);
                        if (similarText && similarText.length >= consts.MIN_TITLE_LENGTH)
                            elResults = getElementsContainingText(similarText).filter(el => 
                                !(['SCRIPT', 'TITLE'].includes(el.nodeName)) && !el.classList.contains('new-alt-headline') );
                    }
            
                    console.log(`results of looking for og title ${ogTitle} is` , elResults);
                }
            })
    
        
        }
        catch(err) {
            console.log('in og:title, error is', err);
        }

        try {
            if (!elResults.length) {
                let twitterTitle = htmlDecode(document.querySelector('meta[name="twitter:title"]').getAttribute('content'));

                if (twitterTitle.length >= consts.MIN_TITLE_LENGTH) {
                    elResults = getElementsContainingText(twitterTitle).filter(el => 
                        !(['SCRIPT', 'TITLE'].includes(el.nodeName)) && !el.classList.contains('new-alt-headline'));
                
                    //if the exact twitter title text was not found, look for text that is similar enough
                    if (!elResults.length) {
                        let similarText = getFuzzyTextSimilarToHeading(twitterTitle, false);
                        if (similarText && similarText.length >= consts.MIN_TITLE_LENGTH)
                            elResults = getElementsContainingText(similarText).filter(el => 
                                !(['SCRIPT', 'TITLE'].includes(el.nodeName))  && !el.classList.contains('new-alt-headline'));
                    }
        
                    console.log('results of looking for twitter titles', elResults);
                }
            
            }

        }
        catch(err) {
            console.log('in twitter:title, error is', err)
        }

        /*
        if og and twitter titles were not found on the page, look for h headings that have texts similar to the document's title +
        if on ESPN and the only found title is inside an <a> tag (which is on the feed)
        */
        if (!elResults.length || ( ['www.espn.com', 'www.thegatewaypundit.com'].includes(utils.extractHostname(window.location.href, true)) && 
            elResults.every((el => el.nodeName == 'A'))) ) {

            let docTitle = document.querySelector('title').textContent;
            if (docTitle.length >= consts.MIN_TITLE_LENGTH) {
                let h1LevelHeadings = document.querySelectorAll('h1');
                let h2LevelHeadings = document.querySelectorAll('h2');
        
                elResults = [...h1LevelHeadings, ...h2LevelHeadings].filter(heading => {
                    let similarText = getFuzzyTextSimilarToHeading(docTitle, false, heading.textContent);
                    return similarText != null;
                }).filter(x => x.textContent.length >= consts.MIN_TITLE_LENGTH);
        
            }

            if (!elResults.length) {
                if (utils.extractHostname(window.location.href).includes('www.deseret.com'))
                    elResults = [...document.querySelectorAll('.c-page-title')];
            }
        
        }
        
    }

    elResults = elResults.filter(elResult => elResult); //for removing null elements
    elResults.forEach(heading => {
        
        let headlineIsmodified = utils.extractHostname(window.location.href).includes('youtube.com') ? 
            heading.classList.contains('headline-modified-youtube-container') : heading.classList.contains('headline-modified');

        if (!headlineIsmodified) {
            acceptInputOnHeadline(heading);
        }    
            
    })

    store.dispatch('pageObserver/reconnectObserver');
}

export default {
    findAndReplaceTitle,
    identifyPotentialTitles,
    removeEventListenerFromTitle,
    removeAllModifications
}