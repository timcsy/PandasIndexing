<template>
  <v-card>
		<v-data-table
			:headers="data.headers"
			:items="data.table"
			hide-default-footer
			disable-sort
		/>
  </v-card>
</template>

<script>
export default {
	props: {
		data: {
			type: Object,
			default () {
        return { headers: [], table: [] }
      }
		}
	},
	data () {
		return {}
	},
	computed: {}
}
</script>
