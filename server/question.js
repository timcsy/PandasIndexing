const consola = require('consola')
const randomWords = require('random-words')
const { random, randomDate, shuffle, nickname, baseConverter } = require('./util')

function generateTable (shape, names) {
	let row = -1
	let col
	let N = 0
	while (row === -1) {
		row = random(shape.row[0], shape.row[1])
		col = random(shape.col[0], shape.col[1])
		N = row * col
		if (names.length > N) {
			row = -1
		}
	}
	let items = Object.entries(names)
	while (items.length < N) { items.push(['n' + items.length, nickname()]) }
	items = shuffle(items)
	const table = []
	while (items.length) { table.push(items.splice(0, col)) }
	return { size: { row, col }, table } // table: [[[id, name]]]
}

function charIndex (n) {
	const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	return baseConverter(parseInt(n), 10, 62, charTable)
}

/**
 * Generate index name for rows and columns.
 * @param {'contiInt'|'randInt'|'contiChar'|'randChar'|'name'|'day'|'hour'} type type of index.
 */
function generateIndex (type, num) {
	if (type === 'contiInt') {
		const base = random(0, 10000)
		const index = []
		for (let i = 0; i < num; i++) { index.push(base + i) }
		return index
	} else if (type === 'randInt') {
		let high = 0
		while (high < num) { high = random(0, 10000) }
		const index = []
		for (let n = 0; n < num; n++) {
			let i = random(0, high)
			while (index.includes(i)) { i = random(0, high) }
			index.push(i)
		}
		return index
	} else if (type === 'contiChar') {
		const base = random(0, 1000)
		const index = []
		for (let i = 0; i < num; i++) { index.push(charIndex(base + i)) }
		return index
	} else if (type === 'randChar') {
		let high = 0
		while (high < num) { high = random(0, 1000) }
		const index = []
		for (let n = 0; n < num; n++) {
			let i = random(0, high)
			while (index.includes(i)) { i = random(0, high) }
			index.push(charIndex(i))
		}
		return index
	} else if (type === 'name') {
		return randomWords(num)
	} else if (type === 'day') {
		const datetime = randomDate()
		const index = []
		for (let i = 0; i < num; i++) {
			datetime.setDate(datetime.getDate() + 1)
			index.push(datetime.toISOString().split('T')[0])
		}
		return index
	} else if (type === 'hour') {
		const datetime = randomDate()
		datetime.setMinutes(0)
		datetime.setSeconds(0)
		const index = []
		for (let i = 0; i < num; i++) {
			datetime.setHours(datetime.getHours() + 1)
			index.push(datetime.toISOString().split('.')[0].split('T').join(' '))
		}
		return index
	}
}

function printIndex (index, type) {
	if (type === 'contiInt' || type === 'randInt') {
		return index.map(i => i[0].toString())
	} else if (type === 'hour') {
		return index.map(i => "'" + i[0].split(':')[0] + "'")
	} else {
		return index.map(i => "'" + i[0] + "'")
	}
}

function question (count, shape, names, type, indexType, slice, simple) {
	let text
	const { size: { row, col }, table } = generateTable(shape, names)
	const index = {
		row: generateIndex(indexType.row, row).map(r => [r, false]),
		col: generateIndex(indexType.col, col).map(c => [c, false])
	}
	const indexRow = printIndex(index.row, indexType.row)
	const indexCol = printIndex(index.col, indexType.col)
	if (type === 'index') {
		const r = random(0, row - 1)
		const c = random(0, col - 1)
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (i === r && j === c) { table[i][j].push(true) } else { table[i][j].push(false) }
			}
		}
		text = '第' + count + '題：' + 'df.loc[' + indexRow[r] + ', ' + indexCol[c] + ']'
		index.row[r][1] = true
		index.col[c][1] = true
	} else if (type === 'same') {
		const r = random(0, row - 1)
		const c = random(0, col - 1)
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (i === r || j === c) { table[i][j].push(true) } else { table[i][j].push(false) }
			}
		}
		text = '第' + count + '題：' + 'df.loc[' + indexRow[r] + ', ' + indexCol[c] + '] 相同行列'
		index.row[r][1] = true
		index.col[c][1] = true
	} else if (type === 'location') {
		//
	} else if (type === 'condition') {
		//
	} else if (type === 'function') {
		//
	}
	return { text, size: { row, col }, index, table } // table: [[[id, name or text, ans]]]
}

function getAnswer (question) {
	const answer = {}
	question.table.forEach(row => row.forEach(e => (answer[e[0]] = e[2])))
	return answer
}

function questionData (question) {
	const headers = question.index.col.map((c, i) => ({ text: c[0], key: i }))
	const table = question.index.row.map((r, i) => (
		{ key: i, row: { text: r[0] }, items: question.table[i].map((c, j) => ({ key: j, text: c[1] })) }
	))
	return { text: question.text, data: { headers, table } }
}

function color (ans, right, isName = false) {
	if (ans && right) {
		return 'light-green'
	} else if (ans && !right) {
		return 'amber'
	} else if (!ans && !right && isName) { // not ans but ans
		return 'red'
	} else if (!ans && right && isName) {
		return 'grey'
	} else {
		return ''
	}
}

function answerData (question) {
	const headers = question.index.col.map((c, i) => ({ text: c[0], key: i, color: color(c[1], true) }))
	const table = question.index.row.map((r, i) => ({ key: i,
		row: { text: r[0], color: color(r[1], true) },
		items: question.table[i].map((c, j) => ({ key: j, text: c[1], color: color(c[2], true) }))
	}))
	return { text: question.text, data: { headers, table } }
}

function realData (question, rightAnswer, realAnswer, names) {
	const isRight = Object.keys(rightAnswer)
												.filter(id => (id in realAnswer) ? rightAnswer[id] === realAnswer[id] : true)
	const headers = question.index.col.map((c, i) => ({ text: c[0], key: i, color: color(c[1], true) }))
	const table = question.index.row.map((r, i) => ({ key: i,
		row: { text: r[0], color: color(r[1], true) },
		items: question.table[i].map((c, j) => ({
			key: j,
			text: c[1],
			color: color(c[2], isRight.includes(c[0]), Object.keys(names).includes(c[0]))
		}))
	}))
	return { text: question.text, data: { headers, table } }
}

module.exports = { question, getAnswer, questionData, answerData, realData }
