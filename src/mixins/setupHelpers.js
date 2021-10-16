import { mapState, mapActions } from 'vuex'
import utils from '@/services/utils'

export default {
  data: () => {
    return {
    }
  },
  methods: {

    // getBlackListStatus() {
    //   let pageHostname = utils.extractHostname(this.url);
    //   let pageIsBlackListed = false;

    //   if ('blackListedWebsites' in this.userPreferences) {
    //     pageIsBlackListed = this.userPreferences.blackListedWebsites.some(blacklistedWebsite => 
    //       pageHostname.includes(blacklistedWebsite)
    //     )
    //   }

    //   console.info('is page blacklisted:', pageIsBlackListed);
    //   return this.setBlackListStatus(pageIsBlackListed);
    // },

    fetchTitlesAndRelationships() {

      Promise.all([this.setUpPageUrl(), this.setUpURLObserver()])
      .then(() => {
        this.IsGloballyWhiteListed();
      });

      this.setUpObserver();

      if (!this.followedSources.length)
          this.fetchFollows();
      if (!this.trustedSources.length)
          this.fetchTrusteds();
      
      // this.fetchFollowers();
      let thisRef = this;

      this.getUserPreferences()
      .then(() => {
        thisRef.setBlackListStatus()
        .then(() => {
          if (!thisRef.isBlackListed) {

            if ( !this.titles.length && !this.titlesFetched ) {
              this.setUpTitles()
              .then( () => {
                  this.setTitlesFetched(true);
              })
            }
          }
        })
        
      })
      
    },
    ...mapActions('titles', [
      'setUpTitles',
      'setTitlesFetched'
    ]),
    ...mapActions('relatedSources', [
      'fetchFollows',
      'fetchTrusteds',
      'fetchFollowers'
    ]),
    ...mapActions('pageDetails', [
      'setUpPageUrl',
      'IsGloballyWhiteListed',
      'setBlackListStatus',
      'setUpURLObserver',
      'setBlackListStatus'
    ]),
    ...mapActions('pageObserver', [
        'setUpObserver'
    ]),
    ...mapActions('preferences', [
      'getUserPreferences'
    ])
  },
  computed: {
    ...mapState('titles', [
      'titles',
      'titlesFetched'
    ]),
    ...mapState('relatedSources', [
      'followedSources',
      'trustedSources',
    ]),
    ...mapState('preferences', [
      'userPreferences'
    ]),
    ...mapState('pageDetails', [
      'url',
      'isBlacklisted'
    ])
  }

}
