<template>
  <v-card>
		<v-data-table
			:headers="headers"
			:items="table"
			hide-default-footer
			hide-default-header
		/>
  </v-card>
</template>

<script>
export default {
	props: {
		list: {
			type: Array,
			default () {
        return []
      }
		}
	},
	data () {
		return {
			headers: [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }]
		}
	},
	computed: {
		table () {
			if (!this.list.slice) { return [] }
			const newTable = []
			let count = -1
			let row = {}
			const reverseList = Object.values(this.list).reverse()
			for (const i in reverseList) {
				if (count === -1) { count++ } else if (count === 0) {
					newTable.push(row)
					row = {}
				}
				row[parseInt(count)] = reverseList[i]
				count = (count + 1) % 4
			}
			while (count !== 0) {
				row[parseInt(count)] = ''
				count = (count + 1) % 4
			}
			newTable.push(row)
			return newTable
		}
	}
}
</script>
