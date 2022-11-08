<!-- Form for creating freets in a category (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFreetFormCategory',
  props: {
    // category being viewed
    category: {
      type: String,
      required: true
    }
  },
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/freets',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: '', type: 'textarea'},
        {id: 'readmore', label: 'Read More', value: '', type: 'textarea'},
        {id: 'categories', label: 'Categories', value: this.category, type: 'textarea'}
      ],
      title: `Write a new Freet in ${this.category}`,
      refreshFreets: true,
      callback: () => {
        this.$store.commit('alert', {
          message: `Freet published to ${category}.`, status: 'success'
        });
      }
    };
  }
};
</script>
