import { ElementNode, TextNode } from "../htmlParser/type.ts";

export type Stylesheet = {
  rules: Rule[];
};

export type Rule = {
  selectors: Selector[];
  declarations: Declaration[];
};

export enum SelectorType {
  Tag = "tag",
  Id = "id",
  Class = "class",
}

export type Selector = {
  type: SelectorType;
  name: string;
};

export type Declaration = {
  key: string;
  value: Value;
};

export type Value = Keyword | Color | Length;

type Keyword = string;

export type Length = [number, Unit];

export type Unit = "px" | "em" | "rem" | "vh" | "vw" | "vmin" | "vmax";

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type PropertyMap = Record<string, Declaration[]>;

export type StyledNode = {
  node: ElementNode | TextNode;
  specificValues: PropertyMap;
  children: StyledNode[];
};

export type IdentifierSymbol = "#";
export type ClassSymbol = ".";
