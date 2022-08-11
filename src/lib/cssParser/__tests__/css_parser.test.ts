import { assertEquals, assertFalse } from "std/testing/asserts";
import { CssParser, END_OF_FILE } from "../css_parser.ts";
import { SelectorType } from "../type.ts";

Deno.test(
  "CssParser isEOF: 現在位置が source に渡される文字列の長さになったら true を返す",
  () => {
    const source = `hoge`;
    const parser = new CssParser(source);
    parser["readChar"]();
    parser["readChar"]();
    assertFalse(parser["isEOF"]());
    parser["readChar"]();
    parser["readChar"]();
    // NOTE: 4文字読み終わった時点で EOF になる
    assertEquals(parser["isEOF"](), true);
  }
);

Deno.test(
  "CssParser peekNextChar: 複数回呼んでも curPosition は変えずに常に現在から1つ先の文字を返す",
  () => {
    const source = `hoge`;
    const parser = new CssParser(source);
    assertEquals(parser["peekNextChar"](), "h");
    assertEquals(parser["peekNextChar"](), "h");
    parser["readChar"]();
    assertEquals(parser["peekNextChar"](), "o");
    assertEquals(parser["peekNextChar"](), "o");
    parser["readChar"]();
    assertEquals(parser["peekNextChar"](), "g");
    parser["readChar"]();
    assertEquals(parser["peekNextChar"](), "e");
    parser["readChar"]();
    // NOTE: EOF のときは END_OF_FILE を返す
    assertEquals(parser["peekNextChar"](), END_OF_FILE);
  }
);

Deno.test(
  "CssParser readChar: readChar を呼び出すたびに次の文字が返される",
  () => {
    const source = `hogefuga`;
    const parser = new CssParser(source);
    assertEquals(parser["readChar"](), "h");
    assertEquals(parser["readChar"](), "o");
    assertEquals(parser["readChar"](), "g");
    assertEquals(parser["readChar"](), "e");
  }
);

Deno.test(
  "CssParser readWhile: 条件式が true の間は readChar を呼び出してその区間の文字列を返す",
  () => {
    // NOTE: 記号以外の文字列の間は読み続けるパターン
    assertEquals(
      new CssParser(`hog-e-fuga`)["readWhile"]((c: string) => /\w/.test(c)),
      "hog"
    );
  }
);

Deno.test(
  "CssParser consumeWhiteSpace: 空白の間は readChar を呼び出してその区間の文字列を返す",
  () => {
    const source = `   a`;
    const parser = new CssParser(source);
    assertEquals(
      parser["readWhile"]((c: string) => /\s/.test(c)),
      "   "
    );
  }
);

Deno.test("CssParser consumeComma: 次の文字が , の時だけ 1文字進める", () => {
  const source = `ho,ge`;
  const parser = new CssParser(source);
  // NOTE: 次の文字が , 以外のときは何もしない
  parser["consumeComma"]();
  assertEquals(parser["peekNextChar"](), "h");
  assertEquals(parser["peekNextChar"](), "h");
  // NOTE: 次の文字が , になるまで進める
  parser["readChar"]();
  parser["readChar"]();
  parser["consumeComma"]();
  assertEquals(parser["peekNextChar"](), "g");
});

Deno.test(
  "CssParser parseSelector: 次の文字が . の時は class として parse した結果を返す",
  () => {
    const source = `.className {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelector"](), {
      type: SelectorType.Class,
      name: "className",
    });
  }
);

Deno.test(
  "CssParser parseSelector: 次の文字が # の時は id として parse した結果を返す",
  () => {
    const source = `#idName {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelector"](), {
      type: SelectorType.Id,
      name: "idName",
    });
  }
);

Deno.test(
  "CssParser parseSelector: 次の文字が . でも # でもない時は tag として parse した結果を返す",
  () => {
    const source = `h1 {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelector"](), {
      type: SelectorType.Tag,
      name: "h1",
    });
  }
);

Deno.test(
  "CssParser parseSelectors: 複数の class selector を parse できる",
  () => {
    const source = `.class1 .class2 {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelectors"](), [
      {
        type: SelectorType.Class,
        name: "class1",
      },
      {
        type: SelectorType.Class,
        name: "class2",
      },
    ]);
  }
);

Deno.test(
  "CssParser parseSelectors: 複数の id selector を parse できる",
  () => {
    const source = `#id1 #id2 {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelectors"](), [
      {
        type: SelectorType.Id,
        name: "id1",
      },
      {
        type: SelectorType.Id,
        name: "id2",
      },
    ]);
  }
);

Deno.test(
  "CssParser parseSelectors: 複数の tag selector を parse できる",
  () => {
    const source = `h1 h2 {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelectors"](), [
      {
        type: SelectorType.Tag,
        name: "h1",
      },
      {
        type: SelectorType.Tag,
        name: "h2",
      },
    ]);
  }
);

Deno.test(
  "CssParser parseSelectors: 複数の class, id, tag を parse できる",
  () => {
    const source = `.className #idName tag {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelectors"](), [
      {
        type: SelectorType.Class,
        name: "className",
      },
      {
        type: SelectorType.Id,
        name: "idName",
      },
      {
        type: SelectorType.Tag,
        name: "tag",
      },
    ]);
  }
);
Deno.test(
  "CssParser parseSelectors: 複数の class, id, tag を parse できる",
  () => {
    const source = `.className #idName tag {}`;
    const parser = new CssParser(source);
    assertEquals(parser["parseSelectors"](), [
      {
        type: SelectorType.Class,
        name: "className",
      },
      {
        type: SelectorType.Id,
        name: "idName",
      },
      {
        type: SelectorType.Tag,
        name: "tag",
      },
    ]);
  }
);

Deno.test("CssParser parseLength: 数字と単位のペアを parse できる", () => {
  const source = `10px;`;
  const parser = new CssParser(source);
  assertEquals(parser["parseLength"](), [10, "px"]);
});

Deno.test("CssParser parseColor: 16進数表記の色を parse できる", () => {
  const source = `#FFFFFF;`;
  const parser = new CssParser(source);
  assertEquals(parser["parseColor"](), {
    r: 255,
    g: 255,
    b: 255,
    a: 255,
  });
});

Deno.test("CssParser parseValue: 文字列の value を parse できる", () => {
  const source = `space-between;`;
  const parser = new CssParser(source);
  assertEquals(parser["parseValue"](), "space-between");
});
