import { SelectorType, Stylesheet } from "../../cssParser/type.ts";

/**
 * 詳細度順に rule を並べ替える関数
 * @params {stylesheet} Stylesheet
 * @returns {Stylesheet}
 */
export const sortStylesheetByDetail = (stylesheet: Stylesheet): Stylesheet => {
  const stylesheetHashMap: {
    [SELECTOR_TYPE: string]: Stylesheet;
  } = stylesheet.rules.reduce<{
    [SELECTOR_TYPE: string]: Stylesheet;
  }>((result, rule) => {
    // NOTE: SelectorType ごとにスタイルシートを分割する
    rule.selectors.forEach((selector) => {
      if (!result[selector.type]) {
        result[selector.type] = {
          rules: [],
        };
      }
      result[selector.type].rules.push({
        selectors: [selector],
        declarations: rule.declarations,
      });
    });
    return result;
  }, {});

  return {
    // NOTE: 詳細度順 に rule をソートする
    rules: [
      ...(stylesheetHashMap[SelectorType.Tag]
        ? stylesheetHashMap[SelectorType.Tag].rules
        : []),
      ...(stylesheetHashMap[SelectorType.Class]
        ? stylesheetHashMap[SelectorType.Class].rules
        : []),
      ...(stylesheetHashMap[SelectorType.Id]
        ? stylesheetHashMap[SelectorType.Id].rules
        : []),
    ],
  };
};
