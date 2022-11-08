<!-- Component representing the popup to add a Freet to a collection  -->

<template>
  <article
    class="collect"
  >
    <header>
      <h3>Add/remove Freet in Collections</h3>
    </header>
    <section>
      <div
        v-for="collection in this.$store.state.collections"
        :key="collection._id"
        class="collection-entry"
      >
        <span v-if="addingTo.includes(collection._id)" class="symbol">+</span>
        <span v-if="removingFrom.includes(collection._id)" class="symbol">–</span>
        <button @click="addOrRemove(collection)" class="collection">
          {{ collection.name }}
        </button>
      </div>
    </section>
    <footer>
      <button @click="close" class="danger">Cancel</button>
      <button 
        :disabled="!this.addingTo.length && !this.removingFrom.length"
        @click="saveChanges"
        :class="{ disabled: !this.addingTo.length && !this.removingFrom.length, action: this.addingTo.length || this.removingFrom.length }"
      >
        Save
      </button>
    </footer>
  </article>
</template>

<script>
export default {
  name: 'Collect',
  props: {
    // Data from the collection
    freetId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      addingTo: [],
      removingFrom: [],
    };
  },
  methods: {
    addOrRemove(collection) {
      // if in arrays, remove
      if (this.addingTo.includes(collection._id)) {
        this.addingTo = this.addingTo.filter((id) => id !== collection._id);
      } else if (this.removingFrom.includes(collection._id)) {
        this.removingFrom = this.removingFrom.filter((id) => id !== collection._id);
      } else {
        if (Object.assign([], collection.freets).some((freet) => freet._id === this.freetId)) {
          this.removingFrom.push(collection._id);
        } else {
          this.addingTo.push(collection._id);
        }
      }
    },
    close() {
      this.$emit('close-collect');
    },
    async saveChanges() {
      /**
       * Updates collections of Freet.
       */
      for (const collectionId of [...this.addingTo, ...this.removingFrom]) {
        const change = this.addingTo.includes(collectionId) ? 'add' : 'remove'
        const options = {
          method: 'PATCH', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 'freetId': `${this.freetId}`, 'addOrRemove': change }),
        };
        console.log(options);
        console.log(`/api/collection/${collectionId}`);

        try {
          const r = await fetch(`/api/collection/${collectionId}`, options);
          const res = await r.json();
          if (!r.ok) {
            throw new Error(res.error);
          }
          console.log(res);
        } catch (e) {
          this.$store.commit('alert', {
            message: e, status: 'error'
          });
        }
      }
      this.$store.commit('refreshCollections');
      this.close();
    },
  }
};
</script>

<style scoped>
footer {
  display: flex;
  gap: 1em;
  align-items: center;
  margin-top: 1em;
}

footer .disabled:hover {
  cursor: auto;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.collection-entry {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.collect {
    border: 1px solid var(--borders);
    padding: 20px;
    position: relative;
}

.collection {
  background-color: var(--background-darker);
}

.symbol {
  font-weight: bold;
  font-size: 1.5em;
}
</style>
