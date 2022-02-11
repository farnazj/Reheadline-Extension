import generalUtils from '@/lib/generalUtils'
import store from '..';

export default {
    namespaced: true,
    state: {
      observer: null,
      config: null
    },
    mutations: {
      setup_observer: (state) => {

        if (state.observer === null) {

          const targetNode = document.body;
          state.config = { attributes: false, childList: true, subtree: true };

          let insertedApp = document.querySelector('div[data-vuetify-reheadline]');
          let trustnetApp = document.querySelector('div[data-vuetify-trustnet]');

          const callback = generalUtils.throttle(function(mutationsList, observer) {
            console.log('going to execute mutation callback **')
            let childMutation = false;
            for (const mutation of mutationsList) {
              console.log('mutation detected:', mutation);
                if (mutation.type === 'childList' && !insertedApp.contains(mutation.target) &&
                (!trustnetApp || !trustnetApp.contains(mutation.target) )) {
                    childMutation = true;
                }
            }
            console.log('Reheadline: child mutation happened or not:', childMutation);
            if (childMutation) {
                console.log('Reheadline: A child node has been added or removed.');
                state.observer.takeRecords();
                state.observer.disconnect();
                store.dispatch('titles/setUpTitles');
            }
          }, 5000);
  
          state.observer = new MutationObserver(callback);
          document.addEventListener('DOMContentLoaded', function() {
              state.observer.observe(targetNode, state.config);    
          }, false);
        }

      },

      disconnect_observer: (state) => {
        state.observer.takeRecords();
        state.observer.disconnect();
      },

      reconnect_observer: (state) => {
        const targetNode = document.body;
        state.observer.observe(targetNode, state.config);    
      }
    },
    actions: {
      setUpObserver: function(context) {  
        return new Promise((resolve, reject) => {
            context.commit('setup_observer');
            resolve;
        })
      },

      disconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('disconnect_observer');
          resolve;
        })
      },

      reconnectObserver: function(context) {
        return new Promise((resolve, reject) => {
          context.commit('reconnect_observer');
          resolve;
        })
      }
  
    }
  }
  