<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <div v-if="freet.replyTo" class="reply-details">
        Replying to &nbsp
        <router-link
          v-bind:to="'/freets/' + freet.replyTo._id"
        >
          @{{ freet.replyTo.author }}'s Freet:
        </router-link>
        &nbsp {{ freet.replyTo.content }}
      </div>
      <div class="author">
        <router-link
          v-bind:to="'/users/' + freet.author"
        >
          @{{ freet.author }}
        </router-link>
      </div>
    </header>
    <p
      class="freet-content"
    >
      {{ freet.content }}
    </p>
    <div v-if="freet.readmore">
      <button 
        v-if="!this.freetPage"
        @click="read"
      >
        Read More
      </button>
      <div v-else>
        <p>Read more:</p>
        <p> {{ freet.readmore }}</p>
      </div>
    </div>
    <router-link
      v-if="freet.refreetOf"
      v-bind:to="'/freets/' + freet.refreetOf._id"
    >
      <div class="refreet-details">
        <p class="refreeted-author">@{{ freet.refreetOf.author }}</p>
        <p class="refreeted-content">{{ freet.refreetOf.content }}</p>
      </div>
    </router-link>
    <router-link
      v-bind:to="'/freets/' + freet._id"
    >
      <p class="info">
        Posted on {{ this.freet.dateCreated }}
      </p>
    </router-link>  
    <footer>
      <div>
        <button
          v-if="$store.state.likes && !$store.state.likes.includes(freet._id)"
          @click="like"
        >
          Like
        </button>
        <button
          v-if="$store.state.likes && $store.state.likes.includes(freet._id)"
          @click="unlike"
        >
          Unlike
        </button>
        
        <span> {{ freet.likes }} </span>
      </div>
      <div>
        <button
          v-if="$store.state.refreets && !$store.state.refreets.includes(freet._id)"
          @click="startRefreeting"
        >
          Refreet
        </button>
        <button
          v-else
          disabled
          class="disabled"
        >
          Refreeted
        </button>
        
        <span> {{ freet.refreets }} </span>
      </div>
      <div>
        <button @click="startReplying">
          Reply
        </button>
        <span> {{ freet.replies }} </span>
      </div>
      <div>
        <button @click="startCollecting">
            Collect
        </button>
      </div>
      <div v-if="$store.state.username === freet.author">
        <button @click="deleteFreet" class="delete-button">
            Delete
        </button>
      </div>
    </footer>
    <RefreetFreetForm 
      v-if="this.mode === 'refreeting'" 
      :refreetOf="freet._id" 
      @refreet-success="this.stopRefreeting" 
      @cancel-refreet="this.stopRefreeting"
    />
    <ReplyFreetForm 
      v-if="this.mode === 'replying'" 
      :replyTo="freet._id" 
      @reply-success="this.stopReplying" 
      @cancel-reply="this.stopReplying"
    />
    <Collect 
      v-if="this.mode === 'collecting'" 
      :freetId="freet._id" 
      @close-collect="this.stopCollecting" 
    />
    <div v-if="$store.state.username === freet.author && this.canHaveCategories">
      <div v-if="this.mode !== 'editing'" class="categories">
        <button class="category edit-categories-button" @click="startEditing">Edit categories</button>
        <router-link
          v-for="category in freet.categories"
          :key="freet._id + category"
          v-bind:to="'/categories/' + category"
        >
          <button
            class="category"
          > 
            {{ category }} 
          </button>
        </router-link>
      </div>
      <div v-else>
        <textarea
          class="content"
          :value="categories"
          @input="categories = $event.target.value"
        />
        <button
          @click="submitEdit"
        >
          Save changes
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import Collect from '@/components/Collection/Collect.vue';
import RefreetFreetForm from '@/components/Freet/RefreetFreetForm.vue'
import ReplyFreetForm from '@/components/Freet/ReplyFreetForm.vue'

