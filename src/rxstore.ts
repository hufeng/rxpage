import { QueryLang } from './ql';

export default class RxStore<T extends Object = {}> {
  //当前的rxstore的状态
  private _state: T;
  //小程序page的上下文
  private _ctx: { setData: (data: Object) => void };
  //当前是不是已经执行异步
  private _pending: boolean;
  //队列存取当前多次setState的参数
  private _queue: Array<Object>;
  //记录QL的依赖关系
  private _qlDeps: { [name: string]: Array<string> };
  //记录ql的名字和ql的映射关系
  private _qlMapper: { [name: string]: QueryLang };

  constructor() {
    this._state = this.defaultState() as T;
    this._pending = false;
    this._queue = [];
    this._qlDeps = {};
    this._qlMapper = {};
    this.executeQL();
  }

  /**
   * 初始化状态
   * 子类应该override该方法
   */
  defaultState(): T {
    return {} as T;
  }

  /**
   * 绑定所有的ql
   * 子类如果有ql应该override此方法
   */
  ql() {
    return [];
  }

  /**
   * 绑定小程序的page上下文 目的去获取setData方法
   * 在setState之前一定要绑定
   * @param ctx 
   */
  withContext(ctx) {
    this._ctx = ctx;
  }

  /**
   * 改变状态
   * @param obj 
   */
  setState(obj: Object = {}) {
    if (!this._ctx) {
      throw new Error(
        'Please call withContext bind wxapp page context before setState'
      );
    }
    //merge state
    this._state = { ...this._state as Object, ...obj } as T;
    //计算object的可以会不会对于ql造成数据过期的影响，如果影响就需要
    //重新计算ql的值
    const updateKeyPaths = Object.keys(obj);
    this.updateQL(updateKeyPaths);

    //合并
    this.batchUpdateData(obj);

    return this._state;
  }

  /**
   * 获取当前的状态
   */
  getState() {
    return this._state;
  }

  /**
   * 计算QL
   * @param ql 
   */
  bigQuery(ql: QueryLang) {
    if (!(ql instanceof QueryLang)) {
      throw new Error('bigQuery: ql is not QueryLang');
    }
    return ql.lang(this._state);
  }

  /**
   * 执行ql
   */
  executeQL() {
    this.ql().forEach((ql: QueryLang) => {
      //记录依赖关系
      this._qlDeps[ql.name] = ql.deps;
      //收集
      this._qlMapper[ql.name] = ql;
      //计算ql的初始值放入state
      this._state[ql.name] = this.bigQuery(ql);
    });
  }

  /**
   * 根据更新的路径，动态计算对QL的影响
   * @param updateKeyPath 
   */
  private updateQL(updateKeyPath: Array<string>) {
    for (var qlName in this._qlDeps) {
      //获取依赖
      const deps = this._qlDeps[qlName];
      //如果影响到直接更新
      if (this.isEffect(updateKeyPath, deps)) {
        this._state[qlName] = this.bigQuery(this._qlMapper[qlName]);
      }
    }
  }

  /**
   * 计算更新的keypath对于deps有没有影响
   * @param updateKeyPath 
   * @param deps 
   */
  private isEffect(updateKeyPath: Array<string>, deps: Array<string>) {
    const uLen = updateKeyPath.length;
    const dLen = deps.length;

    for (let i = 0; i < uLen; i++) {
      for (let j = 0; j < dLen; j++) {
        const u = updateKeyPath[i];
        const d = deps[j];

        //是不是单路径 如 motto, user之类
        //如果两个都是单路径，直接判断是不是相等
        if (!/\./.test(u) && !/\./.test(d)) {
          if (u == d) {
            return true;
          }
          continue;
        }

        //子路径 user.nickname
        if (u.indexOf(d) != -1 || d.indexOf(u) != -1) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 合并多次的setState的调用，然后一次性setData
   * @param obj 
   */
  private batchUpdateData(obj: Object) {
    this._queue.push(obj);

    if (!this._pending) {
      const defer = this.defer();
      defer(() => {
        //merge 所有的参数
        const merge = this._queue.reduce((pre, cur) => {
          pre = { ...pre, ...cur };
          return pre;
        }, {});

        this._ctx.setData(merge);

        this._queue = [];
        this._pending = false;
      });
    }

    this._pending = true;
  }

  /**
   * 创建一个异步对象
   */
  private defer() {
    const resolved = typeof Promise != 'undefined' && Promise.resolve();
    return resolved ? f => resolved.then(f) : setTimeout;
  }
}
