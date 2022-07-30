import { parseHtml } from "./lib/htmlParser/html_parser.ts";

// FIXME: 最後に改行文字列が必要（他の改行文字列の扱い）
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

console.log(JSON.stringify(parseHtml(value), null, " "));
