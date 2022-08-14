import { assertEquals } from "std/testing/asserts";
import { SelectorType } from "../../../cssParser/type.ts";
import { sortStylesheetByDetail } from "../sort_stylesheet_by_detail.ts";

Deno.test(
  "sortStylesheetByDetail: 複数の rule を含む stylesheet を受け取って rule を詳細度順にソートする",
  () => {
    const result = sortStylesheetByDetail({
      rules: [
        {
          selectors: [
            { type: SelectorType.Tag, name: "h1" },
            { type: SelectorType.Class, name: "className1" },
            { type: SelectorType.Class, name: "className2" },
            { type: SelectorType.Id, name: "idName1" },
          ],
          declarations: [
            { key: "display", value: "flex" },
            { key: "align-items", value: "center" },
            { key: "justify-content", value: "space-between" },
            { key: "width", value: "100px" },
          ],
        },
        {
          selectors: [
            { type: SelectorType.Tag, name: "span" },
            { type: SelectorType.Class, name: "className2" },
            { type: SelectorType.Class, name: "className3" },
            { type: SelectorType.Id, name: "idName2" },
          ],
          declarations: [
            { key: "color", value: "#FFFFFF" },
            { key: "width", value: "1080px" },
            { key: "display", value: "block" },
            { key: "height", value: "500px" },
          ],
        },
      ],
    });

    assertEquals(result, {
      rules: [
        {
          selectors: [
            {
              type: SelectorType.Tag,
              name: "h1",
            },
          ],
          declarations: [
            {
              key: "display",
              value: "flex",
            },
            {
              key: "align-items",
              value: "center",
            },
            {
              key: "justify-content",
              value: "space-between",
            },
            {
              key: "width",
              value: "100px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Tag,
              name: "span",
            },
          ],
          declarations: [
            {
              key: "color",
              value: "#FFFFFF",
            },
            {
              key: "width",
              value: "1080px",
            },
            {
              key: "display",
              value: "block",
            },
            {
              key: "height",
              value: "500px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Class,
              name: "className1",
            },
          ],
          declarations: [
            {
              key: "display",
              value: "flex",
            },
            {
              key: "align-items",
              value: "center",
            },
            {
              key: "justify-content",
              value: "space-between",
            },
            {
              key: "width",
              value: "100px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Class,
              name: "className2",
            },
          ],
          declarations: [
            {
              key: "display",
              value: "flex",
            },
            {
              key: "align-items",
              value: "center",
            },
            {
              key: "justify-content",
              value: "space-between",
            },
            {
              key: "width",
              value: "100px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Class,
              name: "className2",
            },
          ],
          declarations: [
            {
              key: "color",
              value: "#FFFFFF",
            },
            {
              key: "width",
              value: "1080px",
            },
            {
              key: "display",
              value: "block",
            },
            {
              key: "height",
              value: "500px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Class,
              name: "className3",
            },
          ],
          declarations: [
            {
              key: "color",
              value: "#FFFFFF",
            },
            {
              key: "width",
              value: "1080px",
            },
            {
              key: "display",
              value: "block",
            },
            {
              key: "height",
              value: "500px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Id,
              name: "idName1",
            },
          ],
          declarations: [
            {
              key: "display",
              value: "flex",
            },
            {
              key: "align-items",
              value: "center",
            },
            {
              key: "justify-content",
              value: "space-between",
            },
            {
              key: "width",
              value: "100px",
            },
          ],
        },
        {
          selectors: [
            {
              type: SelectorType.Id,
              name: "idName2",
            },
          ],
          declarations: [
            {
              key: "color",
              value: "#FFFFFF",
            },
            {
              key: "width",
              value: "1080px",
            },
            {
              key: "display",
              value: "block",
            },
            {
              key: "height",
              value: "500px",
            },
          ],
        },
      ],
    });
  },
);
