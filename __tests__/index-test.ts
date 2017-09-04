import { PageFactory } from '../src/index';

test('basic', () => {
  const hello = () => {};

  const page = new PageFactory({
    data: {
      id: 1
    },
    hello: hello
  });

  expect(page.getPage()).toEqual({
    data: {
      id: 1
    },
    hello
  });
});

test('mixins', () => {
  const HelloPage = {
    data: { hello: 'hello' },
    sayHello() {}
  };

  const WorldPage = {
    data: { world: 'world' },
    sayWorld() {}
  };

  const page = new PageFactory({
    data: { id: 1 },
    mixins: [HelloPage, WorldPage]
  });

  expect(page.getPage()).toMatchSnapshot();

  const Nest = {
    data: {
      test: true
    }
  };

  const NestPage = {
    data: {
      nested: true
    },
    mixins: [Nest]
  };

  const page1 = new PageFactory({
    data: {
      id: 2,
      name: 'rxpage'
    },
    mixins: [HelloPage, WorldPage, { data: { btn: true } }, NestPage]
  });

  expect(page1).toMatchSnapshot();
});
