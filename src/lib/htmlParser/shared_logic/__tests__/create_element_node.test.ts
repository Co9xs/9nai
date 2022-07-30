import { assertEquals } from "std/testing/asserts";
import { NodeType } from "../../type.ts";
import { createElementNode } from "../create_element_node.ts";

Deno.test(
  "createElementNode: 引数に渡した tagName と戻り値の tagName が一致する",
  () => {
    const result = createElementNode("div", [], []);
    assertEquals(result, {
      type: NodeType.Element,
      tagName: "div",
      attributes: [],
      children: [],
    });
  }
);

Deno.test(
  "createElementNode: 引数に渡した attributes と 戻り値の attributes が一致する",
  () => {
    const result = createElementNode(
      "div",
      [{ id: "id-1", class: "class-1" }],
      []
    );
    assertEquals(result, {
      type: NodeType.Element,
      tagName: "div",
      attributes: [{ id: "id-1", class: "class-1" }],
      children: [],
    });
  }
);

Deno.test(
  "createElementNode: 引数に渡した children と戻り値の children が一致する",
  () => {
    const result = createElementNode(
      "div",
      [],
      [
        {
          type: NodeType.Element,
          tagName: "div",
          attributes: [],
          children: [],
        },
        {
          type: NodeType.Element,
          tagName: "div",
          attributes: [{ id: "id-1", class: "class-1" }],
          children: [],
        },
      ]
    );
    assertEquals(result, {
      type: NodeType.Element,
      tagName: "div",
      attributes: [],
      children: [
        {
          type: NodeType.Element,
          tagName: "div",
          attributes: [],
          children: [],
        },
        {
          type: NodeType.Element,
          tagName: "div",
          attributes: [{ id: "id-1", class: "class-1" }],
          children: [],
        },
      ],
    });
  }
);
