<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <div v-if="freet.replyTo">
        Replying to:
        <router-link
          v-bind:to="'/freets/' + freet.replyTo._id"
        >
          <p>@{{ freet.replyTo.author }}</p>
          <p>{{ freet.replyTo.content }}</p>
        </router-link>
      </div>
      <router-link
        v-bind:to="'/users/' + freet.author"
      >
        <h3 class="author">
          @{{ freet.author }}
        </h3>
      </router-link>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <p
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
      v-bind:to="'/freets/' + freet.refreetOf._id"
      v-if="freet.refreetOf"
    >
      <div>
        <p>@{{ freet.refreetOf.author }}</p>
        <p>{{ freet.refreetOf.content }}</p>
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
          v-if="$store.state.likes && !$store.state.refreets.includes(freet._id)"
          @click="startRefreeting"
        >
          Refreet
        </button>
        <span
          v-else
          
        >
          Refreeted
        </span>
        
        <span> {{ freet.refreets }} </span>
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
      <div v-if="this.mode !== 'editing'">
        <button class="category" @click="startEditing">Edit categories</button>
          <span 
            v-for="category in freet.categories"
            class="category"
          > 
            <router-link
              v-bind:to="'/categories/' + category"
            >
              {{ category }} 
            </router-link>
          </span>
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
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
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
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
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
