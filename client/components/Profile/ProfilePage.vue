<!-- Page for profile -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section v-if='this.notFound'>
        <h2>The user @{{ $route.params.username }} could not be found.</h2>
    </section>
    <section v-else class="profile">
      <header>
        <h2 class="username">@{{ $route.params.username }}</h2>
        <div class="actions">
          <button 
            v-if="!this.canEdit && this.$store.state.following && !this.$store.state.following.includes(this.profile._id)"
            class="follow-button links"
            @click="follow"
          >
            Follow
          </button>
          <button 
            v-if="!this.canEdit && this.$store.state.following && this.$store.state.following.includes(this.profile._id)"
            class="unfollow-button danger"
            @click="unfollow"
          >
            Unfollow
          </button>
          <button v-if="this.canEdit && !editing" @click="startEditing" class="edit-button">
              Edit profile
          </button>
          <button v-if="this.canEdit && editing" @click="stopEditing" class="cancel-button danger">
              Cancel
          </button>
          <button v-if="this.canEdit && editing" @click="submitEdit" class="save-button links">
              Save changes
          </button>
        </div>
      </header>
      <div class="details">
          <p v-if="!editing">{{ this.profile.bio }}</p>
          <textarea
            v-else
            :value="bio"
            @input="bio = $event.target.value"
          />
          <div class="follow-details">
            <p>{{ this.profile.following && this.profile.following.length }} following</p>
            <p>{{ this.profile.followedBy && this.profile.followedBy.length }} followers</p>
          </div>
      </div>
      <section>
        <div class="views">
            <button 
              @click="setView('allFreets')"
              :class="{ active: this.view === 'allFreets' }"
            >
              All freets ({{this.allFreets.length}})
            </button>
            <button 
              @click="setView('originalFreets')" 
              :class="{ active: this.view === 'originalFreets' }"
            >
              Freets ({{this.originalFreets.length}})
            </button>
            <button 
              @click="setView('refreets')"
              :class="{ active: this.view === 'refreets' }"
            >
              Refreets ({{this.refreets.length}})
            </button>
            <button 
              @click="setView('collections')"
              :class="{ active: this.view === 'collections' }"
            >
              Collections ({{this.collections.length}})
            </button>
        </div>
        <div v-if="this.view === 'allFreets'">
            <div v-if="this.allFreets.length" class="content-wrapper">
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
            <div v-if="this.originalFreets.length" class="content-wrapper">
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
            <div v-if="this.refreets.length" class="content-wrapper">
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
        <div v-if="this.view === 'collections'" class="content-wrapper">
            <NewCollectionForm 
                v-if="this.profile.username === this.$store.state.username" 
                @new-collection="this.getCollections" 
            />
            <div v-if="this.profile.username === this.$store.state.username">
              <div v-if="this.$store.state.collections && this.$store.state.collections.length" class="content-wrapper">
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
            <div v-else class="content-wrapper">
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
        </div>
      </section>
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
      editing: false,
      bio: '',
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
    startEditing() {
      this.editing = true;
      this.bio = this.profile.bio;
    },
    stopEditing() {
      this.editing = false;
      this.bio = this.profile.bio;
    },
    async submitEdit() {
      /**
       * Saves the user's profile edits.
       */
      const options = {
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ bio: this.bio })
      };

      try {
        const r = await fetch(`/api/users?username=${this.$route.params.username}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.bio = res.user.bio;
        this.profile.bio = res.user.bio;
        this.editing = false;
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
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
        if (res.user.username === this.$store.state.username) {
          this.canEdit = true;
          this.bio = res.user.bio;
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

<style scoped>
.edit-button {
  background-color: var(--background-darker);
}

header {
  padding-bottom: 0;
}

header h2 {
  margin-bottom: 0.5em;
}

.profile, .details {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.follow-details {
  display: flex;
  gap: 1em;
}

.views {
  display: flex;
  margin-bottom: 0.75em;
  gap: 0.75em;
}

.views button {
  font-weight: bold;
}

.views button:hover {
  background-color: var(--background-darker);
}

.views .active {
  background-color: var(--background-darkest);
}
</style>