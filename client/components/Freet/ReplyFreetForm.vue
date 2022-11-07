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
        {id: 'content', label: 'Content', value: ''},
        {id: 'readmore', label: 'Read More', value: ''},
      ],
      title: 'Reply to this freet',
      refreshFreets: true,
      cancel: true,
      cancelCallback: () => {
        this.$emit('cancel-reply');
      },
      callback: async () => {
        // will always want to update stored replies: only matters if on Freet page
        const options = {
          method: 'GET', 
          headers: {'Content-Type': 'application/json'},
        };
        const r = await fetch(`/api/freets/reply?freetId=${this.replyTo}`, options);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateReplies', res);

        console.log("Successfully replied to freet!");
        this.$emit('reply-success');
      }
    };
  }
};
</script>
