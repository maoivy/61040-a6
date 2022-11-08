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
      >
        <div v-if="!this.editing" class="actions">
          <button @click="startEditing" class="edit-button">
            Edit
          </button>
          <button @click="deleteCollection" class="danger">
            Delete
          </button>
        </div>
        <div v-else class="actions">
          <button @click="stopEditing" class="danger">
            Cancel
          </button>
          <button @click="submitEdit" class="action">
            Save changes
          </button>
        </div>
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
      this.newName = this.collection.name;
    },
    stopEditing() {
      /**
       * Enables edit mode for the collection.
       */
      this.editing = false;
      this.newName = this.collection.name;
    },
    async submitEdit() {
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

.actions {
  display: flex;
  gap: 1em;
  margin-top: 0.75em;
}

.edit-button {
  background-color: var(--background-darker);
}

.edit-button:hover {
  background-color: var(--background-darkest);
}

input {
  font-family: inherit;
  font-size: inherit;
  padding: 0.25em 0.75em;
}
</style>
