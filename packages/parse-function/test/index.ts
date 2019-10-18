/* eslint-disable unicorn/consistent-function-scoping, no-plusplus */

import { parse as espreeParse } from 'espree';
import { parse as babylonParse } from '@babel/parser';

import { parse as acornParse } from 'acorn';
import { parse as acornLooseParse } from 'acorn-loose';
import forIn from 'for-in';

import { parseFunction } from '../src';

const fixtures = {
  regulars: [
    'function (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
    'function (b, callback, ...restArgs) {callback(null, b + 3)}',
    'function (c) {return c * 3}',
    'function (...restArgs) {return 321}',
    'function () {}',
    'function (a = (true, false)) {}',
    'function (a = (true, null)) {}',
    'function (a = (true, "bar")) {}',
    'function (a, b = (i++, true)) {}',
    'function (a = 1) {}',
  ],
  named: [
    'function namedFn (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
    'function namedFn (b, callback, ...restArgs) {callback(null, b + 3)}',
    'function namedFn (c) {return c * 3}',
    'function namedFn (...restArgs) {return 321}',
    'function namedFn () {}',
    'function namedFn(a = (true, false)) {}',
    'function namedFn(a = (true, null)) {}',
    'function namedFn(a = (true, "bar")) {}',
    'function namedFn(a, b = (i++, true)) {}',
    'function namedFn(a = 1) {}',
  ],
  generators: [
    'function * namedFn (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
    'function * namedFn (b, callback, ...restArgs) {callback(null, b + 3)}',
    'function * namedFn (c) {return c * 3}',
    'function * namedFn (...restArgs) {return 321}',
    'function * namedFn () {}',
    'function * namedFn(a = (true, false)) {}',
    'function * namedFn(a = (true, null)) {}',
    'function * namedFn(a = (true, "bar")) {}',
    'function * namedFn(a, b = (i++, true)) {}',
    'function * namedFn(a = 1) {}',
  ],
  arrows: [
    '(a = {foo: "ba)r", baz: 123}, cb, ...restArgs) => {return a * 3}',
    '(b, callback, ...restArgs) => {callback(null, b + 3)}',
    '(c) => {return c * 3}',
    '(...restArgs) => {return 321}',
    '() => {}',
    '(a = (true, false)) => {}',
    '(a = (true, null)) => {}',
    '(a = (true, "bar")) => {}',
    '(a, b = (i++, true)) => {}',
    '(a = 1) => {}',
    '(a) => a * 3 * a',
    'd => d * 355 * d',
    'e => {return e + 5235 / e}',
    '(a, b) => a + 3 + b',
    '(x, y, ...restArgs) => console.log({ value: x * y })',
  ],
};

/**
 * Merge all into one
 * and prepend `async` keyword
 * before each function
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
fixtures.asyncs = fixtures.regulars
  .concat(fixtures.named)
  .concat(fixtures.arrows)
  .map((item) => `async ${item}`);

let testsCount = 1;

/**
 * Factory for DRY, we run all tests
 * over two available parsers - one
 * is the default `babylon`, second is
 * the `acorn.parse` method.
 */

