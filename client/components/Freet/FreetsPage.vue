<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username" class="content-wrapper">
      <header>
        <h2>Feed</h2>
        <div class="filter-buttons">
          <button 
            @click="setFilter('default')"
            :class="{ active: $store.state.filter === 'default' }"
          >
            All freets
          </button>
          <button 
            @click="setFilter('original')"
            :class="{ active: $store.state.filter === 'original' }"
          >
            Freets
          </button>
          <button 
            @click="setFilter('refreets')"
            :class="{ active: $store.state.filter === 'refreets' }"
          >
            Refreets
          </button>
        </div>
      </header>
      <CreateFreetForm />
      <section>
        <section
          v-if="$store.state.freets.length"
          class="content-wrapper"
        >
          <FreetComponent
            v-for="freet in $store.state.freets"
            :key="freet.id"
            :freet="freet"
          />
        </section>
        <article
          v-else
        >
          <h3>No freets found.</h3>
        </article>
      </section>
    </section>
    <section v-else class="logged-out">
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
      </article>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, CreateFreetForm},
  methods: {
    async setFilter(filter) {
      /**
       * Sets the Feed filter.
       */
      const options = {
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 'filter': filter }),
      };

      try {
        const r = await fetch(`/api/users/`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('refreshFreets');
        this.$store.commit('setFilter', filter);
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
section {
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 0;
}

.filter-buttons {
  display: flex;
  gap: 0.5em;
}

header button {
  font-weight: bold;
  font-size: 1em;
}

header button:hover {
  background-color: var(--background-darker);
}

header .active {
  background-color: var(--background-darkest);
}

.logged-out header {
  margin-bottom: 1.25em;
}

/* section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
} */
</style>
