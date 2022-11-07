<!-- Page for displaying a single Freet, its details, and replies -->

<template>
  <main>
    <section>
      <header>
        <h2>
          Freet {{this.$route.params.freetId}}
        </h2>
      </header>
      <section>
        <FreetComponent :freet="this.freet" />
      </section>
      <section
        v-if="this.replies.length"
      >
        <FreetComponent
          v-for="reply in this.replies"
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
      replies: [],
    }
  },
  created() {
    this.getFreet();
    this.getReplies();
  },
  methods: {
    async getFreet() {
      /**
       * Gets the replies for this Freet.
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
        this.freet = res;
      } catch (e) {
        alert(e);
      }
    },
    async getReplies() {
      /**
       * Gets the replies for this Freet.
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
        this.replies = res;
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
