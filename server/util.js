const consola = require('consola')

function random (low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function normal (mu, sigma, nsamples) {
	if (!nsamples) { nsamples = 6 }
	if (!sigma) { sigma = 1 }
	if (!mu) { mu = 0 }

	let runTotal = 0
	for (let i = 0; i < nsamples; i++) {
		runTotal += Math.random()
	}

	return sigma * (runTotal - nsamples / 2) / (nsamples / 2) + mu
}

function randomDate () {
	return new Date(+(new Date()) - Math.floor(Math.random() * 10000000000))
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle (a) {
	let j, x, i
	for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1))
			x = a[i]
			a[i] = a[j]
			a[j] = x
	}
	return a
}

function baseConverter (nbasefrom, basefrom, baseto, SYMBOLS) {
	SYMBOLS = SYMBOLS || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/'
	if (basefrom <= 0 || basefrom > SYMBOLS.length || baseto <= 0 || baseto > SYMBOLS.length) {
		consola.log('Base unallowed')
		return null
	}
	let i; let nbaseten = 0
	if (basefrom !== 10) {
		const sizenbasefrom = nbasefrom.length
		for (i = 0; i < sizenbasefrom; i++) {
			let mul
			let mulOk = -1
			for (mul = 0; mul < SYMBOLS.length; mul++) {
				if (nbasefrom[i] === SYMBOLS[mul]) {
					mulOk = 1
					break
				}
			}
			if (mul >= basefrom) {
				consola.log('Symbol unallowed in basefrom')
				return null
			}
			if (mulOk === -1) {
				consola.log('Symbol not found')
				return null
			}
			const exp = (sizenbasefrom - i - 1)
			if (exp === 0) { nbaseten += mul } else { nbaseten += mul * basefrom ** exp }
		}
	} else { nbaseten = parseInt(nbasefrom) }
	if (baseto !== 10) {
		const nbaseto = []
		while (nbaseten > 0) {
			const mod = nbaseten % baseto
			if (mod < 0 || mod >= SYMBOLS.length) {
				consola.log('Out of bounds error')
				return null
			}
			nbaseto.push(SYMBOLS[mod])
			nbaseten = parseInt(nbaseten / baseto)
		}
		return nbaseto.reverse().toString().replace(/,/g, '')
	} else {
		return nbaseten.toString()
	}
}

function nickname () {
	function random (a, l) {
			const x = []
			x.push(a[Math.ceil(Math.random() * a.length)])
			while (l > 1) {
					x.push(a[Math.ceil(Math.random() * a.length)])
					l--
			}
			return x.join('')
	}

	return random('李 王 張 劉 陳 楊 黃 趙 周 吳 徐 孫 朱 馬 胡 郭 林 何 高 梁 鄭 羅 宋 謝 唐 韓 曹 許 鄧 蕭 馮 曾 程 蔡 彭 潘 袁 於 董 餘 蘇 葉 呂 魏 蔣 田 杜 丁 沈 姜 範 江 傅 鐘 盧 汪 戴 崔 任 陸 廖 姚 方 金 邱 夏 譚 韋 賈 鄒 石 熊 孟 秦 閻 薛 侯 雷 白 龍 段 郝 孔 邵 史 毛 常 萬 顧 賴 武 康 賀 嚴 尹 錢 施 牛 洪 龔'.split(' ')) + random('世 中 仁 伶 佩 佳 俊 信 倫 偉 傑 儀 元 冠 凱 君 哲 嘉 國 士 如 娟 婷 子 孟 宇 安 宏 宗 宜 家 建 弘 強 彥 彬 德 心 志 忠 怡 惠 慧 慶 憲 成 政 敏 文 昌 明 智 曉 柏 榮 欣 正 民 永 淑 玉 玲 珊 珍 珮 琪 瑋 瑜 瑞 瑩 盈 真 祥 秀 秋 穎 立 維 美 翔 翰 聖 育 良 芬 芳 英 菁 華 萍 蓉 裕 豪 貞 賢 郁 鈴 銘 雅 雯 霖 青 靜 韻 鴻 麗 龍'.split(' '), Math.ceil(Math.random() * 2))
}

module.exports = { random, normal, randomDate, shuffle, nickname, baseConverter }
