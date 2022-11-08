<template>
  <div id="app">
    <section class="alerts">
      <article
        v-for="(status, alert, index) in this.$store.state.alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
    <div class="wrapper">
      <NavBar />
      <router-view :key="$route.path" />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue';

export default {
  name: 'App',
  components: {NavBar},
  beforeCreate() {
    // Sync stored username to current session
    fetch('/api/users/session', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      const user = res.user;
      this.$store.commit('setUsername', user ? user.username : null);
      this.$store.commit('setUserId', user ? user._id : null);
      this.$store.commit('setLikes', user ? user.likes : null);
      this.$store.commit('setFollowing', user ? user.following : null);

      if (user) {
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshCollections');
      }
    })

    // Clear alerts on page refresh
    this.$store.state.alerts = {};
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
}

main {
  padding: 0 5em 5em;
  height: 100vh;
  width: 75vw;
  overflow: scroll;
}

button {
  font-family: 'Montserrat', sans-serif;
}

.wrapper {
  height: 100vh;
  display: flex;
}

.alerts {
    position: absolute;
    z-index: 99;
    top: 0.3em;
    left: 50%;
    transform: translate(-50%, 10%);
    text-align: center;
}

.alerts article {
    border-radius: 5px;
    padding: 10px 20px;
    color: #fff;
}

.alerts p {
    margin: 0;
}

.alerts .error {
    background-color: rgb(166, 23, 33);
}

.alerts .success {
    background-color: rgb(45, 135, 87);
}
</style>
