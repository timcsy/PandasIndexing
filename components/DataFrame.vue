<template>
  <v-card>
		<v-simple-table>
			<template v-slot:default>
				<thead>
					<tr>
						<th />
						<th v-for="col in data.headers" :key="col.key" :class="col.color + ' font-weight-black subtitle-2'">
							{{ col.text }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in data.table" :key="row.key">
						<td :class="row.row.color + ' font-weight-black subtitle-2'">
							{{ row.row.text }}
						</td>
						<td v-for="item in row.items" :key="item.key" :class="item.color">
							{{ item.text }}
						</td>
					</tr>
				</tbody>
			</template>
		</v-simple-table>
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
