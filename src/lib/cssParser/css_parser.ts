import { assert } from "https://deno.land/std@0.150.0/testing/asserts.ts";
import {
  ClassSymbol,
  Color,
  Declaration,
  IdentifierSymbol,
  Length,
  Rule,
  Selector,
  SelectorType,
  Stylesheet,
  Unit,
} from "./type.ts";

// FIXME: improve handling eof
export const END_OF_FILE = "<END_OF_FILE/>" as const;
type EOF = typeof END_OF_FILE;

export class CssParser {
  private readonly input: string;
  private curPosition: number;
  private curChar: string;

  constructor(input: string) {
    this.input = input;
    this.curPosition = 0;
    this.curChar = this.input[this.curPosition];
  }

  /**
   * EOF を判定する関数
   * @returns {boolean} 現在 EOF に到達してるかどうかの真偽値
   */
  private isEOF(): boolean {
    return this.curPosition + 1 > this.input.length;
  }

  /**
   * 次の1文字を先読みして返す関数（position を進めることはしない）
   * @returns {string | EOF} 現状 parse 中の文字の次の1文字
   */
  private peekNextChar(): string {
    return this.isEOF()
      ? END_OF_FILE
      : this.input.substring(this.curPosition, this.curPosition + 1);
  }

  /**
   * parser の position を1文字進めて現在 parse 中の文字を返す関数
   * @returns {string | EOF} 現状 parse 中の文字列
   */
  private readChar(): string {
    this.curPosition++;
    this.curChar = this.input[this.curPosition - 1];
    return this.curChar;
  }

  /**
   * 引数として渡した条件式が true の間 parse を進めてその区間の文字列を結合して返す関数
   * @params {function(n: string | EOF): boolean} conditionFn
   * @returns {string} tagName
   */
  private readWhile(conditionFn: (n: string | EOF) => boolean): string {
    let result = "";
    while (conditionFn(this.peekNextChar()) === true) {
      result += this.readChar();
    }
    return result;
  }

  /**
   * 空白文字の間は parse を進め続ける（空白を skip するため）の関数
   * @returns {void}
   */
  private consumeWhiteSpace(): void {
    this.readWhile((c) => /\s/.test(c));
  }

  /**
   * 次の文字が "," の場合は 1文字進める
   * @returns {void}
   */
  private consumeComma() {
    if (this.peekNextChar() === ",") {
      this.readChar();
    }
  }

  /**
   * CSS の class, id, tag 指定のセレクタを parse する関数
   * @returns {Selector}
   */
  private parseSelector(): Selector {
    const nextChar = this.peekNextChar();
    let selectorHeadSymbol: IdentifierSymbol | ClassSymbol | null = null;

    if (nextChar === "." || nextChar === "#") {
      selectorHeadSymbol = this.readChar() as IdentifierSymbol | ClassSymbol;
    }
    // NOTE: 記号が来るまで selector として parse
    const selectorName = this.readWhile((char) => /[\w_-]/.test(char));

    switch (selectorHeadSymbol) {
      case ".":
        return {
          type: SelectorType.Class,
          name: selectorName,
        };
      case "#":
        return {
          type: SelectorType.Id,
          name: selectorName,
        };
      default:
        return {
          type: SelectorType.Tag,
          name: selectorName,
        };
    }
  }

  /**
   * { が来るまでセレクタの parse を続ける関数
   * @returns {Selector[]}
   */
  private parseSelectors(): Selector[] {
    const selectors: Selector[] = [];
    while (true) {
      this.consumeWhiteSpace();
      if (this.peekNextChar() === "{") {
        break;
      }
      selectors.push(this.parseSelector());
      this.consumeComma();
    }
    return selectors;
  }

  /**
   * 数字と単位の pair を parse する関数
   * @returns {Length}
   */
  private parseLength(): Length {
    const num = this.readWhile((char) => /\d/.test(char));
    const unit = this.readWhile((char) => /[a-zA-Z]/.test(char));
    return [Number(num), unit as Unit];
  }

  /**
   * 色を parse する関数
   * @returns {Color}
   */
  private parseColor(): Color {
    const parseHexPair = () => {
      const a = this.readChar();
      const b = this.readChar();
      return parseInt(`${a}${b}`, 16);
    };

    assert(this.readChar() === "#");
    return {
      r: parseHexPair(),
      g: parseHexPair(),
      b: parseHexPair(),
      a: 255,
    };
  }

  /**
   * css declaration の value 部分を parse する関数
   * @returns {Length | Color | string}
   */
  private parseValue() {
    this.consumeWhiteSpace();
    const nextChar = this.peekNextChar();
    switch (true) {
      case /\d/.test(nextChar):
        return this.parseLength();
      case /#/.test(nextChar):
        return this.parseColor();
      default:
        return this.readWhile((char) => /[a-zA-Z-]/.test(char));
    }
  }

  private parseDeclaration(): Declaration {
    const key = this.readWhile((char) => /[a-zA-Z-]/.test(char));
    this.consumeWhiteSpace();
    assert(this.readChar() === ":");
    const value = this.parseValue();
    return {
      key,
      value,
    };
  }

  private parseDeclarations(): Declaration[] {
    const declarations: Declaration[] = [];
    while (true) {
      this.consumeWhiteSpace();
      if (this.peekNextChar() === "}") {
        break;
      }
      declarations.push(this.parseDeclaration());
      this.consumeWhiteSpace();
      assert(this.readChar() === ";");
    }
    return declarations;
  }

  parseRules(): Stylesheet {
    const rules: Rule[] = [];
    while (true) {
      this.consumeWhiteSpace();
      if (this.isEOF()) {
        break;
      }
      const selectors = this.parseSelectors();
      assert(this.readChar() === "{");
      const declarations = this.parseDeclarations();
      assert(this.readChar() === "}");
      rules.push({
        selectors,
        declarations,
      });
    }
    return {
      rules,
    };
  }
}

export const parseCss = (source: string): Stylesheet => {
  return new CssParser(source).parseRules();
};
