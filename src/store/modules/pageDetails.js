import utils from '@/services/utils'
import domHelpers from '@/lib/domHelpers';
import constants from '@/lib/constants';

export default {
  namespaced: true,
  state: {
    url: null,
    isWhiteListed: false, //globally
    isBlacklisted: false, //customized per user,
    timeOpened: null
  },
  getters: {
    // pageURL: (state) => {
    //   return state.url;
    // },
  },
  mutations: {
    set_url: (state, url) => {
      state.url = url;
    },
    set_white_list_status: (state, status) => {
      state.isWhiteListed = status;
    },
    set_black_list_status: (state, status) => {
      state.isBlacklisted = status;
    },
    set_time_opened: (state) => {
      state.timeOpened = Date.now();
      console.log('time opened', state.timeOpened)
    }
  },
  actions: {

    setUpURLObserver: function(context) {
      let lastUrl = window.location.href; 
      new MutationObserver(() => {
        const url = window.location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          onUrlChange();
        }
      }).observe(document, { subtree: true, childList: true });
      
      function onUrlChange() {
        context.dispatch('setUpPageUrl')
        .then(() => {
          console.log('url changed to ', context.state.url);
          Promise.all([context.dispatch('setBlackListStatus'), context.dispatch('IsGloballyWhiteListed')])
          .then(() => {
            if (!context.state.isBlacklisted) {
              domHelpers.removeAllModifications()
              window.setTimeout(() => {
                domHelpers.identifyPotentialTitles();
                context.dispatch('titles/setUpTitles', true, { root: true })
                .then(() => {
                  context.dispatch('titles/setTitlesFetched', true, { root: true });
                })
              }, 1000)
            }
          })
  

        })
      }
    },

    setUpPageUrl: function(context) {
      return new Promise((resolve, reject) => {
        let sanitizedUrl;
        if ( ['facebook.com/photo/?fbid', 'facebook.com/watch', 'youtube.com/watch'].some(el => 
          window.location.href.includes(el)))
          sanitizedUrl = window.location.href.split('&')[0];
        else
          sanitizedUrl = window.location.href.split('?')[0]
          
        context.commit('set_url', sanitizedUrl);
        resolve();
      })
    },

    IsGloballyWhiteListed: function(context) {
      return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({
          type: 'is_url_whitelisted',
          data: {
            headers: {
              url: window.location.host
            }
          }
        })
        .then( response => {

          /*
          A message is sent to the popup about a potential change in the URL
          and whether the new URL is whitelisted so that if the popup is open,
          it can change its message to the appropriate message.
          */
          browser.runtime.sendMessage({
            type: 'popup_potential_whitelist_status',
            data: response
          });

          context.commit('set_white_list_status', response);
          resolve();
        }).catch(error => {
            console.log(error)
            reject(error)
        })

      })
    },

    addUrlToWhiteLists: function(context) {
      return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({
          type: 'add_url_to_whitelist',
          data: {
            reqBody: {
              url: window.location.host
            }
          }
        })
        .then( response => {
            context.commit('set_white_list_status', true);
            resolve();
        }).catch(error => {
            console.log(error)
            reject(error)
        })

      })
    },

    setTimeOpened: (context) => {
      return new Promise((resolve, reject) => {
        context.commit('set_time_opened');
        resolve();
      })
    },

    setBlackListStatus: function(context) {
      return new Promise((resolve, reject) => {
        let pageHostname = utils.extractHostname(context.state.url);
        let pageIsBlackListed = false;

        let allBlackLists = constants.GLOBAL_BLACKLISTED_DOMAINS;
        let userPreferences = context.rootState['preferences'].userPreferences;
        console.log('user preferences', userPreferences);
        if ('blackListedWebsites' in userPreferences) {
          allBlackLists = allBlackLists.concat(userPreferences.blackListedWebsites);
        }

        pageIsBlackListed = allBlackLists.some(blacklistedWebsite => 
          pageHostname.includes(blacklistedWebsite)
        )
        context.commit('set_black_list_status', pageIsBlackListed);
        console.info('is page blacklisted:', pageIsBlackListed);

        resolve();
      })
    }

  }
}
  