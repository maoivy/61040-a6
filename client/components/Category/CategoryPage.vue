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
        <div v-for="relevance in this.relevances" :key="relevance._id">
          <FreetComponent
            :freet="relevance.freet"
          />
          <div>
            <p>Relevant?</p>
            <button 
              :class="{ voted: relevance.relevantVoters.includes($store.state.userId) }"
              @click="toggleVote(relevance, true)"
            >
              Yes
            </button>
            <button 
              :class="{ voted: relevance.irrelevantVoters.includes($store.state.userId) }"
              @click="toggleVote(relevance, false)"
            >
              No
            </button>
          </div>
        </div>
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
    async toggleVote(relevance, relevant) {
      /**
       * Toggles the user's relevance vote.
       */
      // remove the vote if they clicked on the same direction as they already have
      const alreadyVotedRelevant = relevance.relevantVoters.includes(this.$store.state.userId);
      const alreadyVotedIrrelevant = relevance.irrelevantVoters.includes(this.$store.state.userId);
      // if a vote exists, delete it
      if (alreadyVotedRelevant || alreadyVotedIrrelevant) {
        console.log("deleting")
        const options = {
          method: 'DELETE', 
          headers: {'Content-Type': 'application/json'},
        };

        try {
          const r = await fetch(`/api/relevance/${relevance._id}`, options);
          const res = await r.json();
          if (!r.ok) {
            throw new Error(res.error);
          }
          this.getRelevances();
        } catch (e) {
          console.log(e);
        }
      }
      
      // if the vote is not the same as the old one, put in a new vote
      const sameVote = (alreadyVotedRelevant && relevant) || (alreadyVotedIrrelevant && !relevant) 
      if (!sameVote) {
        const options = {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ relevanceId: relevance._id, vote: relevant ? 'relevant' : 'irrelevant' })
        };

        try {
          const r = await fetch(`/api/relevance`, options);
          const res = await r.json();
          if (!r.ok) {
            throw new Error(res.error);
          }
          this.getRelevances();
        } catch (e) {
          console.log(e);
        }
      }
    },
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