import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    freets: [], // All freets created in the app
    userId: null, // User ID of the logged in user
    username: null, // Username of the logged in user
    following: [],
    likes: [],
    collections: [],
    freet: {}, // Freet most recently viewed
    replies: [], // Replies of Freet most recently viewed 
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    clear(state) {
      state.freets = [];
      state.userId = null;
      state.username = null;
      state.following = [],
      state.likes = [],
      state.collections = [];
      state.freet = {};
      state.replies = []; 
      state.alerts = {};
    },
    setUserId(state, userId) {
      /**
       * Update the stored user ID to the specified one.
       * @param userId - new user ID to set
       */
      state.userId = userId;
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    setLikes(state, likes) {
      /**
       * Update the stored user's likes to the specified one.
       * @param user - new user to set
       */
      state.likes = likes;
    },
    setFollowing(state, following) {
      /**
       * Update the stored user's following to the specified one.
       * @param following - new following to set
       */
      state.following = following;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateFreet(state, freet) {
      /**
       * Update the stored freet to the provided freet.
       * @param freet - Freet to store
       */
      state.freet = freet;
    },
    updateReplies(state, replies) {
      /**
       * Update the stored replies to the provided replies.
       * @param replies - Replies to store
       */
      state.replies = replies;
    },
    async refreshFreet(state, freetId) {
      /**
       * Request the server for the currently viewed freet.
       */
       const url = `/api/freets?freetId=${freetId}`;
       const res = await fetch(url).then(async r => r.json());
       state.freet = res;
    },
    async refreshReplies(state, freetId) {
      /**
       * Request the server for the replies of the currently viewed freet.
       */
      const url = `/api/freets/reply?freetId=${freetId}`;
      const res = await fetch(url).then(async r => r.json());
      state.replies = res;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    },
    async refreshUser(state) {
      /**
       * Request the server for the current user's username and ID.
       */
      const url = '/api/users/session';
      const res = await fetch(url).then(async r => r.json());
      state.username = res.user.username;
      state.userId = res.user.userId;
    },
    async refreshLikes(state) {
      /**
       * Request the server for the current user's likes.
       */
      const url = '/api/users/session';
      const res = await fetch(url).then(async r => r.json());
      state.likes = res.user.likes;
    },
    async refreshFollowing(state) {
      /**
       * Request the server for the current user's following.
       */
      const url = '/api/users/session';
      const res = await fetch(url).then(async r => r.json());
      state.following = res.user.following;
    },
    async refreshCollections(state) {
      /**
       * Request the server for the current user's collections.
       */
      const url = `/api/collection?username=${state.username}`;
      const res = await fetch(url).then(async r => r.json());
      state.collections = res;
    },
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
