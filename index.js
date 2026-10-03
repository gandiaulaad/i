/**
 * @name Apple Emojis
 * @description Replaces Discord default emojis with Apple iOS emojis.
 * @author gandiaulaad
 * @version 1.0.0
 */

import { metro, patcher } from "revenge";

let unpatches = [];

export default {
  start() {
    try {
      const EmojiUtils = metro.findByProps("getURL", "getEmojiURL") || metro.findByProps("getEmojiURL");

      if (EmojiUtils && EmojiUtils.getEmojiURL) {
        const unpatch = patcher.instead("apple-emojis-patch", EmojiUtils, "getEmojiURL", (args, orig) => {
          const emoji = args[0];

          if (!emoji?.id && emoji?.surrogates) {
            const codePoint = Array.from(emoji.surrogates)
              .map(char => char.codePointAt(0).toString(16))
              .filter(code => code !== "fe0f")
              .join("-");

            // Apple emoji high-res mirror CDN
            return `https://raw.githubusercontent.com/samuelngs/apple-emoji-linux/master/png/160/${codePoint}.png`;
          }

          return orig(...args);
        });

        unpatches.push(unpatch);
      }
    } catch (err) {
      console.error("[Apple Emojis] Error:", err);
    }
  },

  stop() {
    for (const unpatch of unpatches) {
      if (typeof unpatch === "function") unpatch();
    }
    unpatches = [];
  }
};
