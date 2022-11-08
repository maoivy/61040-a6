<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <form @submit.prevent="submit">
    <h3>{{ title }}</h3>
    <article
      v-if="fields.length"
    >
      <div
        v-for="field in fields"
        :key="field.id"
        class="field"
      >
        <label :for="field.id">{{ field.label }}:</label>
        <textarea
          v-if="field.type === 'textarea'"
          :name="field.id"
          :value="field.value"
          @input="field.value = $event.target.value"
        />
        <input
          v-else
          :type="field.id === 'password' ? 'password' : 'text'"
          :name="field.id"
          :value="field.value"
          @input="field.value = $event.target.value"
        >
      </div>
    </article>
    <article v-else>
      <p>{{ content }}</p>
    </article>
    <footer>
      <button
        type="submit"
        class="submit"
        :class="{ danger: this.danger }"
      >
        {{ title }}
      </button>
      <button
        v-if="cancel"
        @click="this.cancelCallback"
      >
        Cancel
      </button>
    </footer>
  </form>
</template>

<script>

export default {
  name: 'BlockForm',
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: '', // Url to submit form to
      method: 'GET', // Form request method
      hasBody: false, // Whether or not form request has a body
      addToBody: {}, // Constants to add to the form's body
      setUsername: false, // Whether or not stored username should be updated after form submission
      refreshFreets: false, // Whether or not stored freets should be updated after form submission
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: null, // Function to run after successful form submission
      cancel: false,
      danger: false, // Whether submitting the form is a "dangerous" event
      cancelCallback: null, // Function to run after cancelling form
    };
  },
  methods: {
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */
      const options = {
        method: this.method,
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };
      if (this.hasBody) {
         const formBody = Object.fromEntries(
          this.fields.map(field => {
            const {id, value} = field;
            field.value = '';
            return [id, value];
          })
        );
        let body = formBody;
        if (this.addToBody) {
          body = {...formBody, ...this.addToBody};
        }
        options.body = JSON.stringify(body);
      }

      try {
        const r = await fetch(this.url, options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        if (this.setUsername) {
          const text = await r.text();
          const res = text ? JSON.parse(text) : {user: null};
          this.$store.commit('setUsername', res.user ? res.user.username : null);
        }

        if (this.refreshFreets) {
          this.$store.commit('refreshFreets');
        }

        if (this.callback) {
          this.callback();
        }
      } catch (e) {
      console.log(e);
        this.$store.commit('alert', {
          message: e, status: 'error'
        });
      }
    }
  }
};
</script>

<style scoped>
form {
  border: 1px solid var(--borders);
  border-radius: 0.5em;
  padding: 0.75em 1.5em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5em;
  position: relative;
}

form > article p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

textarea {
   font-family: inherit;
   font-size: inherit;
}

.field {
  display: flex;
  align-items: center;
  gap: 1em;
}

.field input, .field textarea {
  flex-grow: 2;
}

footer {
  display: flex;
  justify-content: flex-end;
}

.submit, .danger {
  font-weight: bold;
  padding: 0.5em 1em;
  border-radius: 0.5em;
}

.submit {
  background-color: var(--links);
  color: var(--links-text);
}

.danger {
  background-color: var(--danger);
  color: var(--danger-text);
}

</style>
