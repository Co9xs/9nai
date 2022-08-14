import { DISPLAY_TYPE } from "../constants.ts";
import { Value } from "../cssParser/type.ts";
import { ElementNode, TextNode } from "../htmlParser/type.ts";

export type PropertyMap = Record<string, Value>;

export interface StyledNodeInterface {
  node: ElementNode | TextNode;
  propertyMap: PropertyMap;
  children: StyledNodeInterface[];
}

export type DisplayType = typeof DISPLAY_TYPE[keyof typeof DISPLAY_TYPE];
