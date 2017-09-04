# rxpage
a simple wrapper for wxapp page (support mixins, lifecycle method merge)

## demo

```js

import RxPage from 'rxpage';

const Btn = {
  data: {
    btnText: 'Touch me'
  },
  onBtnClick() {

  }
},

const LoadingMore = {
  data: {
    isLoading: true
  },

  onLoadingEnd() {
    this.setData({
      isLoading: false
    })
  }
}

RxPage({
  data: {
    id: 1,
    motto: 'hello world'
  },
  mixins: [
    Btn,
    LoadingMore
  ]
})

// RxPage return => 

Page({
  data: {
    id: 1,
    motto: 'hello world',
    isLoading: true,
    btnText: 'Touch me'
  },
  onBtnClick() {

  },
  onLoadingEnd() {
    this.setData({
      isLoading: false
    })
  }
})

```