export enum NodeType {
  Document = "document",
  Element = "element",
  Text = "text",
}

export type Attribute = Record<string, number | string | boolean>;

interface INode {
  type: NodeType;
}

export interface RootNode extends INode {
  type: NodeType.Document;
  tagName: "!DOCTYPE";
  children: (ElementNode | TextNode)[];
  attributes?: Attribute[];
}

export interface ElementNode extends INode {
  type: NodeType.Element;
  tagName: string;
  children: (ElementNode | TextNode)[];
  attributes: Attribute[];
}

export interface TextNode extends INode {
  type: NodeType.Text;
  content: string;
}

export enum HtmlSymbolToken {
  EQUAL = "=",
  GREATER_THAN = ">",
  LESS_THAN = "<",
  WHITE_SPACE = " ",
  SLASH = "/",
}

export const SELF_CLOSABLE_TAG_NAMES = [
  "br",
  "input",
  "img",
  "hr",
  "link",
  "meta",
  "!DOCTYPE",
];
