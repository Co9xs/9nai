import { assertEquals } from "std/testing/asserts";
import { parseHtml } from "../html_parser.ts";
import { NodeType } from "../type.ts";

Deno.test("parseHtml: 属性, 子要素なしの単一の html を parse できる", () => {
  const value = `<p></p>`;
  const result = parseHtml(value);
  assertEquals(result, {
    type: NodeType.Element,
    tagName: "p",
    attributes: [],
    children: [],
  });
});

Deno.test("parseHtml: 1つの属性がある単一の html を parse できる", () => {
  const value = `<p class="text"></p>`;
  const result = parseHtml(value);
  assertEquals(result, {
    type: NodeType.Element,
    tagName: "p",
    attributes: [
      {
        key: "class",
        value: "text",
      },
    ],
    children: [],
  });
});

Deno.test("parseHtml: 複数の属性がある単一の html を parse できる", () => {
  const value = `
  <p class="text" id="id-1" disable="false" aria-current></p>
  `;
  const result = parseHtml(value);
  assertEquals(result, {
    type: NodeType.Element,
    tagName: "p",
    attributes: [
      {
        key: "class",
        value: "text",
      },
      {
        key: "id",
        value: "id-1",
      },
      {
        key: "disable",
        value: "false",
      },
      {
        key: "aria-current",
        value: true,
      },
    ],
    children: [],
  });
});

Deno.test("parseHtml: 1つの子要素がある html を parse できる", () => {
  const value = `<p>Hello, World!</p>`;
  const result = parseHtml(value);
  assertEquals(result, {
    type: NodeType.Element,
    tagName: "p",
    attributes: [],
    children: [
      {
        type: NodeType.Text,
        content: "Hello, World!",
      },
    ],
  });
});

Deno.test("parseHtml: 複数の子要素がある html を parse できる", () => {
  const value = `
    <ul>
      Hello
      <li>home</li>
      <li>about</li>
      <li>news</li>
    </ul>
  `;
  const result = parseHtml(value);
  assertEquals(result, {
    type: NodeType.Element,
    tagName: "ul",
    attributes: [],
    children: [
      {
        type: NodeType.Text,
        content: "Hello",
      },
      {
        type: NodeType.Element,
        tagName: "li",
        attributes: [],
        children: [
          {
            type: NodeType.Text,
            content: "home",
          },
        ],
      },
      {
        type: NodeType.Element,
        tagName: "li",
        attributes: [],
        children: [
          {
            type: NodeType.Text,
            content: "about",
          },
        ],
      },
      {
        type: NodeType.Element,
        tagName: "li",
        attributes: [],
        children: [
          {
            type: NodeType.Text,
            content: "news",
          },
        ],
      },
    ],
  });
});

Deno.test(
  "parseHtml: 複数の属性, 複数の子要素がある html を parse できる",
  () => {
    const value = `
      <html lang="en">
        <head>
          <title>Document</title>
        </head>
        <body>
          <img src="./html_parser.test.ts" />
          <ul>
            <li class="list__item active" aria-current>
              home
            </li>
          </ul>
          <img src="./html_parser.test.ts" />
        </body>
      </html>
      `;
    const result = parseHtml(value);
    assertEquals(result, {
      type: NodeType.Element,
      tagName: "html",
      attributes: [
        {
          key: "lang",
          value: "en",
        },
      ],
      children: [
        {
          type: NodeType.Element,
          tagName: "head",
          attributes: [],
          children: [
            {
              attributes: [],
              type: NodeType.Element,
              children: [
                {
                  type: NodeType.Text,
                  content: "Document",
                },
              ],
              tagName: "title",
            },
          ],
        },
        {
          type: NodeType.Element,
          tagName: "body",
          attributes: [],
          children: [
            {
              type: NodeType.Element,
              tagName: "img",
              attributes: [{ key: "src", value: "./html_parser.test.ts" }],
              children: [],
            },
            {
              type: NodeType.Element,
              tagName: "ul",
              attributes: [],
              children: [
                {
                  type: NodeType.Element,
                  tagName: "li",
                  attributes: [
                    { key: "class", value: "list__item active" },
                    { key: "aria-current", value: true },
                  ],
                  children: [
                    {
                      type: NodeType.Text,
                      content: "home",
                    },
                  ],
                },
              ],
            },
            {
              type: NodeType.Element,
              tagName: "img",
              attributes: [{ key: "src", value: "./html_parser.test.ts" }],
              children: [],
            },
          ],
        },
      ],
    });
  },
);
