<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <nav>
    <div class="links">
      <router-link to="/" :class="{ active: $route.path === '/' }">
        Home
      </router-link>
      <router-link
        v-if="$store.state.username"
        to="/account"
        :class="{ active: $route.path === '/account' }"
      >
        Account
      </router-link>
      <router-link
        v-if="$store.state.username"
        v-bind:to="'/users/' + $store.state.username"
        :class="{ active: $route.path === '/users/' + $store.state.username }"
      >
        Profile
      </router-link>
      <router-link
        v-else
        to="/login"
      >
        Login
      </router-link>
    </div>
    <div class="logo">
      <img src="../../public/logo.svg">
      <div v-if="$store.state.username" class="logo-text">
        @{{ $store.state.username }}
      </div>
      <div v-else class="logo-text">
        Fritter
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  height: 100%;
  width: 25%;
  padding: 5vh 3vw;
  padding-left: 6vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.links {
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 0.5em;
}

.links a, logo {
  padding: 0.5em 1em;
}

.links a, .logo-text {
  font-weight: bold;
  font-size: 1.5em;
}

.links a:hover {
  background-color: var(--background-darker);
}

.links .active {
  background-color: var(--background-darker);
}

.logo {
  display: flex;
  align-items: center;
  /* border: 1px solid var(--borders); */
  gap: 1em;
  width: 100%;
}

.logo-text {
  flex-grow: 2;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

img {
  height: 2em;
  width: 2em;
}

</style>
