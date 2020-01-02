<template>
  <v-card>
		<v-data-table
			:headers="headers"
			:items="table"
			hide-default-footer
		/>
  </v-card>
</template>

<script>
export default {
	props: {
		rank: {
			type: Array,
			default () {
        return []
      }
		}
	},
	data () {
		return {
			headers: [
				{ text: '名次', value: 'rank' },
				{ text: '暱稱', value: 'name' },
				{ text: '積分', value: 'score' }
			]
		}
	},
	computed: {
		table () {
			return this.rank.map((r, i) => ({ rank: '第' + (i + 1) + '名', name: r[0], score: r[1] }))
		}
	}
}
</script>
