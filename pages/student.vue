<template>
  <v-container fluid>
    <v-row
			justify="center"
			align="center"
		>
			<v-col v-if="view === 'start'">
				<v-row justify="center">
					<h2>
						你很快！<br>
						等等其他人喔！<br>
						第一名非你莫屬
					</h2>
				</v-row>
				<v-row justify="center" class="mt-10">
					<v-progress-circular
						:size="70"
						:width="7"
						color="blue"
						indeterminate
					/>
				</v-row>
			</v-col>
			<v-col v-else-if="view === 'question'">
				<v-row justify="center" class="mb-10">
					<h2> Hi，{{ name }}，請作答 </h2>
				</v-row>
				<v-row justify="center" class="mb-10">
					<v-btn
						@click="answer(true)"
						block
						x-large
						class="mx-2 my-5"
					>
						Yes
					</v-btn>
					<v-btn
						@click="answer(false)"
						block
						x-large
						class="mx-2 my-5"
					>
						No
					</v-btn>
				</v-row>
				<v-row justify="center">
					<h2> 目前積分： {{ score }} </h2>
				</v-row>
				<v-row justify="center">
					<h2> 目前排名： {{ rank }} </h2>
				</v-row>
			</v-col>
			<v-col v-else-if="view === 'wait'">
				<v-row justify="center">
					<h2>
						似乎信心十足<br>
						可能功敗垂成<br>
						好像有什麼誤解<br>
						真的有好好想過嗎？<br>
						這麼快，好嗎？<br>
						不過也回不去了哈哈哈
					</h2>
				</v-row>
				<v-row justify="center" class="mt-10">
					<v-progress-circular
						:size="70"
						:width="7"
						color="blue"
						indeterminate
					/>
				</v-row>
			</v-col>
			<v-col v-else-if="view === 'result'">
				<v-row
					justify="center"
					class="mb-10"
				>
					<v-icon
						v-if="right"
						size="100"
						color="green"
					>
						mdi-check-circle
					</v-icon>
					<v-icon
						v-else
						size="100"
						color="red"
					>
						mdi-close-circle
					</v-icon>
				</v-row>
				<v-row justify="center">
					<h2> 目前積分： {{ score }} </h2>
				</v-row>
				<v-row justify="center">
					<h2> 目前排名： {{ rank + 1 }} </h2>
				</v-row>
				<v-row justify="center">
					<h2 v-if="right">
						繼續努力！
					</h2>
					<h2 v-else>
						再接再厲！
					</h2>
				</v-row>
			</v-col>
			<v-col v-else-if="view === 'finish'">
				<v-row justify="center">
					<h1> 遊戲結束 </h1>
					<v-spacer />
					<v-btn @click="goHome()">
						回首頁
					</v-btn>
				</v-row>
				<v-row justify="center">
					<h2> 總積分： {{ score }} </h2>
				</v-row>
				<v-row justify="center">
					<h2> 總排名： {{ rank + 1 }} </h2>
				</v-row>
				<v-row justify="center">
					<h2> 恭喜你對索引有更近一步的認識！ </h2>
				</v-row>
				<v-row class="mt-10">
					<h2> 錯的題目： </h2>
				</v-row>
				<div v-for="q in wrong" :key="q">
					{{ q }}
				</div>
			</v-col>
    </v-row>
		<v-snackbar
      v-model="snackbar"
    >
      {{ error }}
      <v-btn
        @click="snackbar = false; goHome();"
        color="pink"
        text
      >
        重新輸入
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import config from '~/plugins/config'

export default {
	components: {
	},
	data () {
		return {
			room: undefined,
			view: 'start',
			name: '',
			score: 0,
			rank: 0,
			i: 0,
			j: 0,
			right: true,
			wrong: [], // question string,
			error: '',
			snackbar: false
		}
	},
	mounted () {
		const name = this.$route.query.name
		this.room = this.$route.query.room
		document.cookie = 'room=' + this.room
		this.ws = new WebSocket(config.websocketType + '://' + location.host + '/')
		this.ws.onmessage = (e) => {
			const message = e.data
			const msg = JSON.parse(message)
			// console.log(msg)
			if ('error' in msg) {
				this.view = ''
				this.error = msg.error
				this.snackbar = true
			}
			if (msg.cmd === 'ready') {
				this.send(name)
			} else if (msg.cmd === 'student:new') {
				this.room = msg.room
				document.cookie = 'room=' + this.room
				this.id = msg.id
				document.cookie = 'id=' + this.id
				this.name = name
			} else if (msg.cmd === 'student:question') {
				this.question(msg)
			} else if (msg.cmd === 'student:result') {
				this.result(msg)
			} else if (msg.cmd === 'student:finish') {
				this.finish(msg)
			}
		}
	},
	methods: {
		send (msg) {
			if (this.id === undefined) {
				this.ws.send(JSON.stringify({ cmd: 'student:new', name: msg }))
			} else {
				this.ws.send(JSON.stringify(msg))
			}
		},
		question (msg) {
			this.view = 'question'
		},
		answer (ans) {
			this.view = 'wait'
			this.send({ cmd: 'student:answer', ans })
		},
		result (msg) {
			this.view = 'result'
			this.right = msg.right
			this.score = msg.score
			this.rank = msg.rank
		},
		finish (msg) {
			this.view = 'finish'
			this.score = msg.score
			this.rank = msg.rank
			this.wrong = msg.wrong
			document.cookie = 'room= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'
			document.cookie = 'id= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'
		},
		goHome () {
			this.$router.push({
          path: '/'
      })
		}
	}
}
</script>
