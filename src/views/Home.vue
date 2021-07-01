<template>
  <v-row no-gutters class="identify-headlines-button" v-if="!isWhiteListed && !isBlacklisted">

    <v-btn @click="whiteListPage" 
    color="blue-grey lighten-3" raised >
      <v-img :src="logoUrl" class="logo-img mr-1" contain></v-img>

      Identify Headlines
    </v-btn>

  </v-row>
</template>

<script>
// @ is an alias to /src
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Home',
  components: {
    
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

    whiteListPage: function() {
      this.addUrlToWhiteLists()
      .then(() => {
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
.identify-headlines-button {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 200px;
  z-index: 99999;
}

.logo-img {
  display: inline-flex;
  vertical-align: middle;
  width: 40px;
}
</style>