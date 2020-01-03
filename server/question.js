const consola = require('consola')
const randomWords = require('random-words')
const { random, normal, randomDate, shuffle, nickname, baseConverter } = require('./util')

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

function generateIndex (type, num) {
	let index = []
	if (type === 'contiInt') {
		const base = random(0, 10000)
		for (let i = 0; i < num; i++) { index.push(base + i) }
	} else if (type === 'randInt') {
		let high = 0
		while (high < num) { high = random(0, 10000) }
		for (let n = 0; n < num; n++) {
			let i = random(0, high)
			while (index.includes(i)) { i = random(0, high) }
			index.push(i)
		}
	} else if (type === 'contiChar') {
		const base = random(0, 1000)
		for (let i = 0; i < num; i++) { index.push(charIndex(base + i)) }
	} else if (type === 'randChar') {
		let high = 0
		while (high < num) { high = random(0, 1000) }
		for (let n = 0; n < num; n++) {
			let i = random(0, high)
			while (index.includes(i)) { i = random(0, high) }
			index.push(charIndex(i))
		}
	} else if (type === 'name') {
		index = randomWords(num)
	} else if (type === 'day') {
		const datetime = randomDate()
		for (let i = 0; i < num; i++) {
			datetime.setDate(datetime.getDate() + 1)
			index.push(datetime.toISOString().split('T')[0])
		}
	} else if (type === 'hour') {
		const datetime = randomDate()
		datetime.setMinutes(0)
		datetime.setSeconds(0)
		for (let i = 0; i < num; i++) {
			datetime.setHours(datetime.getHours() + 1)
			index.push(datetime.toISOString().split('.')[0].split('T').join(' '))
		}
	}
	return index.map(r => [r, false])
}

/**
 * Generate index name for rows and columns.
 * @param {'contiInt'|'randInt'|'contiChar'|'randChar'|'name'|'day'|'hour'} type type of index.
 */
function generateIndices (type, num, same) {
	let rowIsLess = false
	let row = num.row
	let col = num.col
	let typeRow = type.row
	let typeCol = type.col
	if (row < col) {
		rowIsLess = true
		row = num.col
		col = num.row
		typeRow = type.col
		typeCol = type.row
	}

	const rows = generateIndex(typeRow, row)
	let cols
	if (same) {
		if (typeRow === 'randInt' || typeRow === 'randChar' || typeRow === 'name') {
			cols = shuffle(JSON.parse(JSON.stringify(rows.slice(0, col))))
		} else {
			cols = JSON.parse(JSON.stringify(rows.slice(0, col)))
		}
	} else {
		cols = generateIndex(typeCol, col)
	}

	if (rowIsLess) { return { rows: cols, cols: rows } } else { return { rows, cols } }
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

function question (count, shape, names, type, indexType, same, slice, simple) {
	let text
	const { size: { row, col }, table } = generateTable(shape, names)
	const index = generateIndices(indexType, { row, col }, same)
	const indexRow = printIndex(index.rows, indexType.row)
	const indexCol = printIndex(index.cols, indexType.col)
	if (type === 'index') {
		const r = random(0, row - 1)
		const c = random(0, col - 1)
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (i === r && j === c) { table[i][j].push(true) } else { table[i][j].push(false) }
			}
		}
		text = '' + count + '. 所在位置： df.loc[' + indexRow[r] + ', ' + indexCol[c] + ']'
		index.rows[r][1] = true
		index.cols[c][1] = true
	} else if (type === 'same') {
		const r = random(0, row - 1)
		const c = random(0, col - 1)
		for (let i = 0; i < row; i++) {
			for (let j = 0; j < col; j++) {
				if (i === r || j === c) { table[i][j].push(true) } else { table[i][j].push(false) }
			}
		}
		text = '' + count + '. 相同行列： df.loc[' + indexRow[r] + ', ' + indexCol[c] + ']'
		index.rows[r][1] = true
		index.cols[c][1] = true
	} else if (type === 'location') {
		const normalRandom = function (N) {
			let n = 0
			while (n < 1 || n > N) {
				n = Math.floor(normal(N / 2, N))
			}
			return n
		}

		const arrayText = function (N, index, P = 1) { // P is the probability of array form
			const n = (P === -1) ? 1 : normalRandom(N)
			const as = []
			while (as.length < n) {
				const a = random(0, N - 1)
				if (!as.includes(a)) { as.push(a) }
			}
			let text = ''
			if (n === 1) {
				const p = Math.random()
				if (p > P) { text += index[as[0]] }
			}
			if (text === '') { text += '[' + as.map(a => index[a]).join(', ') + ']' }
			return { as, text }
		}

		const sliceText = function (N, index) {
			const p = Math.random()
			let l = random(0, N - 1)
			let h = random(l, N - 1)
			text = ''
			if (p > 0.5) { // low bound
				text += index[l]
			} else { // no low bound
				l = 0
			}
			text += ':'
			const q = Math.random()
			if (q > 0.5) { // high bound
				text += index[h]
			} else { // no high bound
				h = N - 1
			}
			const as = []
			for (let i = l; i <= h; i++) { as.push(i) }
			return { as, text }
		}

		const selection = (axis, P) => {
			const { as, text: aText } = arrayText((axis === 0) ? row : col, (axis === 0) ? indexRow : indexCol, P)
			text = '' + count + '. 選取範圍： df[' + aText + ']'
			for (let i = 0; i < row; i++) {
				for (let j = 0; j < col; j++) {
					const ax = (axis === 0) ? i : j
					if (as.includes(ax)) { table[i][j].push(true) } else { table[i][j].push(false) }
				}
			}
			as.forEach((a) => {
				if (axis === 0) { index.rows[a][1] = true } else { index.cols[a][1] = true }
			})
		}

		// ----------------------------------------------------------------

		if (slice && simple) { // simple mode can't use label slice
			const p = Math.random()
			if (p < 0.5) { // row
				selection(0, -1)
			} else { // col
				selection(1, -1)
			}
		} else if (!slice && simple) { // simple mode with array
			const p = Math.random()
			if (p < 0.5) { // row
				selection(0, 1)
			} else { // col
				selection(1, 1)
			}
		} else if (!slice && !simple) { // .loc with array or not
			const { as: rs, text: rText } = arrayText(row, indexRow, 0.1)
			const { as: cs, text: cText } = arrayText(col, indexCol, 0.1)
			text = '' + count + '. 選取範圍： df.loc[' + rText + ', ' + cText + ']'
			for (let i = 0; i < row; i++) {
				for (let j = 0; j < col; j++) {
					if (rs.includes(i) && cs.includes(j)) { table[i][j].push(true) } else { table[i][j].push(false) }
				}
			}
			cs.forEach((c) => {
				index.cols[c][1] = true
			})
			rs.forEach((r) => {
				index.rows[r][1] = true
			})
		} else if (slice && !simple) { // loc with :
			const p = Math.random()
			if (p < 0.4) { // both sides
				const { as: rs, text: rText } = sliceText(row, indexRow)
				const { as: cs, text: cText } = sliceText(col, indexCol)
				text = '' + count + '. 選取範圍： df.loc[' + rText + ', ' + cText + ']'
				for (let i = 0; i < row; i++) {
					for (let j = 0; j < col; j++) {
						if (rs.includes(i) && cs.includes(j)) { table[i][j].push(true) } else { table[i][j].push(false) }
					}
				}
				cs.forEach((c) => {
					index.cols[c][1] = true
				})
				rs.forEach((r) => {
					index.rows[r][1] = true
				})
			} else if (p < 0.7) { // row side
				const { as: rs, text: rText } = sliceText(row, indexRow)
				const { as: cs, text: cText } = arrayText(col, indexCol, 0.1)
				text = '' + count + '. 選取範圍： df.loc[' + rText + ', ' + cText + ']'
				for (let i = 0; i < row; i++) {
					for (let j = 0; j < col; j++) {
						if (rs.includes(i) && cs.includes(j)) { table[i][j].push(true) } else { table[i][j].push(false) }
					}
				}
				cs.forEach((c) => {
					index.cols[c][1] = true
				})
				rs.forEach((r) => {
					index.rows[r][1] = true
				})
			} else { // column side
				const { as: rs, text: rText } = arrayText(row, indexRow, 0.1)
				const { as: cs, text: cText } = sliceText(col, indexCol)
				text = '' + count + '. 選取範圍： df.loc[' + rText + ', ' + cText + ']'
				for (let i = 0; i < row; i++) {
					for (let j = 0; j < col; j++) {
						if (rs.includes(i) && cs.includes(j)) { table[i][j].push(true) } else { table[i][j].push(false) }
					}
				}
				cs.forEach((c) => {
					index.cols[c][1] = true
				})
				rs.forEach((r) => {
					index.rows[r][1] = true
				})
			}
		}
	}
	return { text, size: { row, col }, index, table } // table: [[[id, name or text, ans]]]
}

