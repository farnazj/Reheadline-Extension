<template>
  <!-- <v-row no-gutters class="identify-headlines-button-row" v-if="!isWhiteListed && !isBlacklisted && !buttonHidden">

    <v-btn @click="whiteListPage" max-width="230px"
    color="blue-grey lighten-3" raised >
      <v-img :src="logoUrl" class="logo-img mr-1" contain></v-img>
      Identify Headlines
    </v-btn> 
    <v-btn @click="whiteListPage" raised color="blue-grey lighten-3" small>
      <v-icon small>{{icons.edit}}</v-icon>
    </v-btn>

    <v-btn class="px-1" max-width="30px" min-width="initial" @click="hideButton" small>
      <v-icon>{{icons.left}}</v-icon>
    </v-btn>

  </v-row> -->
  <v-container></v-container>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: {
    
  },
  data: () => {
    return {
    }
  },
  created() {
  },
  computed: {
    // logoUrl: function() {
    //   return chrome.runtime.getURL('icons/38_.png');
    // }
  }
}
</script>

<style scoped>
/* .identify-headlines-button-row {
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100px;
  width: 200px;
  z-index: 999999;
}

.logo-img {
  display: inline-flex;
  vertical-align: middle;
  width: 40px;
} */
</style>