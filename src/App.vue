<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import setupHelpers from '@/mixins/setupHelpers';
import domHelpers from '@/lib/domHelpers'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'insertedApp',

  components: {
  },

  data: () => ({
  }),
  created() {
    this.getUser()
    .then(authUser => {

      //this.logout();
      if (!authUser) {
        this.logout();
        this.$router.push({ name: 'Login' });
      }
      else {
        console.log('what is auth user in reheadline', authUser)
        this.fetchTitlesAndRelationships();
        this.$router.push({ name: 'Home' });
      }

      this.setTimeOpened();
    });

    let thisRef = this;

    browser.runtime.onMessage.addListener(request => {
      if (request.type == 'cs_white_list_page') {
        thisRef.addUrlToWhiteLists()
        .then(() => {
          domHelpers.identifyPotentialTitles();
        })
        return Promise.resolve({ response: "identified page titles" });
      }
      if (request.type == 'cs_is_url_white_listed') {
        return Promise.resolve({ response: thisRef.isWhiteListed });
      }
    })

  },
  computed: {
    ...mapState('pageDetails', [
        'isWhiteListed'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'getUser',
      'logout'
    ]),
    ...mapActions('pageDetails', [
      'setTimeOpened',
      'addUrlToWhiteLists'
    ])
  },
  mixins: [setupHelpers]
};
</script>
<style>
/* html {
   min-height: initial;
   min-width: initial;
   z-index: 9999999;
} */
</style>
