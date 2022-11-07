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
      >
        <span v-if="addingTo.includes(collection._id)">+</span>
        <span v-if="removingFrom.includes(collection._id)">-</span>
        <button @click="addOrRemove(collection)">
          {{ collection.name }}
        </button>
      </div>
    </section>
    <footer>
      <button @click="close">Cancel</button>
      <button 
        :disabled="!this.addingTo.length && !this.removingFrom.length"
        @click="saveChanges">
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
        // add to arrays depending on current membership
        if (collection.freets.includes(this.freetId)) {
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
          alert(e);
        }
      }
      this.$store.commit('refreshCollections');
      this.close();
    },
  }
};
</script>

<style scoped>
.collect {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
