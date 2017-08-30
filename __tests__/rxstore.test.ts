import RxStore from '../src/rxstore';
import { QL } from '../src/ql';

interface IState {
  motto: string;
  userInfo: {
    id: number;
    name: string;
  };
  helloQL?: string;
}

test('init state', () => {
  class MyStore extends RxStore<IState> {
    defaultState() {
      return {
        motto: 'hello world',
        userInfo: {
          id: 1,
          name: 'hufeng'
        }
      };
    }
  }

  const myStore = new MyStore();

  expect(myStore.getState()).toEqual({
    motto: 'hello world',
    userInfo: {
      id: 1,
      name: 'hufeng'
    }
  });

  //mock
  const page = {
    setData(obj: Object) {
      expect(obj).toEqual({
        motto: 'hello world#2'
      });
    }
  };

  myStore.withContext(page);

  const state1 = myStore.setState({
    motto: 'hello world#1'
  });

  expect(state1.motto).toEqual('hello world#1');

  const state2 = myStore.setState({
    motto: 'hello world#2'
  });
  expect(state2.motto).toEqual('hello world#2');
});

it('test ql', () => {
  const helloQL = QL('helloQL', [
    //deps
    'motto',
    //transform
    (store: IState) => store.motto + '!'
  ]);

  class QLStore extends RxStore<IState> {
    defaultState() {
      return {
        motto: 'hello world',
        userInfo: {
          id: 1,
          name: 'hufeng'
        }
      };
    }

    ql() {
      return [helloQL];
    }
  }

  const myStore = new QLStore();

  expect(myStore.getState()).toEqual({
    motto: 'hello world',
    helloQL: 'hello world!',
    userInfo: {
      id: 1,
      name: 'hufeng'
    }
  });

  const val = myStore.bigQuery(helloQL);
  expect(val).toEqual('hello world!');

  //分析依赖关系 - private
  expect((myStore as any)._qlDeps).toEqual({
    helloQL: ['motto']
  });

  //private
  expect((myStore as any)._qlMapper).toEqual({
    helloQL
  });

  const isPathOutdata = (myStore as any).isEffect;
  expect(isPathOutdata(['motto'], ['motto'])).toEqual(true);
  expect(isPathOutdata(['mott'], ['motto'])).toEqual(false);
  expect(isPathOutdata(['user.name'], ['user'])).toEqual(true);
  expect(isPathOutdata(['user'], ['user.name'])).toEqual(true);

  const page = {
    setData(data: object) {}
  };

  myStore.withContext(page);

  myStore.setState({
    motto: 'hello world#1'
  });

  expect(myStore.getState().helloQL).toEqual('hello world#1!');
});

test('without ctx', () => {
  class MyStore extends RxStore<IState> {
    defaultState() {
      return {
        motto: 'hello world',
        userInfo: {
          id: 1,
          name: 'hufeng'
        }
      };
    }
  }

  const myStore = new MyStore();

  try {
    myStore.setState({});
  } catch (err) {
    expect(err.message).toEqual(
      'Please call withContext bind wxapp page context before setState'
    );
  }
});
