import { assertEquals } from "std/testing/asserts";
import { createTextNode } from "../create_text_node.ts";
import { NodeType } from "../../type.ts";

Deno.test("createTextNode: 引数に渡した文字列が content に入った TextNode を返す", () => {
  const value = "Hello, World!";
  const result = createTextNode(value);
  assertEquals(result, {
    type: NodeType.Text,
    content: value,
  });
});
