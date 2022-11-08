<!-- Page for displaying a single Freet, its details, and replies -->

<template>
  <main v-on="$listeners">
    <section>
      <header>
        <h2>
          Freet {{this.$route.params.freetId}}
        </h2>
      </header>
      <section>
        <FreetComponent :freet="this.$store.state.freet" :freetPage="true" />
      </section>
      <section
        v-if="this.$store.state.replies.length"
      >
        <FreetComponent
          v-for="reply in this.$store.state.replies"
          :key="reply._id"
          :freet="reply"
        />
      </section>
    </section>
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
        this.$store.commit('updateFreet', res);
      } catch (e) {
        alert(e);
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
        this.$store.commit('updateReplies', res);
      } catch (e) {
        alert(e);
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

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
