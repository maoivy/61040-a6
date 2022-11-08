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
        {id: 'categories', label: 'Categories', value: this.category}
      ],
      title: `Create a freet in ${this.category}`,
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully created a freet!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
