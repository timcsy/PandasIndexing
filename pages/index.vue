<template>
  <v-container fluid>
    <v-col
      justify="center"
      align="center"
    >
        <p>輸入暱稱然後進入遊戲</p>
        <v-text-field
          v-model="name"
          label="請輸入暱稱"
          placeholder="（例：谷關空氣）"
          outlined
          solo
          counter="8"
        />
        <v-btn @click="submit()">
          進入遊戲
        </v-btn>
    </v-col>
  </v-container>
</template>

<script>
export default {
  components: {
  },
  data () {
    return {
      name: ''
    }
  },
  methods: {
    submit () {
      this.$router.push({
          path: '/student?name=' + this.name
      })
    }
  }
}
</script>
