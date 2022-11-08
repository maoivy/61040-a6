<!-- Form for creating freets (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFreetForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/freets',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: '', type: 'textarea'},
        {id: 'readmore', label: 'Read More', value: '', type: 'textarea'},
        {id: 'categories', label: 'Categories', value: ''}
      ],
      title: 'Freet',
      refreshFreets: true,
      callback: () => {
        this.$store.commit('alert', {
          message: 'Freet published.', status: 'success'
        });
      }
    };
  }
};
</script>
