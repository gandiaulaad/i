var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  onLoad: () => onLoad,
  onUnload: () => onUnload,
  settings: () => settings
});
module.exports = __toCommonJS(src_exports);
var import_common2 = require("@vendetta/metro/common");
var import_vendetta = require("@vendetta");
var import_plugin2 = require("@vendetta/plugin");

// src/Settings.tsx
var import_common = require("@vendetta/metro/common");
var import_components = require("@vendetta/ui/components");
var import_plugin = require("@vendetta/plugin");
var import_jsx_runtime = require("react/jsx-runtime");
var { FormSection, FormRow, FormSwitch } = import_components.Forms;
function Settings() {
  const [, forceUpdate] = import_common.React.useReducer((x) => ~x, 0);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSection, { title: "AppleEmojis", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    FormRow,
    {
      label: "Enabled",
      subLabel: "render emoji as Apple images",
      trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        FormSwitch,
        {
          value: import_plugin.storage.enabled,
          onValueChange: (v) => {
            import_plugin.storage.enabled = v;
            forceUpdate();
          }
        }
      )
    }
  ) });
}

// src/index.ts
var EMOJI_CHAR = "(?:\\u00a9|\\u00ae|[\\u2000-\\u3300]|\\ud83c[\\ud000-\\udfff]|\\ud83d[\\ud000-\\udfff]|\\ud83e[\\ud000-\\udfff])";
var EMOJI_RE = new RegExp(
  `(${EMOJI_CHAR}\\ufe0f?(?:\\u200d${EMOJI_CHAR}\\ufe0f?)*)`,
  "g"
);
var CDN = "https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160";
function emojiToCodepoint(emoji) {
  return Array.from(emoji).map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).filter((c) => c !== "fe0f").join("-");
}
function EmojiImage(props) {
  return import_common2.React.createElement(import_common2.ReactNative.Image, {
    source: { uri: `${CDN}/${emojiToCodepoint(props.emoji)}.png` },
    style: {
      width: props.size,
      height: props.size,
      marginHorizontal: 1
    },
    resizeMode: "contain"
  });
}
function fontSizeOf(style) {
  if (!style) return 22;
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  return typeof flat?.fontSize === "number" ? flat.fontSize : 22;
}
function transformString(str, size) {
  EMOJI_RE.lastIndex = 0;
  if (!EMOJI_RE.test(str)) return str;
  EMOJI_RE.lastIndex = 0;
  const out = [];
  let last = 0;
  let m;
  while (m = EMOJI_RE.exec(str)) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(
      import_common2.React.createElement(EmojiImage, {
        key: `e-${m.index}-${m[0]}`,
        emoji: m[0],
        size
      })
    );
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}
function walk(node, size) {
  if (typeof node === "string") return transformString(node, size);
  if (Array.isArray(node)) {
    const out = [];
    for (let i = 0; i < node.length; i++) {
      const r = walk(node[i], size);
      if (Array.isArray(r)) {
        for (let j = 0; j < r.length; j++) {
          const x = r[j];
          out.push(
            import_common2.React.isValidElement(x) ? import_common2.React.cloneElement(x, { key: `${i}-${j}` }) : x
          );
        }
      } else {
        out.push(r);
      }
    }
    return out;
  }
  if (import_common2.React.isValidElement(node)) {
    const kids = node.props?.children;
    if (kids == null) return node;
    const newKids = walk(kids, size);
    if (newKids === kids) return node;
    return import_common2.React.cloneElement(node, {}, newKids);
  }
  return node;
}
var unpatch = null;
function patchText() {
  const Text = import_common2.ReactNative.Text;
  const proto = Text?.prototype;
  if (!proto || typeof proto.render !== "function") {
    import_vendetta.logger.error(
      "[AppleEmojis] ReactNative.Text.render not found \u2014 RN version may have changed Text internals"
    );
    return;
  }
  const original = proto.render;
  proto.render = function() {
    const ret = original.call(this);
    if (!import_plugin2.storage.enabled || !import_common2.React.isValidElement(ret)) return ret;
    const size = Math.round(fontSizeOf(this.props?.style) * 1.25);
    try {
      const kids = ret.props?.children;
      if (kids == null) return ret;
      const newKids = walk(kids, size);
      if (newKids === kids) return ret;
      return import_common2.React.cloneElement(ret, {}, newKids);
    } catch (e) {
      import_vendetta.logger.error("[AppleEmojis] transform failed", e);
      return ret;
    }
  };
  unpatch = () => {
    proto.render = original;
  };
}
function onLoad() {
  if (import_plugin2.storage.enabled === void 0) import_plugin2.storage.enabled = true;
  patchText();
  import_vendetta.logger.log("[AppleEmojis] loaded");
}
function onUnload() {
  unpatch?.();
  unpatch = null;
}
var settings = Settings;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  onLoad,
  onUnload,
  settings
});
