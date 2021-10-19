<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'popupApp',
  created() {

    this.getUser()
    .then(authUser => {

      if (!authUser) {
        this.logout();
        // this.$router.push({ name: 'Login' });
        //open sidebar by sending a message via the background to the content script
      }
    //   else {
    //     this.$router.push({ name: 'Home' });
    //   }
    });
  },
   methods: {
    ...mapActions('auth', [
      'getUser',
      'logout'
    ])
  },
}
</script>

<style>
/* html {
  width: 400px;
  height: 400px;
} */
</style>
