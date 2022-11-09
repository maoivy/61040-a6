<!-- Page for displaying a single Freet, its details, and replies -->

<template>
  <main>
    <article>
      <header>
        <h2>
          Freet 
        </h2>
      </header>
      <FreetComponent :freet="this.$store.state.freet" :freetPage="true" />
      <section
        v-if="this.$store.state.replies.length"
        class="replies"
      >
        <h3>Replies</h3>
        <FreetComponent
          v-for="reply in this.$store.state.replies"
          :key="reply._id"
          :freet="reply"
          :isFreetPageReply="true"
        />
      </section>
    </article>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, CreateFreetForm},
  data() {
    return {
      freet: {},
    }
  },
  created() {
    this.getFreet();
    this.getReplies();
  },
  methods: {
    async getFreet() {
      /**
       * Gets the Freet. Used on first load to update stale information in store.
       */
      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/freets?freetId=${this.$route.params.freetId}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        } 
        this.$store.commit('setFreet', res);
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    async getReplies() {
      /**
       * Gets the replies for this Freet. Used on first load to update stale information in store.
       */
      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/freets/reply?freetId=${this.$route.params.freetId}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('setReplies', res);
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    }
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.replies {
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

</style>