export default {
  name: 'FreetComponent',
  components: {Collect, RefreetFreetForm, ReplyFreetForm},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    },
    // Whether or not this is the freet page view
    freetPage: {
      type: Boolean,
    }
  },
  data() {
    return {
      mode: 'none', // Can be none, refreeting, replying, collecting, editing categories
      canHaveCategories: !this.freet.replyTo && !this.freet.refreetOf,
      categories: this.freet.categories.join(', '), // Categories for the freet
      alerts: {},
    };
  },
  methods: {
    async read() {
      // only read if the post isn't yours, just for performance 
      if (this.freet.author !== this.$store.state.username) {
        const options = {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({'freetId': `${this.freet._id}`}),
        };

        try {
        const r = await fetch(`/api/read`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        } catch (e) {
          this.$store.commit('alert', {
            message: e, status: 'error'
          });
        }
      }
      this.$router.push(`/freets/${this.freet._id}`);
    },
    async like() {
      /**
       * Likes the freet.
       */
      const options = {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'freetId': `${this.freet._id}`}),
      };

      try {
        const r = await fetch(`/api/freets/like`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshUser');
        if (this.freetPage) {
          this.$store.commit('refreshFreet', this.freet._id);
        } else {
          this.$store.commit('refreshFreets');
        }
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    async unlike() {
      /**
       * Unlikes the freet.
       */
      const options = {
        method: 'DELETE', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/freets/like/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshUser');
        if (this.freetPage) {
          this.$store.commit('refreshFreet', this.freet._id);
        } else {
          this.$store.commit('refreshFreets');
        }
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    startRefreeting() {
      this.mode = 'refreeting';
    },
    stopRefreeting() {
      this.mode = 'none';
    },
    startReplying() {
      /**
       * Enables reply mode on this freet.
       */
      this.mode = 'replying';
    },
    stopReplying() {
      /**
       * Disables reply mode on this freet.
       */
      this.mode = 'none';
    },
    startCollecting() {
      /**
       * Enables collect mode on this freet.
       */
      this.mode = 'collecting';
    },
    stopCollecting() {
      /**
       * Disables collect mode on this freet.
       */
      this.mode = 'none'
    },
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.mode = 'editing'; // Keeps track of if a freet is being edited
      this.categories = this.freet.categories.join(', '); // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.mode = 'none';
      this.categories = this.freet.categories.join(', ');
    },
    async submitEdit() {
      /**
       * Updates freet with the new categories
       */
      const options = {
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ categories: this.categories }),
      };

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        if (this.freetPage) {
          this.$store.commit('refreshFreet', this.freet._id);
        } else {
          this.$store.commit('refreshFreets');
        }
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
      this.mode = 'none'; 
    },
    async deleteFreet() {
      /**
       * Deletes this freet.
       */
      const options = {
        method: 'DELETE', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        
        this.$store.commit('refreshFreets');
        this.$store.commit('alert', {
          message: 'Freet successfully deleted.', status: 'success'
        });
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
  }
};
</script>

<style scoped>
.freet {
  border: 1px solid var(--borders);
  border-radius: var(--border-radius);
  padding: 20px;
  position: relative;
}

.author {
  font-size: 1.25em;
  font-weight: bold;
}

.reply-details {
  display: flex;
  margin-bottom: 1em;
  font-style: italic;
}

.refreet-details {
  display: flex;
  flex-direction: column;
  gap: 1em;
  border: 1px solid var(--borders);
  padding: 1em;
  margin-bottom: 1em;
}

.refreet-details .refreeted-author {
  font-weight: bold;
}

.refreet-details .refreeted-content {
  color: var(--text);
}

.freet-content {
  margin-bottom: 1em;
}

footer {
  display: flex;
  align-items: center;
  gap: 2em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

footer div {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

footer div button {
  font-weight: bold;
  padding: 0.5em 0em;
}

.delete-button {
  color: var(--danger);
}

.categories {
  margin-top: 1em;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  max-height: 5em;
  overflow: scroll;
}

.category {
  background-color: var(--background-darker);
}

.category:hover {
  background-color: var(--background-darkest);
}

.edit-categories-button {
  font-style: italic;
}
</style>
