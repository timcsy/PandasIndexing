const consola = require('consola')
const { question, getAnswer, questionData, answerData, realData } = require('./question')

class Room {
	constructor (room) {
		this.studentCount = 0
		this.teacherSocket = undefined
		this.sockets = {} // to store the incoming socket
		this.scores = {} // to store the student scores
		this.names = {} // to store the student names
		this.isExample = undefined
		this.questionCount = 0
		this.currentQuestion = undefined
		this.rightAnswer = undefined // to store the right anser of current question
		this.realAnswer = {} // to store the real answer of current question
		this.questions = [] // to store the questions
		this.answers = undefined // to store the number of answered
		this.totalTime = undefined
		this.time = undefined // to store the  left time
		this.times = {} // to store the left times
		this.timer = undefined
		this.timerRunning = false
		this.room = room
	}

	add (ctx) {
		ctx.websocket.send(JSON.stringify({ cmd: 'ready' }))

		ctx.websocket.on('message', (message) => {
			let id
			// do something with the message from client
			const msg = JSON.parse(message)
			consola.log(this.room, (id || 'teacher') + ': ' + message)
			if (msg.cmd === 'student:new') {
				id = ctx.cookies.get('id')
				if (!id) {
					if (msg.name in this.names) {
						ctx.websocket.send(JSON.stringify({ error: '名稱已被使用' }))
					}
					id = (++this.studentCount).toString()
					this.scores[id] = 0
				}
				this.sockets[id] = ctx.websocket
				this.names[id] = msg.name
				this.sendTeacher({ cmd: 'teacher:renew', room: this.room, students: this.names })
				this.sendStudent(id, { cmd: 'student:new', room: this.room, id })
			} else if (msg.cmd === 'teacher:new') {
				this.teacherSocket = ctx.websocket
				this.sendTeacher({ cmd: 'teacher:renew', room: this.room, students: this.names })
			} else if (msg.cmd === 'teacher:example') {
				this.isExample = true
				this.askQuestion(msg)
			} else if (msg.cmd === 'teacher:question') {
				this.isExample = false
				this.askQuestion(msg)
			} else if (msg.cmd === 'student:answer') {
				this.realAnswer[id] = msg.ans
				this.times[id] = this.time
				this.answers++
				this.sendTeacher({ cmd: 'teacher:update', answers: this.answers, time: this.time })
				if (this.answers === Object.keys(this.names).length) { this.result() }
			} else if (msg.cmd === 'teacher:finish') {
				if (this.timerRunning) { this.result() }
				const rank = Object.entries(this.scores).sort((a, b) => b[1] - a[1])
				this.sendTeacher({ cmd: 'teacher:finish', rank: rank.map(r => [this.names[r[0]], r[1]]) })
				this.teacherSocket.close()
				Object.keys(this.names).forEach((id) => {
					this.sendStudent(id, {
						cmd: 'student:finish',
						score: this.scores[id],
						rank: rank.findIndex(r => r[0] === id),
						wrong: this.questions.filter(q => !(q.rightness[id])).map(q => q.question.text)
					})
					this.sockets[id].close()
				})
			}
		})
	}

	sendTeacher (msg) {
		if (this.teacherSocket && this.teacherSocket.readyState === 1) {
			consola.log('to teacher :', msg)
			this.teacherSocket.send(JSON.stringify(msg))
		}
	}

	sendStudent (id, msg) {
		if (this.sockets[id] && this.sockets[id].readyState === 1) {
			consola.log('to', id, ':', msg)
			this.sockets[id].send(JSON.stringify(msg))
		}
	}

	askQuestion (msg) {
		const shape = msg.shape
		const type = msg.type
		const indexType = msg.indexType
		const same = msg.same
		const slice = msg.slice
		const simple = msg.simple
		this.answers = 0
		this.totalTime = this.time = msg.time
		this.currentQuestion = question(++this.questionCount, shape, this.names, type, indexType, same, slice, simple)
		this.realAnswer = {}
		this.rightAnswer = getAnswer(this.currentQuestion)
		this.sendTeacher({ cmd: 'teacher:question', question: questionData(this.currentQuestion) })
		Object.keys(this.names).forEach(id => this.sendStudent(id, { cmd: 'student:question' }))
		this.timerRunning = true
		this.timer = setInterval(() => {
			this.time--
			this.sendTeacher({ cmd: 'teacher:update', answers: this.answers, time: this.time })
			if (this.time === 0) { this.result() }
		}, 1000)
	}

	result () {
		clearInterval(this.timer)
		this.timerRunning = false
		const rightness = {}
		Object.keys(this.names).forEach(id => (rightness[id] = (this.realAnswer[id] !== undefined) && (this.realAnswer[id] === this.rightAnswer[id])))
		if (!this.isExample) {
			Object.keys(this.names).forEach(id => (
				this.scores[id] += rightness[id] ? Math.ceil(60 + 40 * this.times[id] / this.totalTime) : 0
			))
		}
		this.questions.push({ question: this.currentQuestion, rightness })
		const rank = Object.entries(this.scores).sort((a, b) => b[1] - a[1])
		this.sendTeacher({
			cmd: 'teacher:result',
			answerData: answerData(this.currentQuestion),
			realData: realData(this.currentQuestion, this.rightAnswer, this.realAnswer, this.names),
			rank: rank.map(r => [this.names[r[0]], r[1]])
		})
		Object.keys(this.names).forEach(id => (
			this.sendStudent(id, {
				cmd: 'student:result',
				right: rightness[id],
				score: this.scores[id],
				rank: rank.findIndex(r => r[0] === id)
			})
		))
	}
}

module.exports = Room
