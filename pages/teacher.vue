<template>
  <v-container fluid>
    <v-row
			justify="center"
			align="center"
		>
			<v-col v-if="view === 'start'">
				<v-row class="mb-8 mx-1">
					<h1> 目前人數： {{ students.length }} 人 </h1>
					<v-spacer />
					<v-btn @click="setting()">
						開始遊戲
					</v-btn>
				</v-row>
				<list-table :list="students" />
			</v-col>
			<v-col v-else-if="view === 'setting'">
				<v-row class="mb-8 mx-1">
					<h1> 設定 </h1>
					<v-spacer />
					<h1> 目前人數： {{ students.length }} 人 </h1>
					<v-spacer />
					<v-btn @click="start('example')" class="mx-1">
						試玩
					</v-btn>
					<v-btn @click="start('question')" class="mx-1">
						實戰
					</v-btn>
				</v-row>
				<v-row class="mb-8 mx-1">
					<h2> 大小 </h2>
				</v-row>
				<v-row class="mt-8">
					<v-text-field
						v-model="shape.row[0]"
						label="min row"
						outlined
						class="mx-4"
					/>
					<v-text-field
						v-model="shape.col[0]"
						label="min column"
						outlined
						class="mx-4"
					/>
				</v-row>
				<v-row>
					<v-text-field
						v-model="shape.row[1]"
						label="Max row"
						outlined
						class="mx-4"
					/>
					<v-text-field
						v-model="shape.col[1]"
						label="Max column"
						outlined
						class="mx-4"
					/>
				</v-row>
			</v-col>
			<v-col v-else-if="view === 'question'">
				<v-row class="mx-1">
					<v-spacer />
					<h2> 已作答： {{ answers }} 人， </h2>
					<h2> 剩 {{ time }} 秒 </h2>
				</v-row>
				<v-row justify="center" class="my-4">
					<h2> {{ question.text }} </h2>
				</v-row>
				<data-frame
					:data="question.data"
				/>
			</v-col>
			<v-col v-else-if="view === 'result'">
				<v-row class="ma-2">
					<h1>排名</h1>
					<v-spacer />
					<v-btn
						@click="finish()"
						class="mx-1"
					>
						結束
					</v-btn>
					<v-btn
						@click="setting()"
						class="mx-1"
					>
						下一題
					</v-btn>
				</v-row>
				<rank-table :rank="rank" />
			</v-col>
			<v-col v-else-if="view === 'finish'">
				<v-row justify="center" class="ma-2">
					<h1>總成績，恭喜！！！</h1>
				</v-row>
				<rank-table :rank="rank" />
			</v-col>
		</v-row>
  </v-container>
</template>

<script>
import config from '~/plugins/config'
import ListTable from '~/components/ListTable'
import DataFrame from '~/components/DataFrame'
import RankTable from '~/components/RankTable'

export default {
	components: {
		ListTable,
		DataFrame,
		RankTable
	},
	data () {
		return {
			view: 'start',
			students: [],
			shape: {
				row: [3, 8],
				col: [3, 6]
			},
			type: 'index',
			indexType: { row: 'contiInt', col: 'contiChar' },
			question: { text: '', data: { headers: [], table: [] } },
			answers: 0,
			time: 20,
			rank: []
		}
	},
	mounted () {
		this.ws = new WebSocket(config.websocketType + '://' + location.host + '/')
		this.ws.onmessage = (e) => {
			const message = e.data
			const msg = JSON.parse(message)
			// console.log(msg)
			if (msg.cmd === 'ready') {
				this.send({ cmd: 'teacher:new' })
			} else if (msg.cmd === 'teacher:renew') {
				this.renew(msg)
			} else if (msg.cmd === 'teacher:question') {
				this.$set(this, 'question', msg.question)
			} else if (msg.cmd === 'teacher:update') {
				this.update(msg)
			} else if (msg.cmd === 'teacher:result') {
				this.result(msg)
			} else if (msg.cmd === 'teacher:finish') {
				this.total(msg)
			}
		}
	},
	methods: {
		send (msg) {
			this.ws.send(JSON.stringify(msg))
		},
		renew (msg) {
			this.$set(this, 'students', Object.values(msg.students))
		},
		setting () {
			this.view = 'setting'
			this.time = this.lastTime || 20
		},
		start (type) {
			this.lastTime = this.time
			this.view = 'question'
			this.send({
				cmd: 'teacher:' + type,
				shape: this.shape,
				type: this.type,
				indexType: this.indexType,
				time: this.time
			})
		},
		update (msg) {
			this.answers = msg.answers
			this.time = msg.time
		},
		result (msg) {
			this.view = 'result'
			this.$set(this, 'rank', msg.rank.slice(0, 5))
		},
		finish () {
			this.send({ cmd: 'teacher:finish' })
		},
		total (msg) {
			this.view = 'finish'
			this.$set(this, 'rank', msg.rank)
		}
	}
}
</script>
