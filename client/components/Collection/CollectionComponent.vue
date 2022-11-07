<!-- Reusable component representing a single collection and its actions -->

<template>
  <article
    class="collection"
  >
    <header>
      <h3 class="name">
        @{{ collection.name }}
      </h3>
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
