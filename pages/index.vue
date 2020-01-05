<template>
  <v-container fluid>
    <v-col
      justify="center"
      align="center"
    >
        <p>請輸入遊戲編號和暱稱，然後進入遊戲</p>
        <v-text-field
          v-model="room"
          label="請輸入遊戲編號"
          placeholder="（例：123，請看老師的頁面）"
          outlined
          solo
          counter="8"
        />
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
      room: '',
      name: ''
    }
  },
  methods: {
    submit () {
      this.$router.push({
          path: '/student?room=' + this.room + '&name=' + this.name
      })
    }
  }
}
</script>
