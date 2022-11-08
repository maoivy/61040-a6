<!-- Form for creating a new collection (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
    name: 'NewCollectionForm',
    mixins: [BlockForm],
    data() {
        return {
            url: '/api/collection/',
            method: 'POST',
            hasBody: true,
            title: 'Add a new collection',
            fields: [
                {id: 'name', label: 'Name', value: ''}
            ],
            content: 'Create a new collection...',
            callback: () => {
                this.$emit('new-collection');
                this.$store.commit('refreshCollections');
                this.$store.commit('alert', {
                    message: 'New collection created.', status: 'success'
                });
            }
        };
    }
};
</script>
    