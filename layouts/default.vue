<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="refresh()">
          <v-list-item-action>
            <v-icon>mdi-refresh</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="'清除資訊'" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
	data () {
		return {
			clipped: false,
			drawer: false,
			fixed: false,
			items: [
				{
					icon: 'mdi-account',
					title: '學生',
					to: '/'
				},
				{
					icon: 'mdi-account',
					title: '老師',
					to: '/teacher'
				}
			],
			title: 'Matrix'
		}
  },
  methods: {
    refresh () {
      document.cookie = 'room= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'
			document.cookie = 'id= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
}
</script>
