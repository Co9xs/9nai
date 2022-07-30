import { NodeType, TextNode } from "../type.ts";

/**
 * value を受け取って TextNode を生成する関数
 * @param {string} value
 * @returns {TextNode} value が content に 入った TextNode
 */
export function createTextNode(value: string): TextNode {
  return {
    type: NodeType.Text,
    content: value,
  };
}
