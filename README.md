# gibon [![NPM version](https://img.shields.io/npm/v/gibon.svg?style=flat)](https://www.npmjs.com/package/gibon) [![NPM monthly downloads](https://img.shields.io/npm/dm/gibon.svg?style=flat)](https://npmjs.org/package/gibon) [![npm total downloads][downloads-img]][downloads-url]

> Modern & functional UI router in ~600 bytes, built on HTML5 History API

[![code climate][codeclimate-img]][codeclimate-url]
[![standard code style][standard-img]][standard-url]
[![linux build status][travis-img]][travis-url]
[![windows build status][appveyor-img]][appveyor-url]
[![coverage status][coveralls-img]][coveralls-url]
[![dependency status][david-img]][david-url]

You might also be interested in [always-done](https://github.com/hybridables/always-done#readme).

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  * [router = gibon(routes)](#router--gibonroutes)
  * [router.start()](#routerstart)
  * [el = router.render(view[, state])](#el--routerrenderview-state)
- [Related](#related)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install
Install with [npm](https://www.npmjs.com/)

```
$ npm install gibon --save
```

or install using [yarn](https://yarnpkg.com)

```
$ yarn add gibon
```

Both [UMD](https://github.com/umdjs/umd) and [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) builds are also available on [unpkg](https://unpkg.com) CDN

```html
<script src="https://unpkg.com/gibon/dist/gibon.umd.js"></script>
<!-- or -->
<script src="https://unpkg.com/gibon/dist/gibon.iife.js"></script>
```

## Usage
> For more use-cases see the [tests](test.js)

```js
const router = gibon({
  '/': (ctx) => console.log('home'),
  '/about': (ctx) => console.log('about'),
  '/users/:user': (ctx, params) => console.log('user:', params.user),
  '/users/:user/edit': (ctx, params) => {
    console.log('edit user:', params.user)
  },
  '/groups/:group/users/:user': (ctx, params) => {
    console.log('user:', params.user, 'group:', params.group)
  }
})

router.start()
```

## API

### router = gibon(routes)

#### routes

Object with key/value pairs, where key is the **route** and **value** should be a function that has `(ctx, params)` signature.

- `route` - path like `/users/:user`
- `value` - function that has `(ctx, params)` signature

The route path syntax is based on the same syntax found in Express.

**Example**

```js
const userView = (ctx, params) => {
  console.log('user:', params.user)
}

const router = gibon({
  '/users/:user': userView
})

router.start()
```

### router.start()

Starts the router. Function that starts the router to listen on routes. If you not call it, it won't attach any listeners, so it won't work.

### el = router.render(view[, state])

_We can use `.render()` without `.start()`ing the router._

You can use that to manually render `view` with optional `state`. It returns what the view returns, so if
the view returns a DOM element, then `el` will be that element.

- `view` - string path to route, or function like `userView`
- `state` - optional, it will be the `ctx` argument

**Example**

```js
const router = gibon()

const userView = (ctx, params) => {
  console.log('title is', ctx.title)
}

router.render(userView, { title: 'hello world' })
```

The cool thing comes when you use some Virtual or Real DOM builder, such as [bel][] or [hyperx].

In the next example we are using `bel` to define some HTML without breaking the JavaScript and we "render" some specific route with some context/state, and finally we append it ot the page body.

**Example 2**

```js
const html = require('bel')
const router = gibon({
  '/users/:user': (ctx, params) => html`<div>
    <h1>${ctx.title}</h1>
    <h2>user is ${params.user}</h2>
  </div>`
})

const el = router.render('/users/tunnckoCore', { title: 'hello world' })
document.body.appendChild(el)
```

So we'll get such that div in the document body

```html
<div>
  <h1>hello world</h1>
  <h2>user is tunnckoCore</h2>
</div>
```

## Related
- [always-done](https://www.npmjs.com/package/always-done): Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement… [more](https://github.com/hybridables/always-done#readme) | [homepage](https://github.com/hybridables/always-done#readme "Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement for [async-done][] - pass 100% of its tests plus more")
- [minibase](https://www.npmjs.com/package/minibase): Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing… [more](https://github.com/node-minibase/minibase#readme) | [homepage](https://github.com/node-minibase/minibase#readme "Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing [base][] plugins.")
- [try-catch-core](https://www.npmjs.com/package/try-catch-core): Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and… [more](https://github.com/hybridables/try-catch-core#readme) | [homepage](https://github.com/hybridables/try-catch-core#readme "Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and used in higher-level libs such as [always-done][] to handle completion of anything.")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/gibon/issues/new).  
Please read the [contributing guidelines](CONTRIBUTING.md) for advice on opening issues, pull requests, and coding standards.  
If you need some help and can spent some cash, feel free to [contact me at CodeMentor.io](https://www.codementor.io/tunnckocore?utm_source=github&utm_medium=button&utm_term=tunnckocore&utm_campaign=github) too.

**In short:** If you want to contribute to that project, please follow these things

1. Please DO NOT edit [README.md](README.md), [CHANGELOG.md](CHANGELOG.md) and [.verb.md](.verb.md) files. See ["Building docs"](#building-docs) section.
2. Ensure anything is okey by installing the dependencies and run the tests. See ["Running tests"](#running-tests) section.
3. Always use `npm run commit` to commit changes instead of `git commit`, because it is interactive and user-friendly. It uses [commitizen][] behind the scenes, which follows Conventional Changelog idealogy.
4. Do NOT bump the version in package.json. For that we use `npm run release`, which is [standard-version][] and follows Conventional Changelog idealogy.

Thanks a lot! :)

## Building docs
Documentation and that readme is generated using [verb-generate-readme][], which is a [verb][] generator, so you need to install both of them and then run `verb` command like that

```
$ npm install verbose/verb#dev verb-generate-readme --global && verb
```

_Please don't edit the README directly. Any changes to the readme must be made in [.verb.md](.verb.md)._

## Running tests
Clone repository and run the following in that cloned directory

```
$ npm install && npm test
```

## Author
**Charlike Mike Reagent**

+ [github/tunnckoCore](https://github.com/tunnckoCore)
+ [twitter/tunnckoCore](https://twitter.com/tunnckoCore)
+ [codementor/tunnckoCore](https://codementor.io/tunnckoCore)

## License
Copyright © 2016-2017, [Charlike Mike Reagent](http://i.am.charlike.online). Released under the [MIT license](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.1, on February 06, 2017._  
_Project scaffolded using [charlike][] cli._

[always-done]: https://github.com/hybridables/always-done
[async-done]: https://github.com/gulpjs/async-done
[base]: https://github.com/node-base/base
[bel]: https://github.com/shama/bel
[charlike]: https://github.com/tunnckocore/charlike
[commitizen]: https://github.com/commitizen/cz-cli
[dezalgo]: https://github.com/npm/dezalgo
[hyperx]: https://github.com/substack/hyperx
[once]: https://github.com/isaacs/once
[standard-version]: https://github.com/conventional-changelog/standard-version
[verb-generate-readme]: https://github.com/verbose/verb-generate-readme
[verb]: https://github.com/verbose/verb

[downloads-url]: https://www.npmjs.com/package/gibon
[downloads-img]: https://img.shields.io/npm/dt/gibon.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/gibon
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/gibon.svg

[travis-url]: https://travis-ci.org/tunnckoCore/gibon
[travis-img]: https://img.shields.io/travis/tunnckoCore/gibon/master.svg?label=linux

[appveyor-url]: https://ci.appveyor.com/project/tunnckoCore/gibon
[appveyor-img]: https://img.shields.io/appveyor/ci/tunnckoCore/gibon/master.svg?label=windows

[coveralls-url]: https://coveralls.io/r/tunnckoCore/gibon
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/gibon.svg

[david-url]: https://david-dm.org/tunnckoCore/gibon
[david-img]: https://img.shields.io/david/tunnckoCore/gibon.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

