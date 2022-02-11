<template>
  <v-container fluid class="pa-1">
    <v-row no-gutters v-if="isWhiteListed">
        <p class="mb-5 body-2">
            Reheadline thinks this is a website where it should allow users to edit headlines.
            If you don't want to see headlines suggested by others on this website, go to the
            Options page of the Reheadline extension and enter this website's address into your
            blacklist. You can visit the Options page by right clicking on the Reheadline's browser
            action button and choosing Options.
        </p>

    </v-row>
    <v-row no-gutters justify="center" v-else>
        <p class="mb-5 body-2">Reheadline doesn't know whether it should try to detect headlines 
            on this website and allow users to edit them. If you think this is a website 
            where headlines should be made editable by Reheadline, click on the button below.
            </p>
        <v-btn outlined @click="whiteListDomain" small text> Identify Headines</v-btn>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'popupApp',
  created() {
    let thisRef = this;
    browser.tabs.query({ currentWindow: true, active: true })
    .then(tabs => {
        let activeTab = tabs[0];
        browser.tabs.sendMessage(activeTab.id, { type: 'cs_is_url_white_listed' })
        .then((resp) => {
            thisRef.isWhiteListed = resp.response;
        })
    });

    /*
    Message is sent from content script (in the pageDetails store module) to notify
    the popup that the whitelist status of the page has changed.
    */
    browser.runtime.onMessage.addListener(request => {
        if (request.type == 'popup_potential_whitelist_status') {
            thisRef.isWhiteListed = request.data;
        }
    })

  },
  data () {
    return {
        isWhiteListed: false
    }
  },
  computed: {

  },
  methods: {
    whiteListDomain: function() {
        /*
        sending a message to the content script
        */
        browser.tabs.query({ currentWindow: true, active: true })
        .then(tabs => {
            let activeTab = tabs[0];
            browser.tabs.sendMessage(activeTab.id, { type: 'cs_white_list_page' });
        });
        window.close(); // close the popup when the content script finishes processing request
    }
  }
}
</script>

<style>
.v-application--wrap {
  width: 400px;
  /* height: 400px; */
  min-height: fit-content;
}

body {
  background-color: #F9FBE7;
}
</style>
