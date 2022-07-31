import { assert } from "https://deno.land/std@0.150.0/testing/asserts.ts";
import { createElementNode } from "./shared_logic/create_element_node.ts";
import { createTextNode } from "./shared_logic/create_text_node.ts";
import {
  Attribute,
  ElementNode,
  HtmlSymbolToken,
  SELF_CLOSABLE_TAG_NAMES,
  TextNode,
} from "./type.ts";

// FIXME: improve handling eof
const END_OF_FILE = "<END_OF_FILE/>" as const;
type EOF = typeof END_OF_FILE;

export class HtmlParser {
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
  private peekNextChar(): string | EOF {
    return this.isEOF()
      ? END_OF_FILE
      : this.input.substring(this.curPosition, this.curPosition + 1);
  }

  /**
   * parser の position を1文字進めて現在 parse 中の文字を返す関数
   * @returns {string | EOF} 現状 parse 中の文字列
   */
  private readChar(): string | EOF {
    this.curPosition++;
    this.curChar = this.input[this.curPosition - 1];
    return this.curChar;
  }

  /**
   * 1文字先読みした結果が "<" なら ElementNode として parse する, それ以外なら TextNode として parse する関数
   * @returns {ElementNode | TextNode} parse 結果
   */
  private parseNode(): ElementNode | TextNode {
    return this.peekNextChar() === HtmlSymbolToken.LESS_THAN
      ? this.parseAsElementNode()
      : this.parseAsTextNode();
  }

  /**
   * "<" がくるまでを純粋な text として読んで TextNode を返す関数
   * @returns {TextNode} parse 結果
   */
  private parseAsTextNode(): TextNode {
    const hasNotReachedLessThanSymbol = (c: string) =>
      c !== HtmlSymbolToken.LESS_THAN;
    const string = this.readWhile(hasNotReachedLessThanSymbol).trim();
    return createTextNode(string);
  }

  /**
   * "<" から ">" の間にある tagName と attribute を parse し、children を再帰的に parse する関数
   * @returns {ElementNode} parse 結果
   */
  private parseAsElementNode(): ElementNode {
    assert(this.readChar() === HtmlSymbolToken.LESS_THAN);
    const tagName = this.parseTagName();
    const attributes = this.parseAttributes();

    assert(this.curChar === HtmlSymbolToken.GREATER_THAN);

    // NOTE: self closing tag でないときは children の parse と閉じタグがあることをテストする
    if (!SELF_CLOSABLE_TAG_NAMES.includes(tagName)) {
      const children = this.parseNodes();
      assert(this.readChar() === HtmlSymbolToken.LESS_THAN);
      assert(this.readChar() === HtmlSymbolToken.SLASH);
      assert(this.parseTagName() === tagName);
      assert(this.readChar() === HtmlSymbolToken.GREATER_THAN);
      return createElementNode(tagName, attributes, children);
    } else {
      return createElementNode(tagName, attributes, []);
    }
  }

  /**
   *  "=", ">", " ", "/" が来るまでを attr の key として parse する関数
   * @returns {string} attr key
   */
  private parseAttrKey(): string {
    const hasNotReachedEndAttrKey = (c: string) => {
      return (
        c !== HtmlSymbolToken.EQUAL && // =
        c !== HtmlSymbolToken.GREATER_THAN && // >
        c !== HtmlSymbolToken.WHITE_SPACE && // " "
        c !== HtmlSymbolToken.SLASH
      );
    };
    return this.readWhile(hasNotReachedEndAttrKey);
  }

  /**
   *  シングルクオート or ダブルクオート に囲まれた文字列を attr の value として parse する関数
   * @returns {string | boolean} attr value
   */
  private parseAttrValue(): string | boolean {
    const openQuote = this.readChar();
    assert(openQuote === '"' || openQuote === "'");
    const value = this.readWhile((c) => c !== openQuote);
    assert(this.readChar() === openQuote);
    return value;
  }

  /**
   *  attr の parse をする関数
   *  key だけで指定できる属性 や 値も含めて指定する属性をハンドリングする
   * @returns {Attribute | null} 属性を表す key, value を持った Object
   */
  private parseAttr(): Attribute | null {
    this.consumeWhiteSpace();
    const key = this.parseAttrKey();
    const nextChar = this.readChar();
    // NOTE: 次の文字が"="であればkey=valueの属性として parse
    if (key && nextChar === HtmlSymbolToken.EQUAL) {
      const value = this.parseAttrValue();
      return { key, value };
      // NOTE: 次の文字が " " or ">" であれば key のみの属性として parse
    } else if (
      key &&
      [HtmlSymbolToken.GREATER_THAN, HtmlSymbolToken.WHITE_SPACE].includes(
        nextChar as HtmlSymbolToken
      )
    ) {
      const value = true;
      return { key, value };
    }
    return null;
  }

  /**
   *  tag の終わりが来るまで attr として parse する関数
   * @returns {Attribute[]} attr の配列
   */
  private parseAttributes(): Attribute[] {
    const attributes: Attribute[] = [];

    while (true) {
      if (this.curChar === HtmlSymbolToken.GREATER_THAN) {
        break;
      }
      const attr = this.parseAttr();
      if (attr) {
        attributes.push(attr);
      }
    }

    return attributes;
  }

  /**
   *  記号の除いた純粋なアルファベットを tagName として parse する関数
   * @returns {string} tagName
   */
  private parseTagName(): string {
    const isPureAlphabet = (c: string) => /\w/.test(c);
    return this.readWhile(isPureAlphabet);
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
   * html をすべて parse する関数. class 外から使用されるときのエントリポイントになる
   * @returns {(ElementNode | TextNode)[]} 最終的な parse 結果
   */
  public parseNodes(): (ElementNode | TextNode)[] {
    const nodes: (ElementNode | TextNode)[] = [];
    while (true) {
      this.consumeWhiteSpace();
      if (this.isEOF() || this.startWith("</")) {
        break;
      }
      const node = this.parseNode();
      nodes.push(node);
    }
    return nodes;
  }

  /**
   * 現在位置が引数に渡された文字列で始まるかどうかを判断する関数
   * @returns {boolean} result
   */
  private startWith(s: string): boolean {
    return this.input.substring(this.curPosition).startsWith(s);
  }
}

/**
 * HtmlParser で parse した結果を返す関数.
 * 基本は単一の node になるが、複数の tree が結果として帰ってきたときは root element で wrap して返す
 * @returns {ElementNode | TextNode} parse 結果
 */
export const parseHtml = (source: string): ElementNode | TextNode => {
  const parser = new HtmlParser(source);
  const nodes = parser.parseNodes();
  return nodes.length === 1 ? nodes[0] : createElementNode("root", [], nodes);
};
