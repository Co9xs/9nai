import { TAG_DISPLAY_TYPE_MAP } from "../constants.ts";
import {
  Selector,
  SelectorType,
  Stylesheet,
  Value,
} from "../cssParser/type.ts";
import { ElementNode, NodeType, TextNode } from "../htmlParser/type.ts";
import { sortStylesheetByDetail } from "./shared_logic/sort_stylesheet_by_detail.ts";
import { DisplayType, PropertyMap, StyledNodeInterface } from "./type.ts";

export class StyledNode implements StyledNodeInterface {
  readonly node: ElementNode | TextNode;
  readonly propertyMap: PropertyMap;
  readonly children: StyledNode[];

  constructor(node: TextNode | ElementNode, stylesheet: Stylesheet) {
    this.node = node;
    this.propertyMap = this.createSpecificPropertyMap(node, stylesheet);
    this.children = this.isElementNode(node)
      ? node.children.map((n) => new StyledNode(n, stylesheet))
      : [];
  }

  /**
   * propertyMap から value を取り出す関数
   * @params {prop} string
   * @returns {Value | null}
   */
  private getValue(prop: string): Value | null {
    const value: Value = this.propertyMap[prop];
    return value ? value : null;
  }

  /**
   * fallback, defaultValue 付きで ProperyMap から value を取り出す関数
   * @params {prop} string
   * @params {fallbackName} string
   * @params {defaultValue} Value
   * @returns {Value}
   */
  private lookup(
    prop: string,
    fallbackName: string,
    defaultValue: Value,
  ): Value {
    return this.getValue(prop) || this.getValue(fallbackName) || defaultValue;
  }

  /**
   * node の種類によって display property の値を返す関数
   * @returns {DisplayType}
   */
  private display(): DisplayType {
    if (this.getValue("display")) {
      return this.getValue("display") as DisplayType;
    }
    if (
      this.isElementNode(this.node) &&
      this.node.tagName in TAG_DISPLAY_TYPE_MAP
    ) {
      return TAG_DISPLAY_TYPE_MAP[
        this.node.tagName as keyof typeof TAG_DISPLAY_TYPE_MAP
      ];
    }
    return "inline";
  }

  /**
   * 引数の node が ElementNode かどうかの真偽値を返す関数
   * @params {node} ElementNode | TextNode)
   * @returns {boolean}
   */
  private isElementNode(node: ElementNode | TextNode): node is ElementNode {
    return node.type === NodeType.Element;
  }

  /**
   * 引数の node と selector がマッチするかどうかを返す関数
   * @params {node} ElementNode | TextNode)
   * @returns {boolean}
   */
  private matches(node: ElementNode | TextNode, selector: Selector): boolean {
    if (node.type === NodeType.Text) {
      return false;
    }
    if (selector.type === SelectorType.Tag && node.tagName === selector.name) {
      return true;
    }
    // NOTE: id の時は attributes の配列から id が key のものかつ selector name と一致するものがあれば true
    if (
      selector.type === SelectorType.Id &&
      node.attributes.filter(
          (attr) => attr.key === "id" && attr.value === selector.name,
        ).length !== 0
    ) {
      return true;
    }
    // NOTE: class の時は attributes の配列から class が key のものに filter して、一つでも selector name と一致するものがあれば true
    if (
      selector.type === SelectorType.Class &&
      node.attributes
        .filter((attr) => attr.key === "class")
        .some((attr) => attr.value === selector.name)
    ) {
      return true;
    }
    return false;
  }

  /**
   * rule の selector が node にマッチするなら PropertyMap に追加して返す関数
   * @params {node} ElementNode | TextNode)
   * @params {stylesheet} Stylesheet
   * @returns {PropertyMap}
   */
  private createSpecificPropertyMap(
    node: ElementNode | TextNode,
    stylesheet: Stylesheet,
  ): PropertyMap {
    const map = stylesheet.rules.reduce<PropertyMap>((result, rule) => {
      // NOTE: stylesheet には詳細度順に並んだ rule が入ってくるので、より詳細度の高いものがあればここで上書きされる
      if (rule.selectors.some((selector) => this.matches(node, selector))) {
        rule.declarations.forEach((declaration) => {
          result[declaration.key] = declaration.value;
        });
      }
      return result;
    }, {});
    return map;
  }
}

export const buildStyledTree = (
  node: ElementNode | TextNode,
  stylesheet: Stylesheet,
): StyledNode => {
  const sortedStylesheet = sortStylesheetByDetail(stylesheet);

  return new StyledNode(node, sortedStylesheet);
};
