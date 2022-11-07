<!-- Page for profile -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>@{{ $route.params.username }}</h2>
      </header>
      <div>
          <p>{{ this.profile.bio }}</p>
          <p>Joined {{ this.profile.dateJoined }} </p>
          <p>{{ this.profile.following && this.profile.following.length }} following</p>
          <p>{{ this.profile.followedBy && this.profile.followedBy.length }} followers</p>
      </div>
    </section>
    <section>
        <header>
            <button @click="setView('allFreets')">All freets</button>
            <button @click="setView('originalFreets')">Freets</button>
            <button @click="setView('refreets')">Refreets</button>
            <button @click="setView('collections')">Collections</button>
        </header>
        <div v-if="this.view === 'allFreets' && this.allFreets.length">
            <FreetComponent
                v-for="freet in this.allFreets"
                :key="freet.id"
                :freet="freet"
            />
        </div>
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
            <div v-if="this.collections.length">
                <CollectionComponent
                    v-for="collection in this.collections"
                    :key="collection.id"
                    :collection="collection"
                />
            </div>
            <article v-else>
                <h3>No Collections found.</h3>
            </article>
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
      profile: {},
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
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
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
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async getCollections() {
      /**
       * Gets the freets for the user whose profile page this is.
       */
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
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    setView(view) {
      /**
       * Sets the view (all freets, original freets, refreets, or collections).
       */
      this.view = view;
    },
    hi() {
        console.log('hi');
    }
  },
};
</script>