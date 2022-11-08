<!-- Page for category -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>Category: {{ $route.params.category }}</h2>
      </header>
      <div class="content-wrapper">
        <CreateFreetFormCategory :category="$route.params.category" />
        <div v-if="this.relevances.length" class="content-wrapper">
          <div v-for="relevance in this.relevances" :key="relevance._id">
            <FreetComponent
              :freet="relevance.freet"
            />
            <div class="center">
              <div class="relevance-vote">
                <p>Is this Freet relevant to <span class="bold">{{ $route.params.category }}</span>?</p>
                <button 
                  class="vote-button"
                  :class="{ action: relevance.relevantVoters.includes($store.state.userId) }"
                  @click="toggleVote(relevance, true)"
                >
                  Yes
                </button>
                <button 
                  class="vote-button"
                  :class="{ danger: relevance.irrelevantVoters.includes($store.state.userId) }"
                  @click="toggleVote(relevance, false)"
                >
                  No
                </button>
              </div>
            </div>
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
          this.$store.commit('alert', {
            message: e, status: 'error'
          });
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
          this.$store.commit('alert', {
            message: e, status: 'error'
          });
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
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
  },
};
</script>

<style scoped>
.vote-button {
  background-color: var(--background-darker);
  color: var(--text);
}

.action {
  background-color: var(--links);
  color: var(--links-text);
}

.danger {
  background-color: var(--danger);
  color: var(--danger-text);
}

.relevance-vote {
  display: flex;
  align-items: center;
  padding: 0.5em 0em 0em 0em;
  gap: 0.5em;
}
</style>