function getAnswer (question) {
	const answer = {}
	question.table.forEach(row => row.forEach(e => (answer[e[0]] = e[2])))
	return answer
}

function questionData (question) {
	const headers = question.index.cols.map((c, i) => ({ text: c[0], key: i }))
	const table = question.index.rows.map((r, i) => (
		{ key: i, row: { text: r[0] }, items: question.table[i].map((c, j) => ({ key: j, text: c[1] })) }
	))
	return { text: question.text, data: { headers, table } }
}

function color (ans, right, isName = false) {
	if (ans && right === 2) {
		return 'light-blue'
	} else if (!ans && right === 2) {
		return 'purple lighten-3'
	} else if (ans && right) {
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
	const headers = question.index.cols.map((c, i) => ({ text: c[0], key: i, color: color(c[1], true) }))
	const table = question.index.rows.map((r, i) => ({ key: i,
		row: { text: r[0], color: color(r[1], true) },
		items: question.table[i].map((c, j) => ({ key: j, text: c[1], color: color(c[2], true) }))
	}))
	return { text: question.text, data: { headers, table } }
}

function realData (question, rightAnswer, realAnswer, names) {
	const isRight = {}
	Object.keys(rightAnswer)
				.forEach((id) => {
					if (id in names) {
						if (realAnswer[id] === undefined) { // 沒作答
							isRight[id] = 2
						} else if (rightAnswer[id] === realAnswer[id]) { // 真人答對
							isRight[id] = 1
						} else { // 真人答錯
							isRight[id] = 0
						}
					} else { isRight[id] = true } // 假人一定答對
				})
	const headers = question.index.cols.map((c, i) => ({ text: c[0], key: i, color: color(c[1], true) }))
	const table = question.index.rows.map((r, i) => ({ key: i,
		row: { text: r[0], color: color(r[1], true) },
		items: question.table[i].map((c, j) => ({
			key: j,
			text: c[1],
			color: color(c[2], isRight[c[0]], Object.keys(names).includes(c[0]))
		}))
	}))
	return { text: question.text, data: { headers, table } }
}

module.exports = { question, getAnswer, questionData, answerData, realData }
