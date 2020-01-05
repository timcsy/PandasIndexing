/* eslint-disable require-await */
const Router = require('koa-router')
const consola = require('consola')
const Room = require('./room')
const router = new Router()

const rooms = {}
let roomCount = 0

router.all('/', async (ctx) => {
	// `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
	// the websocket is added to the context on `ctx.websocket`.
	let room = ctx.cookies.get('room')
	if (!room) {
		room = (++roomCount).toString()
	}
	if (room in rooms) {
		rooms[room].add(ctx)
	} else {
		rooms[room] = new Room(room)
		rooms[room].add(ctx)
	}
})

module.exports = router
