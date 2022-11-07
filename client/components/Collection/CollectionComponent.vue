<!-- Reusable component representing a single collection and its actions -->

<template>
  <article
    class="collection"
  >
    <header>
      <h3 class="name">
        @{{ collection.name }}
      </h3>
      {{ collection.freets }}
      <div
        v-if="$store.state.username === collection.user"
        class="actions"
      >
        <button @click="startEditing">
          Edit
        </button>
        <button @click="deleteCollection">
          🗑️ Delete
        </button>
      </div>
    </header>
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
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async startEditing() {
      /**
       * Deletes the collection.
       */
      const options = {
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 'name': 'meow' }),
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
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
.collection {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
