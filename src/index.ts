declare function Page(opts: Object);

export interface Page {
  data: Object;
}

export interface IProps {
  data?: Object;
  mixins?: Array<Page>;
  [name: string]: any;
}

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
export class PageParser {
  //转换page的属性对象
  private page: Object;
  //生命周期方法的栈
  private lifecycleMethodStack: {
    [name: string]: Array<Function>;
  };

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

  private parseProps(props: IProps) {
    //拆分data，mixins和其他的属性
    let { data = {}, mixins = [], ...other } = props;

    //对其他的属性分离生命周期方法
    this.parseLifeCycleMethod(other);

    //先merge mixins, 因为data优先级最高，data可以覆盖mixins的值
    mixins.forEach(mixin => this.parseMixin(mixin));

    //data
    this.page['data'] = {
      ...this.page['data'],
      ...data
    };
  }

  private parseMixin(props: IProps) {
    const { data = {}, mixins = [], ...other } = props;

    //merge data
    this.page['data'] = {
      ...this.page['data'],
      ...data
    };

    this.parseLifeCycleMethod(other);

    //如果存在mixin, 递归mixin
    if (mixins.length > 0) {
      mixins.forEach((page: IProps) => this.parseMixin(page));
    }
  }

  /**
   * 分离生命周期方法和普通的方法
   * 生命周期方法，合并处理
   * @param obj 
   */
  private parseLifeCycleMethod(obj: Object) {
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

    this.page = {
      ...this.page,
      ...others
    };
  }

  private mixinLifeCycle() {
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

export default function RxPage(opts) {
  Page(new PageParser(opts));
}
