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
					<v-btn @click="initial()" class="mx-1">
						預設值
					</v-btn>
					<v-btn @click="start('example')" class="mx-1">
						試玩
					</v-btn>
					<v-btn @click="start('question')" class="mx-1">
						實戰
					</v-btn>
				</v-row>

				<v-row>
					<v-col class="px-4">
						<v-subheader>Row 的範圍</v-subheader>
						<v-range-slider
							v-model="shape.row"
							max="25"
							min="0"
							hide-details
							thumb-label="always"
							class="align-center my-8"
						>
							<template v-slot:prepend>
								<v-text-field
									v-model="shape.row[0]"
									class="mt-0 pt-0"
									hide-details
									single-line
									type="number"
									style="width: 60px"
								/>
							</template>
							<template v-slot:append>
								<v-text-field
									v-model="shape.row[1]"
									class="mt-0 pt-0"
									hide-details
									single-line
									type="number"
									style="width: 60px"
								/>
							</template>
						</v-range-slider>
					</v-col>

					<v-col class="px-4">
						<v-subheader>Column 的範圍</v-subheader>
						<v-range-slider
							v-model="shape.col"
							max="20"
							min="0"
							hide-details
							thumb-label="always"
							class="align-center my-8"
						>
							<template v-slot:prepend>
								<v-text-field
									v-model="shape.col[0]"
									class="mt-0 pt-0"
									hide-details
									single-line
									type="number"
									style="width: 60px"
								/>
							</template>
							<template v-slot:append>
								<v-text-field
									v-model="shape.col[1]"
									class="mt-0 pt-0"
									hide-details
									single-line
									type="number"
									style="width: 60px"
								/>
							</template>
						</v-range-slider>
					</v-col>
				</v-row>

				<v-row class="mx-1">
					<v-subheader class="pb-8 mb-4">
						秒數
					</v-subheader>
					<v-slider
						v-model="time"
						:min="1"
						thumb-label="always"
						class="my-2"
					>
						<template v-slot:append>
              <v-text-field
                v-model="time"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
              />
						</template>
					</v-slider>
				</v-row>

				<v-row class="mx-1 mb-8">
					<v-switch v-model="same" label="行列使用相同索引" class="mx-4" />
					<v-switch v-model="slice" label="使用 Slice 切片 ( : )" class="mx-4" />
					<v-switch v-model="simple" label="簡化單項" class="mx-4" />
				</v-row>
				<v-row class="mx-1">
					<v-select
						:items="typeItem"
						v-model="type"
						label="題目類型"
						outlined
						class="mx-4"
					/>
					<v-select
						:items="indexTypeItem"
						v-model="indexTypeRow"
						label="Row類型"
						outlined
						class="mx-4"
					/>
					<v-select
						:items="indexTypeItem"
						v-model="indexTypeCol"
						label="Column類型"
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
				<data-frame :data="question.data" />
			</v-col>
			<v-col v-else-if="view === 'result' && stage === 'answer'">
				<v-row class="ma-2">
					<h1>解答</h1>
					<v-spacer />
					<v-btn
						@click="viewReal()"
						class="mx-1"
					>
						看結果
					</v-btn>
				</v-row>
				<v-row justify="center" class="mb-4">
					<h2> {{ answerData.text }} </h2>
				</v-row>
				<data-frame :data="answerData.data" />
			</v-col>
			<v-col v-else-if="view === 'result' && stage === 'real'">
				<v-row class="ma-2">
					<h2>作答情形（</h2>
					<h2 class="light-green">
						綠：肯定答對/欄位名
					</h2>
					<h2>，</h2>
					<h2 class="grey">
						灰：否定答對
					</h2>
					<h2>，</h2>
					<h2 class="light-blue">
						藍：肯定未答
					</h2>
					<h2>，</h2>
					<h2 class="purple lighten-3">
						紫：否定未答
					</h2>
					<h2>，</h2>
					<h2 class="amber">
						黃：肯定答錯
					</h2>
					<h2>，</h2>
					<h2 class="red">
						紅：否定答錯
					</h2>
					<h2>）</h2>
					<v-spacer />
					<v-btn
						@click="viewRank()"
						class="mx-1"
					>
						看排名
					</v-btn>
				</v-row>
				<v-row justify="center" class="mb-4">
					<h2> {{ realData.text }} </h2>
				</v-row>
				<data-frame :data="realData.data" />
			</v-col>
			<v-col v-else-if="view === 'result' && stage === 'rank'">
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
					<h1>總成績</h1>
					<v-spacer />
					<h1>恭喜！！！</h1>
					<v-spacer />
					<v-btn @click="goHome()">
						回首頁
					</v-btn>
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
			stage: 'answer',
			students: [],
			shape: {
				row: [3, 8],
				col: [3, 6]
			},
			type: 'index',
			typeItem: [
				{ value: 'index', text: '單項索引' },
				{ value: 'same', text: '同行同列' },
				{ value: 'location', text: '範圍選取' }
			],
			indexTypeRow: 'contiInt',
			indexTypeCol: 'contiChar',
			indexTypeItem: [
				{ value: 'contiInt', text: '連續整數' },
				{ value: 'randInt', text: '隨機整數' },
				{ value: 'contiChar', text: '連續字元' },
				{ value: 'randChar', text: '隨機字元' },
				{ value: 'name', text: '英文單字' },
				{ value: 'day', text: '日期' },
				{ value: 'hour', text: '日期小時' }
			],
			same: false,
			slice: false,
			simple: false,
			question: { text: '', data: { headers: [], table: [] } },
			answers: 0,
			time: 20,
			answerData: { text: '', data: { headers: [], table: [] } },
			realData: { text: '', data: { headers: [], table: [] } },
			rank: []
		}
	},
	watch: {
    indexTypeRow () {
			if (this.same) {
				this.indexTypeCol = this.indexTypeRow
			}
		},
		indexTypeCol () {
			if (this.same) {
				this.indexTypeRow = this.indexTypeCol
			}
		},
		same () {
			if (this.same) {
				this.indexTypeCol = this.indexTypeRow
			}
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
		initial () {
			this.time = 20
			this.$set(this, 'shape', {
				row: [3, 8],
				col: [3, 6]
			})
			this.type = 'index'
			this.indexType = { row: 'contiInt', col: 'contiChar' }
		},
		start (type) {
			this.lastTime = this.time
			this.view = 'question'
			this.send({
				cmd: 'teacher:' + type,
				shape: this.shape,
				type: this.type,
				indexType: { row: this.indexTypeRow, col: this.indexTypeCol },
				same: this.same,
				slice: this.slice,
				simple: this.simple,
				time: this.time
			})
		},
		update (msg) {
			this.answers = msg.answers
			this.time = msg.time
		},
		result (msg) {
			this.view = 'result'
			this.stage = 'answer'
			this.$set(this, 'answerData', msg.answerData)
			this.$set(this, 'realData', msg.realData)
			this.$set(this, 'rank', msg.rank.slice(0, 5))
		},
		viewReal () {
			this.stage = 'real'
		},
		viewRank () {
			this.stage = 'rank'
		},
		finish () {
			this.send({ cmd: 'teacher:finish' })
		},
		total (msg) {
			this.view = 'finish'
			this.$set(this, 'rank', msg.rank)
		},
		goHome () {
			this.view = 'start'
			this.send({ cmd: 'teacher:new' })
		}
	}
}
</script>
