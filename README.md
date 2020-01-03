# matrix

網站 (Website)： https://matrix.tew.tw

> Matrix game

## Build Setup

``` bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:49813
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


Using packages
---
koa-router koa-websocket random-words

Notice
---
Add a file plugin/config.js
```
export default { websocketType: 'wss' }

```