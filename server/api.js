/* eslint-disable require-await */
const Router = require('koa-router')
const consola = require('consola')
const { question, getAnswer, questionData, answerData, realData } = require('./question')

const router = new Router()

let studentCount = 0
let teacherSocket
const sockets = {} // to store the incoming socket
const scores = {} // to store the student scores
const names = {} // to store the student names
let isExample
let questionCount = 0
let currentQuestion
let rightAnswer // to store the right anser of current question
const realAnswer = {} // to store the real answer of current question
const questions = [] // to store the questions
let answers // to store the number of answered
let totalTime
let time // to store the  left time
const times = {} // to store the left times
let timer

function sendTeacher (msg) {
	if (teacherSocket && teacherSocket.readyState === 1) {
		teacherSocket.send(JSON.stringify(msg))
	}
}
function sendStudent (id, msg) {
	if (sockets[id] && sockets[id].readyState === 1) {
		sockets[id].send(JSON.stringify(msg))
	}
}

function askQuestion (msg) {
	const shape = msg.shape
	const type = msg.type
	const indexType = msg.indexType
	const slice = msg.slice
	const simple = msg.simple
	answers = 0
	totalTime = time = msg.time
	currentQuestion = question(++questionCount, shape, names, type, indexType, slice, simple)
	rightAnswer = getAnswer(currentQuestion)
	sendTeacher({ cmd: 'teacher:question', question: questionData(currentQuestion) })
	Object.keys(names).forEach(id => sendStudent(id, { cmd: 'student:question' }))
	timer = setInterval(() => {
		time--
		sendTeacher({ cmd: 'teacher:update', answers, time })
		if (time === 0) { result() }
	}, 1000)
}

function result () {
	clearInterval(timer)
	const rightness = {}
	Object.keys(names).forEach(id => (rightness[id] = realAnswer[id] === rightAnswer[id]))
	//
	if (!isExample) {
		Object.keys(names).forEach(id => (
			scores[id] += rightness[id] ? Math.ceil(60 + 40 * times[id] / totalTime) : 0
		))
	}
	questions.push({ question: currentQuestion, rightness })
	const rank = Object.entries(scores).sort((a, b) => b[1] - a[1])
	sendTeacher({
		cmd: 'teacher:result',
		answerData: answerData(currentQuestion),
		realData: realData(currentQuestion, rightAnswer, realAnswer, names),
		rank: rank.map(r => [names[r[0]], r[1]])
	})
	Object.keys(names).forEach(id => (
		sendStudent(id, {
			cmd: 'student:result',
			right: rightness[id],
			score: scores[id],
			rank: rank.findIndex(r => r[0] === id)
		})
	))
}

router.all('/', async (ctx) => {
	// `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
	// the websocket is added to the context on `ctx.websocket`.
	let id
	ctx.websocket.send(JSON.stringify({ cmd: 'ready' }))

	ctx.websocket.on('message', function (message) {
		// do something with the message from client
		const msg = JSON.parse(message)
		consola.log((id || 'teacher') + ': ' + message)
		if (msg.cmd === 'student:new') {
			id = (++studentCount).toString()
			sockets[id] = ctx.websocket
			names[id] = msg.name
			scores[id] = 0
			sendTeacher({ cmd: 'teacher:renew', students: names })
			sendStudent(id, { cmd: 'student:new', id })
		} else if (msg.cmd === 'teacher:new') {
			teacherSocket = ctx.websocket
			sendTeacher({ cmd: 'teacher:renew', students: names })
		} else if (msg.cmd === 'teacher:example') {
			isExample = true
			askQuestion(msg)
		} else if (msg.cmd === 'teacher:question') {
			isExample = false
			askQuestion(msg)
		} else if (msg.cmd === 'student:answer') {
			realAnswer[id] = msg.ans
			times[id] = time
			answers++
			sendTeacher({ cmd: 'teacher:update', answers, time })
			if (answers === Object.keys(names).length) { result() }
		} else if (msg.cmd === 'teacher:finish') {
			const rank = Object.entries(scores).sort((a, b) => b[1] - a[1])
			sendTeacher({ cmd: 'teacher:finish', rank: rank.map(r => [names[r[0]], r[1]]) })
			Object.keys(names).forEach(id => (
				sendStudent(id, {
					cmd: 'student:finish',
					score: scores[id],
					rank: rank.findIndex(r => r[0] === id),
					wrong: questions.filter(q => !(q.rightness[id])).map(q => q.question.text)
				})
			))
		}
	})
})

module.exports = router
