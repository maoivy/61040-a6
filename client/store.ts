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
    filter: '', // Filter of the logged in user
    following: [], // Following of the logged in user
    likes: [], // Likes of the logged in user
    refreets: [], // Refreets of the logged in user
    collections: [], // Collections of the logged in user
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
      state.filter = '';
      state.following = [];
      state.likes = [];
      state.refreets = [],
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
    setRefreets(state, refreets) {
      /**
       * Update the stored user's refreets to the specified one.
       * @param refreets - new rfreets to set
       */
      state.refreets = refreets;
    },
    setLikes(state, likes) {
      /**
       * Update the stored user's likes to the specified one.
       * @param likes - new likes to set
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
    setFilter(state, filter) {
      /**
       * Update the stored filter to the provided filter.
       * @param freets - Freets to store
       */
      state.filter = filter;
    },
    setFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    setFreet(state, freet) {
      /**
       * Update the stored freet to the provided freet.
       * @param freet - Freet to store
       */
      state.freet = freet;
    },
    setReplies(state, replies) {
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
       * Request the server for the current user's data.
       */
      const url = '/api/users/session';
      const res = await fetch(url).then(async r => r.json());
      state.username = res.user.username;
      state.userId = res.user.userId;
      state.following = res.user.following;
      state.likes = res.user.likes;
      state.refreets = res.user.refreets;
      state.filter = res.user.filter;
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
