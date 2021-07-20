<template>
  <v-row no-gutters class="identify-headlines-button-row" v-if="!isWhiteListed && !isBlacklisted && !buttonHidden">

    <!-- <v-btn @click="whiteListPage" max-width="230px"
    color="blue-grey lighten-3" raised >
      <v-img :src="logoUrl" class="logo-img mr-1" contain></v-img>
      Identify Headlines
    </v-btn> -->

    <v-btn @click="whiteListPage" raised color="blue-grey lighten-3" small>
      <v-icon small>{{icons.edit}}</v-icon>
    </v-btn>

    <v-btn class="px-1" max-width="30px" min-width="initial" @click="hideButton" small>
      <v-icon>{{icons.left}}</v-icon>
    </v-btn>

  </v-row>
</template>

<script>
// @ is an alias to /src
import domHelpers from '@/lib/domHelpers'
import { mapState, mapActions } from 'vuex'
import { mdiChevronLeft, mdiPencil } from '@mdi/js';

export default {
  name: 'Home',
  components: {
    
  },
  data: () => {
    return {
      buttonHidden: false,
      icons: {
        left: mdiChevronLeft,
        edit: mdiPencil
      }
    }
  },
  created() {
  },
  computed: {
    logoUrl: function() {
      return chrome.runtime.getURL('icons/38_.png');
    },
    ...mapState('pageDetails', [
      'isWhiteListed',
      'isBlacklisted'
    ])
  },
  methods: {
    hideButton: function() {
      this.buttonHidden = true;
    },
    whiteListPage: function() {
      this.addUrlToWhiteLists()
      .then(() => {
        domHelpers.identifyPotentialTitles();
        console.log('is url whitelisted', this.isWhiteListed)
      })
    },
    ...mapActions('pageDetails', [
      'addUrlToWhiteLists'
    ])
  }
}
</script>

<style scoped>
.identify-headlines-button-row {
  position: fixed;
  top: 0px;
  left: 0px;
  /* width: 280px; */
  width: 200px;
  z-index: 99999;
}

.logo-img {
  display: inline-flex;
  vertical-align: middle;
  width: 40px;
}
</style>