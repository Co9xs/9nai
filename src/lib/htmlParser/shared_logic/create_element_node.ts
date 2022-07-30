import { Attribute, ElementNode, NodeType, TextNode } from "../type.ts";

/**
 * ElementNode を生成する関数
 * @param {string} tagName
 * @param {Attribute[]} attributes
 * @param {(ElementNode | TextNode)[]} children
 * @returns {ElementNode} html タグ ElementNode として parse した結果
 */
export function createElementNode(
  tagName: string,
  attributes: Attribute[],
  children: (ElementNode | TextNode)[]
): ElementNode {
  return {
    type: NodeType.Element,
    tagName,
    attributes,
    children,
  };
}
