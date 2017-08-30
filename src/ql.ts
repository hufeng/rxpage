export type Handler = (state: Object) => any;

export class QueryLang {
  name: string;
  deps: Array<string>;
  lang: Handler;

  constructor(name: string, lang: Array<string | Handler>) {
    this.name = name;
    this.parseLang(lang);
  }

  private parseLang(lang: Array<string | Function>) {
    this.lang = lang.pop() as Handler;

    //如果不是函数
    if (typeof this.lang !== 'function') {
      throw new Error(
        `QL:${this.name} syntax error. the last element is function`
      );
    }

    this.deps = lang as Array<string>;
  }
}

/**
 * Build a QueryLang
 * @param name 
 * @param lang 
 */
export function QL(name: string, lang: Array<string | Handler>) {
  return new QueryLang(name, lang);
}
