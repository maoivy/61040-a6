<!-- Page for profile -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section v-if='this.notFound'>
        <h2>The user @{{ $route.params.username }} could not be found.</h2>
    </section>
    <section v-else>
      <header>
        <h2>@{{ $route.params.username }}</h2>
      </header>
      <button 
        v-if="!this.canEdit && this.$store.state.following && !this.$store.state.following.includes(this.profile._id)"
        @click="follow"
      >
         Follow
      </button>
      <button 
        v-if="!this.canEdit && this.$store.state.following && this.$store.state.following.includes(this.profile._id)"
        @click="unfollow"
      >
        Unfollow
      </button>
      <button v-if="this.canEdit">
          Edit profile
      </button>
      <div>
          <p>{{ this.profile.bio }}</p>
          <p>Joined {{ this.profile.dateJoined }} </p>
          <p>{{ this.profile.following && this.profile.following.length }} following</p>
          <p>{{ this.profile.followedBy && this.profile.followedBy.length }} followers</p>
      </div>
    </section>
    <section>
        <header>
            <button @click="setView('allFreets')">All freets ({{this.allFreets.length}})</button>
            <button @click="setView('originalFreets')">Freets ({{this.originalFreets.length}})</button>
            <button @click="setView('refreets')">Refreets ({{this.refreets.length}})</button>
            <button @click="setView('collections')">Collections ({{this.collections.length}})</button>
        </header>
        <div v-if="this.view === 'allFreets'">
            <div v-if="this.allFreets.length">
                <FreetComponent
                    v-for="freet in this.allFreets"
                    :key="freet.id"
                    :freet="freet"
                />
            </div>
            <article v-else>
                <h3>No freets found.</h3>
            </article>
        </div>
        <div v-if="this.view === 'originalFreets'">
            <div v-if="this.originalFreets.length">
                <FreetComponent
                    v-for="freet in this.originalFreets"
                    :key="freet.id"
                    :freet="freet"
                />
            </div>
            <article v-else>
                <h3>No original Freets found.</h3>
            </article>
        </div>
        <div v-if="this.view === 'refreets'">
            <div v-if="this.refreets.length">
                <FreetComponent
                    v-for="freet in this.refreets"
                    :key="freet.id"
                    :freet="freet"
                />
            </div>
            <article v-else>
                <h3>No Refreets found.</h3>
            </article>
        </div>
        <div v-if="this.view === 'collections'">
            <NewCollectionForm 
                v-if="this.profile.username === this.$store.state.username" 
                @new-collection="this.getCollections" 
            />
            <div v-if="this.profile.username === this.$store.state.username">
              <div v-if="this.$store.state.collections && this.$store.state.collections.length">
                  <CollectionComponent
                      v-for="collection in this.$store.state.collections"
                      :key="collection.id"
                      :collection="collection"
                      @collection-deleted="getCollections"
                      @collection-edited="getCollections"
                  />
              </div>
              <article v-else>
                <h3>No Collections found.</h3>
              </article>
            </div>
            <div v-else>
              <div v-if="this.collections.length">
                  <CollectionComponent
                      v-for="collection in this.collections"
                      :key="collection.id"
                      :collection="collection"
                      @collection-deleted="getCollections"
                      @collection-edited="getCollections"
                  />
              </div>
              <article v-else>
                <h3>No Collections found.</h3>
              </article>
            </div>
        </div>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import NewCollectionForm from '@/components/Collection/NewCollectionForm.vue'
import CollectionComponent from '@/components/Collection/CollectionComponent.vue';

export default {
  name: 'ProfilePage',
  components: {FreetComponent, CollectionComponent, NewCollectionForm},
  data() {
    return {
      notFound: false,
      profile: {},
      userId: '',
      canEdit: false,
      view: 'allFreets',
      allFreets: [],
      originalFreets: [],
      refreets: [],
      collections: [],
    };
  },
  created() {
      this.getProfile();
      this.getFreets();
      this.getCollections();
  },
  methods: {
    async getProfile() {
      /**
       * Gets the profile for the user whose profile page this is.
       */
      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/users?username=${this.$route.params.username}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.profile = res.user;
        this.userId = res._id;
        if (this.profile.username === this.$store.state.username) {
            this.canEdit = true;
        }
      } catch (e) {
        this.notFound = true;
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    async getFreets() {
      /**
       * Gets the freets for the user whose profile page this is.
       */
      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/freets?username=${this.$route.params.username}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.allFreets = res;
        this.originalFreets = res.filter((freet) => !freet.refreetOf);
        this.refreets = res.filter((freet) => freet.refreetOf);
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    async getCollections() {
      /**
       * Gets the freets for the user whose profile page this is.
       */
      // use the store if this is the user's own profile page, so updates to collections can be tracked
      if (this.$route.params.username === this.$store.state.username) {
        this.collections = this.$store.state.collections;
      }

      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/collection?username=${this.$route.params.username}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.collections = res;
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    setView(view) {
      /**
       * Sets the view (all freets, original freets, refreets, or collections).
       */
      this.view = view;
    },
    async follow() {
      /**
       * Follows the user.
       */
      const options = {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'username': `${this.$route.params.username}`}),
      };

      try {
        const r = await fetch(`/api/users/follow`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        this.$store.commit('refreshUser');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    async unfollow() {
      /**
       * Unfollows the user.
       */
      const options = {
        method: 'DELETE', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/users/follow/${this.$route.params.username}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        this.$store.commit('refreshUser');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
  },
};
</script>