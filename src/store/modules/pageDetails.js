import utils from '@/services/utils'

export default {
  namespaced: true,
  state: {
    url: null,
    isWhiteListed: false, //globally
    isBlacklisted: false//customized per user
  },
  mutations: {
    set_url: (state, url) => {
      state.url = url;
    },
    set_white_list_status: (state, status) => {
      state.isWhiteListed = status;
    },
    set_black_list_status: (state, status) => {
      state.isWhiteListed = status;
    }
  },
  actions: {
    setUpPageUrl: function(context) {
      return new Promise((resolve, reject) => {
          context.commit('set_url', window.location.href);
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
          console.log('is it whitelisted', response)
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

    setBlackListStatus: function(context, payload) {
      return new Promise((resolve, reject) => {
        context.commit('set_black_list_status', payload);
        resolve();
      })
    }

  }
}
  