<!-- Form for signing in (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'LoginForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users/session',
      method: 'POST',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'username', label: 'Username', value: ''},
        {id: 'password', label: 'Password', value: '', type: 'password'}
      ],
      title: 'Sign in',
      callback: () => {
        this.$router.push({name: 'Home'});
        this.$store.commit('alert', {
          message: 'You are now signed in!', status: 'success'
        });
        this.$store.commit('refreshUsername');
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshFollowing');
        this.$store.commit('refreshLikes');
        this.$store.commit('refreshCollections');
      }
    };
  }
};
</script>
