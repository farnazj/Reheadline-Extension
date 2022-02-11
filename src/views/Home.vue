<template>
  <v-container class="dummy"></v-container>
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

/* .logo-img {
  display: inline-flex;
  vertical-align: middle;
  width: 40px;
} */
 
.dummy {
  display: none;
}
</style>