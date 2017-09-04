import { PageParser } from '../src/index';

test('basic', () => {
  const hello = () => {};

  const page = new PageParser({
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

  const page = new PageParser({
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

  const page1 = new PageParser({
    data: {
      id: 2,
      name: 'rxpage'
    },
    mixins: [HelloPage, WorldPage, { data: { btn: true } }, NestPage]
  });

  expect(page1).toMatchSnapshot();
});

test('lifecycle method', () => {
  const Btn = {
    data: {
      btn: 'hello btn'
    },
    mixins: [
      {
        onLoad() {
          console.log('btn nested onload');
        },
        onUnload() {
          console.log('btn nested unload');
        }
      }
    ],

    onLoad() {
      console.log('btn onload');
    },
    onShow() {
      console.log('btn show');
    },
    onUnload() {
      console.log('btn unload');
    }
  };

  const LoadingMore = {
    data: {
      text: 'loading...'
    },
    onLoad() {
      console.log('loading more onload');
    },
    onShow() {
      console.log('loading more show');
    },
    onUnload() {
      console.log('loading more unload');
    }
  };

  const page = new PageParser({
    data: {
      hello: 'hello'
    },
    mixins: [Btn, LoadingMore],
    hello() {
      console.log('hello');
    },
    onLoad() {
      console.log('page parse onload');
    },
    onUnload() {
      console.log('page parse unload');
    },
    onShow() {
      console.log('page parse show');
    }
  });

  expect(page).toMatchSnapshot();
  expect(page.getPage()).toMatchSnapshot();

  const pageObj = page.getPage() as {
    hello: Function;
    onLoad: Function;
    onShow: Function;
    onUnload: Function;
  };

  pageObj.hello();
  pageObj.onLoad();
  pageObj.onUnload();
  pageObj.onShow();
});
