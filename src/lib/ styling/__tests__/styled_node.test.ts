import { assertEquals } from "std/testing/asserts";
import { parseCss } from "../../cssParser/css_parser.ts";
import { parseHtml } from "../../htmlParser/html_parser.ts";
import { ElementNode, NodeType, TextNode } from "../../htmlParser/type.ts";
import { buildStyledTree, StyledNode } from "../styled_node.ts";
import { PropertyMap } from "../type.ts";

Deno.test(
  "buildStyledTree",
  async (t) => {
    type ExpectedStyledNode = {
      node: ElementNode | TextNode;
      propertyMap: PropertyMap;
      children: ExpectedStyledNode[];
    };

    const assertStyledNodeEquals = (
      actual: StyledNode,
      expected: ExpectedStyledNode
    ): void => {
      assertEquals(actual.node, expected.node);
      assertEquals(actual.propertyMap, expected.propertyMap);
      actual.children.forEach((n, index) => {
        assertStyledNodeEquals(n, expected.children[index]);
      });
    };

    const testCase: {
      case: { title: string; html: string; css: string };
      expected: ExpectedStyledNode;
    }[] = [
      {
        case: {
          title: "中身が空の要素のときに単一の ElementNode を返す",
          html: "<h1></h1>",
          css: "",
        },
        expected: {
          node: {
            type: NodeType.Element,
            tagName: "h1",
            attributes: [],
            children: [],
          },
          propertyMap: {},
          children: [],
        },
      },
      {
        case: {
          title: "単一の要素に id でスタイリングできる",
          html: "<h1 id='heading1'></h1>",
          css: `
          #heading1 {
            color: red;
          }
        `,
        },
        expected: {
          node: {
            type: NodeType.Element,
            tagName: "h1",
            attributes: [{ key: "id", value: "heading1" }],
            children: [],
          },
          propertyMap: {
            color: "red",
          },
          children: [],
        },
      },
      {
        case: {
          title: "詳細度の高いスタイルで上書きされる",
          html: "<h1 id='id' class='class'></h1>",
          css: `
          h1 {
            color: red;
          }
          #id {
            color: blue;
          }
          .class {
            color: green;
          }
        `,
        },
        expected: {
          node: {
            type: NodeType.Element,
            tagName: "h1",
            attributes: [
              { key: "id", value: "id" },
              { key: "class", value: "class" },
            ],
            children: [],
          },
          propertyMap: {
            color: "blue",
          },
          children: [],
        },
      },
      {
        case: {
          title: "ネストした要素をスタイリングできる",
          html: `
          <div id="header">
            <h1 class="title">My Blog</h1>
            <p class="subtitle">learning log</p>
          </div>
        `,
          css: `
          #header {
            font-size: 30px;
          }
          .title, .subtitle, #header {
            color: #ffff00;
          }
          p {
            display: inline-block;
          }
        `,
        },
        expected: {
          node: {
            type: NodeType.Element,
            tagName: "div",
            attributes: [{ key: "id", value: "header" }],
            children: [
              {
                type: NodeType.Element,
                tagName: "h1",
                attributes: [{ key: "class", value: "title" }],
                children: [{ type: NodeType.Text, content: "My Blog" }],
              },
              {
                type: NodeType.Element,
                tagName: "p",
                attributes: [{ key: "class", value: "subtitle" }],
                children: [{ type: NodeType.Text, content: "learning log" }],
              },
            ],
          },
          propertyMap: {
            "font-size": [30, "px"],
            color: {
              r: 255,
              g: 255,
              b: 0,
              a: 255,
            },
          },
          children: [
            {
              node: {
                type: NodeType.Element,
                tagName: "h1",
                attributes: [{ key: "class", value: "title" }],
                children: [{ type: NodeType.Text, content: "My Blog" }],
              },
              propertyMap: {
                color: {
                  r: 255,
                  g: 255,
                  b: 0,
                  a: 255,
                },
              },
              children: [
                {
                  node: { type: NodeType.Text, content: "My Blog" },
                  propertyMap: {},
                  children: [],
                },
              ],
            },
            {
              node: {
                type: NodeType.Element,
                tagName: "p",
                attributes: [{ key: "class", value: "subtitle" }],
                children: [{ type: NodeType.Text, content: "learning log" }],
              },
              propertyMap: {
                display: "inline-block",
                color: {
                  r: 255,
                  g: 255,
                  b: 0,
                  a: 255,
                },
              },
              children: [
                {
                  node: { type: NodeType.Text, content: "learning log" },
                  propertyMap: {},
                  children: [],
                },
              ],
            },
          ],
        },
      },
    ];

    for (const c of testCase) {
      await t.step(c.case.title, () => {
        const actual = buildStyledTree(
          parseHtml(c.case.html),
          parseCss(c.case.css)
        );
        assertStyledNodeEquals(actual, c.expected);
      });
    }
  }
);
