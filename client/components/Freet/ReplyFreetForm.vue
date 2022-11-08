<!-- Form for replying to freets -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ReplyFreetForm',
  props: {
    // freet being replied to
    replyTo: {
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
      addToBody: { 'replyTo': this.replyTo },
      fields: [
        {id: 'content', label: 'Content', value: '', type: 'textarea'},
        {id: 'readmore', label: 'Read More', value: '', type: 'textarea'},
      ],
      title: 'Reply to this freet',
      refreshFreets: true,
      cancel: true,
      cancelCallback: () => {
        this.$emit('cancel-reply');
      },
      callback: async () => {
        // will always want to update stored replies: only matters if on Freet page
        this.$store.commit('refreshFreet', this.replyTo);
        this.$store.commit('refreshReplies', this.replyTo);

        this.$store.commit('alert', {
          message: 'Reply published.', status: 'success'
        });
        this.$emit('reply-success');
      }
    };
  }
};
</script>
