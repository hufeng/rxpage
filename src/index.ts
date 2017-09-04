declare function Page(opts: Object);

export interface Page {
  data: Object;
}

export interface IProps {
  data?: Object;
  mixins?: Array<Page>;
  [name: string]: any;
}

/**
 * RxPage
 * 1. combine datasource
 * 2. combine component
 */
export class PageFactory {
  private _page: Object;

  constructor(props) {
    this._page = {
      data: {}
    };
    this.parseProps(props);
  }

  private parseProps(props: IProps) {
    //先merge mixins, 因为data优先级最高，data可以覆盖mixins的值
    this.parseMixin(props);

    const { data = {}, mixins, ...other } = props;
    //data
    this._page['data'] = {
      ...this._page['data'],
      ...data
    };
    //others
    this._page = {
      ...this._page,
      ...other
    };
  }

  private parseMixin(props: IProps) {
    const { data = {}, mixins = [], ...other } = props;

    //merge data
    this._page['data'] = {
      ...this._page['data'],
      ...data
    };

    //如果存在mixin, 递归mixin
    if (mixins.length > 0) {
      mixins.forEach((page: IProps) => this.parseMixin(page));
    }

    //merge others
    this._page = { ...this._page, ...other };
  }

  getPage() {
    return this._page;
  }
}

export default function RxPage(opts) {
  const factory = new PageFactory(opts);
  return Page(factory.getPage());
}
