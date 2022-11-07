<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <p
      v-else
      class="content"
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
        <button @click="startReplying">
          Reply
        </button>
        <span> {{ freet.replies }} </span>
      </div>
      <button @click="startCollecting">
          Collect
      </button>
    </footer>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
    <ReplyFreetForm 
      v-if="replying" 
      :replyTo="freet._id" 
      @reply-success="this.stopReplying" 
      @cancel-reply="this.stopReplying"
    />
    <Collect 
      v-if="collecting" 
      :freetId="freet._id" 
      @close-collect="this.stopCollecting" 
    />
    <div>
      <span> {{ freet.categories }} </span>
    </div>
  </article>
</template>

<script>
import Collect from '@/components/Collection/Collect.vue';
import ReplyFreetForm from '@/components/Freet/ReplyFreetForm.vue'

export default {
  name: 'FreetComponent',
  components: {Collect, ReplyFreetForm},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    },
    // Whether or not this is the freet page view
    freetPage: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      replying: false, // Whether the user is currently replying to this freet
      collecting: false, // Whether or not the freet's collections are currently being managed
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
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
          console.log(e);
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

        this.$store.commit('refreshLikes');
        if (this.freetPage) {
          this.$store.commit('refreshFreet', this.freet._id);
        } else {
          this.$store.commit('refreshFreets');
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
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

        this.$store.commit('refreshLikes');
        if (this.freetPage) {
          this.$store.commit('refreshFreet', this.freet._id);
        } else {
          this.$store.commit('refreshFreets');
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    startReplying() {
      /**
       * Enables reply mode on this freet.
       */
      this.replying = true;
      this.collecting = false;
    },
    stopReplying() {
      /**
       * Disables reply mode on this freet.
       */
      this.replying = false; 
    },
    startCollecting() {
      /**
       * Enables collect mode on this freet.
       */
      this.replying = false; 
      this.collecting = true;
    },
    stopCollecting() {
      /**
       * Disables collect mode on this freet.
       */
      this.collecting = false; 
    },
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: async () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
          // update replies in store if a reply was deleted on a freet page
          if (this.$route.params.freetId) {
            this.$store.commit('refreshReplies', this.$route.params.freetId);
          }
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.freet {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}

footer {
  display: flex;
  gap: 2em;
}
</style>
