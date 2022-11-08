<!-- Form for changing password (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ChangePasswordForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users',
      method: 'PATCH',
      hasBody: true,
      fields: [
        {id: 'password', label: 'Password', value: '', type: 'password'}
      ],
      title: 'Change password',
      callback: () => {
        this.$store.commit('alert', {
          message: 'Password changed.', status: 'success'
        });
      }
    };
  }
};
</script>
