<!-- Page for category -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>Category: {{ $route.params.category }}</h2>
      </header>
      <CreateFreetFormCategory :category="$route.params.category" />
      <div v-if="this.relevances.length">
        {{ this.relevances }} 
        <!--<FreetComponent
          v-for="relevance in this.relevances"
          :key="relevance._id"
          :freet="relevance.freet"
        />-->
      </div>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetFormCategory from '@/components/Freet/CreateFreetFormCategory.vue';

export default {
  name: 'CategoryPage',
  components: {FreetComponent, CreateFreetFormCategory},
  data() {
    return {
      relevances: [],
    };
  },
  created() {
      this.getRelevances();
  },
  methods: {
    async getRelevances() {
      /**
       * Gets the profile for the user whose profile page this is.
       */
      const options = {
        method: 'GET', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/relevance?category=${this.$route.params.category}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.relevances = res;
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>