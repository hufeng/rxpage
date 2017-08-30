import { QL } from '../src/ql';

type BasicState = {
  hello: string;
};

test('query-lang baisc test', () => {
  const helloQL = QL('helloQL', [
    //deps
    'hello',
    //transform
    (state: BasicState) => state.hello
  ]);

  expect(helloQL.name).toEqual('helloQL');
  expect(helloQL.deps).toEqual(['hello']);
  expect(typeof helloQL.lang).toEqual('function');
});