function factory(parserName, parseFn) {
  forIn(fixtures, (values) => {
    values.forEach((code) => {
      const actual = parseFn(code);
      // const expected = expectedResults[key][i];
      const value = actual.value.replace(/^\(\{? ?/, '').replace(/\)$/, '');

      test(`#${testsCount++} - ${parserName} - ${value}`, () => {
        expect(actual).toMatchSnapshot();
      });
    });
  });

  test(`#${testsCount++} - ${parserName} - should return object with default values when invalid`, () => {
    const actual = parseFn(123456);

    expect(actual).toMatchSnapshot();
  });

  test(`#${testsCount++} - ${parserName} - should have '.isValid' and few '.is*'' hidden properties`, () => {
    const actual = parseFn([1, 2, 3]);

    expect(actual).toMatchSnapshot();
  });

  // bug in v4 and v5
  // https://github.com/tunnckoCore/parse-function/issues/3
  // test(`#${testsCount++} - ${parserName} - should not fails to get .body when something after close curly`,  () => {
  //   const actual = parseFn('function (a) {return a * 2}; var b = 1')
  //   expect(actual.body, 'return a * 2')
  //   done()
  // })

  test(`#${testsCount++} - ${parserName} - should work when comment in arguments (see #11)`, () => {
    const actual = parseFn('function (/* done */) { return 123 }');
    expect(actual.params).toStrictEqual('');
    expect(actual.body).toStrictEqual(' return 123 ');

    const res = parseFn('function (foo/* done */, bar) { return 123 }');
    expect(res.params).toStrictEqual('foo, bar');
    expect(res.body).toStrictEqual(' return 123 ');
  });

  test(`#${testsCount++} - ${parserName} - should support to parse generator functions`, () => {
    const actual = parseFn('function * named (abc) { return abc + 123 }');
    expect(actual.name).toStrictEqual('named');
    expect(actual.params).toStrictEqual('abc');
    expect(actual.body).toStrictEqual(' return abc + 123 ');
  });

  test(`#${testsCount++} - ${parserName} - should support to parse async functions (ES2016)`, () => {
    const actual = parseFn('async function foo (bar) { return bar }');
    expect(actual.name).toStrictEqual('foo');
    expect(actual.params).toStrictEqual('bar');
    expect(actual.body).toStrictEqual(' return bar ');
  });

  test(`#${testsCount++} - ${parserName} - should parse a real function which is passed`, () => {
    const actual = parseFn(function fooBar(a, bc) {
      return a + bc;
    });
    expect(actual.name).toStrictEqual('fooBar');
    expect(actual.params).toStrictEqual('a, bc');
    expect(actual.body).toStrictEqual('\n      return a + bc;\n    ');
  });

  test(`#${testsCount++} - ${parserName} - should work for object methods`, () => {
    const obj = {
      foo(__a, __b, __c) {
        return 123;
      },
      bar(__a) {
        return () => __a;
      },
      *gen(__a) {
        return yield __a * 321;
      },
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const foo = parseFn(obj.foo);
    expect(foo).toMatchSnapshot();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const bar = parseFn(obj.bar);
    expect(bar).toMatchSnapshot();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const gen = parseFn(obj.gen);
    expect(gen).toMatchSnapshot();

    const namedFn = `namedFn (a = {foo: 'ba)r', baz: 123}, cb, ...restArgs) { return a * 3 }`;
    const namedFnc = parseFn(namedFn);
    expect(namedFnc).toMatchSnapshot();
  });

  test(`#${testsCount++} - ${parserName} - plugins api`, () => {
    const fnStr = `() => 123 + a + 44`;
    const plugin = () => ({ called: 1 });
    // you may want to return the `result`,
    // but it is the same as not return it
    // return result
    const result = parseFn(fnStr, {}, plugin);

    expect(result.called).toStrictEqual(1);
  });

  test(`#${testsCount++} - ${parserName} - fn named "anonymous" has .name: 'anonymous'`, () => {
    const result = parseFn('function anonymous () {}');
    expect(result.name).toStrictEqual('anonymous');
    expect(result.isAnonymous).toStrictEqual(false);
  });

  test(`#${testsCount++} - ${parserName} - real anonymous fn has .name: null`, () => {
    const actual = parseFn('function () {}');
    expect(actual.name).toBeNull();
    expect(actual.isAnonymous).toStrictEqual(true);
  });
}

/**
 * Actually run all the tests
 */

factory('babel (default)', (code, opts, plugins) =>
  parseFunction(code, { ...opts, plugins }),
);

factory('options.parse', (code, opts, plugins) =>
  parseFunction(code, { ...opts, parse: babylonParse, plugins }),
);

factory('acorn.parse', (code, opts, plugins) =>
  parseFunction(code, { ...opts, parse: acornParse, plugins }),
);

factory('acorn loose', (code, opts, plugins) =>
  parseFunction(code, {
    ...opts,
    parse: acornLooseParse,
    plugins,
  }),
);

factory('espree.parse', (code, opts, plugins) =>
  parseFunction(code, {
    ...opts,
    parse: espreeParse,
    plugins,
    parserOptions: {
      ecmaVersion: 8,
    },
  }),
);

// https://github.com/tunnckoCore/parse-function/issues/61
test('should work with an async arrow function with an `if` statement', () => {
  const parsed = parseFunction('async (v) => { if (v) {} }');
  expect(parsed).toMatchSnapshot();
});

test(`fn named "anonymous" has .name: 'anonymous'`, () => {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  const result = parseFunction(function anonymous() {});

  expect(result.name).toStrictEqual('anonymous');
  expect(result.isAnonymous).toStrictEqual(false);
});

// test(`real anonymous fn has .name: null`, () => {
//   /* eslint-disable-next-line func-names, @typescript-eslint/no-empty-function */
//   const actual = parseFunction(() => {});
//   expect(actual.name).toBeNull();
//   expect(actual.isAnonymous).toStrictEqual(true);
// });