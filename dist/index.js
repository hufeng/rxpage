'use strict';
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
  };
Object.defineProperty(exports, '__esModule', { value: true });
//小程序page生命周期方法
const lifecycleMethodName = [
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onPageScroll'
];
/**
 * RxPage
 * 1. combine datasource
 * 2. combine component
 * 3. auto merge lifecycle method
 */
class PageParser {
  constructor(props) {
    this.lifecycleMethodStack = {
      onLoad: [],
      onReady: [],
      onShow: [],
      onHide: [],
      onUnload: [],
      onPullDownRefresh: [],
      onReachBottom: [],
      onShareAppMessage: [],
      onPageScroll: []
    };
    this.page = {
      data: {}
    };
    this.parseProps(props);
  }
  parseProps(props) {
    //拆分data，mixins和其他的属性
    let { data = {}, mixins = [] } = props,
      other = __rest(props, ['data', 'mixins']);
    //对其他的属性分离生命周期方法
    this.parseLifeCycleMethod(other);
    //先merge mixins, 因为data优先级最高，data可以覆盖mixins的值
    mixins.forEach(mixin => this.parseMixin(mixin));
    //data
    this.page['data'] = Object.assign({}, this.page['data'], data);
  }
  parseMixin(props) {
    const { data = {}, mixins = [] } = props,
      other = __rest(props, ['data', 'mixins']);
    //merge data
    this.page['data'] = Object.assign({}, this.page['data'], data);
    this.parseLifeCycleMethod(other);
    //如果存在mixin, 递归mixin
    if (mixins.length > 0) {
      mixins.forEach(page => this.parseMixin(page));
    }
  }
  /**
     * 分离生命周期方法和普通的方法
     * 生命周期方法，合并处理
     * @param obj
     */
  parseLifeCycleMethod(obj) {
    if (!obj) {
      return;
    }
    const others = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const isLifeCycleMethod = lifecycleMethodName.indexOf(key) != -1;
      if (isLifeCycleMethod) {
        this.lifecycleMethodStack[key].push(value);
      } else {
        others[key] = value;
      }
    });
    this.page = Object.assign({}, this.page, others);
  }
  mixinLifeCycle() {
    const lifecycleMethodStack = this.lifecycleMethodStack;
    Object.keys(lifecycleMethodStack).forEach(name => {
      const stack = lifecycleMethodStack[name];
      if (stack.length > 0) {
        //如果是销毁方法，按栈的顺序
        //如果是普通的生命周期方法，按照栈的反序
        if (name === 'onUnload') {
          this.page['onUnload'] = function() {
            stack.forEach(method => method());
          };
        } else if (name === 'onLoad') {
          this.page['onLoad'] = function(opts) {
            stack.reverse().forEach(method => method(opts));
          };
        } else {
          this.page[name] = function() {
            stack.reverse().forEach(method => method());
          };
        }
      }
    });
  }
  getPage() {
    this.mixinLifeCycle();
    return this.page;
  }
}
exports.PageParser = PageParser;
function RxPage(opts) {
  Page(new PageParser(opts));
}
exports.default = RxPage;
