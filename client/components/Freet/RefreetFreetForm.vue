<!-- Form for refreeting freets -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'RefreetFreetForm',
  props: {
    // freet being refreeted
    refreetOf: {
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
      addToBody: { 'refreetOf': this.refreetOf },
      fields: [
        {id: 'content', label: 'Content', value: '', type: 'textarea'},
        {id: 'readmore', label: 'Read More', value: '', type: 'textarea'},
      ],
      title: 'Refreet this freet',
      refreshFreets: true,
      cancel: true,
      cancelCallback: () => {
        this.$emit('cancel-refreet');
      },
      callback: async () => {
        // will always want to update stored replies: only matters if on Freet page
        this.$store.commit('refreshFreet', this.refreetOf);

        this.$store.commit('alert', {
          message: 'Refreet published.', status: 'success'
        });
        this.$emit('refreet-success');
      }
    };
  }
};
</script>
