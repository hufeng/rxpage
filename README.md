# rxpage
a simple wrapper for wxapp page (support mixins, lifecycle method merge)

## demo

```js
//btn/index.js
const Btn = {
  data: {
    btnText: 'Touch me'
  },

  onBtnClick() {},

  onLoad() {
    console.log('btn onLoad')
  },

  onUnload() {
    console.log('btn onUnload')
  }
},

//loading-more/index.js
const LoadingMore = {
  data: {
    isLoading: true
  },

  onLoad() {
    console.log('loading more onload');
  }

  onLoadingEnd() {
    this.setData({
      isLoading: false
    })
  }
}
```

```js

import RxPage from 'rxpage';

RxPage({
  data: {
    id: 1,
    motto: 'hello world'
  },
  mixins: [
    Btn,
    LoadingMore
  ],
  onLoad(opts) {
    console.log('I am Loading');
  },
  onUnload() {
    console.log('I am Unload');
  }
})

// RxPage return => 

Page({
  data: {
    id: 1,
    motto: 'hello world',
    isLoading: true,
    btnText: 'Touch me'
  },
  
  onBtnClick() {},

  onLoadingEnd() {
    this.setData({
      isLoading: false
    })
  },

  onLoad(opts) {
    [
      onLoad(opts) {
        console.log('I am Loading');
      },
      onLoad() {
        console.log('btn onLoad')
      },
      onLoad() {
       console.log('loading more onload');
      }
    ].reverse().forEach(method => method(opts))
  },
  
  onUnload() {
    [
      onUnload() {
       console.log('I am Unload');
      },
      onUnload() {
        console.log('btn onUnload')
      }
    ].forEach(method => method())
  }
})

```