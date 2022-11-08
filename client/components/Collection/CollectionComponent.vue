<!-- Reusable component representing a single collection and its actions -->

<template>
  <article
    class="collection"
  >
    <header>
      <h3 v-if="!this.editing" class="name">
        {{ collection.name }}
      </h3>
      <input
        v-if="this.editing"
        type="text"
        class="name"
        :value="newName"
        @input="newName = $event.target.value"
      />
      <div
        v-if="$store.state.username === collection.user"
        class="actions"
      >
        <button v-if="!this.editing" @click="startEditing">
          Edit
        </button>
        <button v-if="this.editing" @click="stopEditing">
          Save changes
        </button>
        <button @click="deleteCollection">
          🗑️ Delete
        </button>
      </div>
    </header>
    <div v-if="collection.freets.length">
      <FreetComponent 
        v-for="freet in collection.freets"
        :freet="freet"
        :key="freet._id"
      />
    </div>
  </article>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'CollectionComponent',
  components: {FreetComponent},
  props: {
    // Data from the collection
    collection: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      newName: this.collection.name,
      editing: false,
    };
  },
  methods: {
    async deleteCollection() {
      /**
       * Deletes the collection.
       */
      const options = {
        method: 'DELETE', 
        headers: {'Content-Type': 'application/json'},
      };

      try {
        const r = await fetch(`/api/collection/${this.collection._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        this.$store.commit('refreshCollections');
        this.$emit('collection-deleted');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    },
    startEditing() {
      /**
       * Enables edit mode for the collection.
       */
      this.editing = true;
    },
    async stopEditing() {
      /**
       * Saves the changes made to the collection.
       */
      const options = {
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 'name': this.newName }),
      };

      try {
        const r = await fetch(`/api/collection/${this.collection._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        this.$store.commit('refreshCollections');
        this.$emit('collection-edited');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
      this.editing = false;
    },
  }
};
</script>

<style scoped>
.collection {
    border: 1px solid var(--borders);
    border-radius: var(--border-radius);
    padding: 20px;
    position: relative;
}
</style>
