# rxstore
a simple reactive predict state container for wxapp [针对微信小程序的一个简单的状态管理容器]


TOOD: 实现 getObjectPath

## demo

```js

import {QL, RxStore} from 'rxstore';

const helloQL = QL('helloQL', [
  'mott',
  state => state.mott + '!'
])

class MyStore extends RxStore {
  /**
   * 默认的容器初始状态
   */
  defaultState() {
    return {
      motto: 'hello world',
      userInfo: {
        name: 'Amy'
      }
    }
  }

  ql() {
    return [
      helloQL
    ]
  }
}

const myStore = new MyStore();

Page({
  data: myStore.getState(),

  onLoad() {
    myStore.withContext(this);
  }

  onMottoTouch() {
    myStore.setState({
      motto: 'hello wxapp world'
    })
  }
})

```