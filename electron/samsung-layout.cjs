/**
 * Samsung OneUI Style Keyboard Layout Definitions for Trime (同文輸入法)
 * 完整 Samsung Galaxy OneUI 風格鍵盤套件
 */

const bopomoSamsungYaml = `name: "三星注音鍵盤"
author: "Samsung / 洋蔥"
ascii_mode: 0
reset_ascii_mode: true
width: 10
height: 56
key_text_offset_y: 4
key_symbol_offset_x: 16
key_symbol_offset_y: -18
key_hint_offset_x: 16
key_hint_offset_y: -18
keys:
  # Row 1 (11 keys: ㄅ..ㄢ + ㄦ) - 頂部數字列
  - {click: "1", label: "ㄅ", symbol: "1", hint: "1", long_click: {commit: "1"}, width: 9.09}
  - {click: "2", label: "ㄉ", symbol: "2", hint: "2", long_click: {commit: "2"}, width: 9.09}
  - {click: "3", label: "ˇ", symbol: "3", hint: "3", long_click: {commit: "3"}, width: 9.09}
  - {click: "4", label: "ˋ", symbol: "4", hint: "4", long_click: {commit: "4"}, width: 9.09}
  - {click: "5", label: "ㄓ", symbol: "5", hint: "5", long_click: {commit: "5"}, width: 9.09}
  - {click: "6", label: "ˊ", symbol: "6", hint: "6", long_click: {commit: "6"}, width: 9.09}
  - {click: "7", label: "˙", symbol: "7", hint: "7", long_click: {commit: "7"}, width: 9.09}
  - {click: "8", label: "ㄚ", symbol: "8", hint: "8", long_click: {commit: "8"}, width: 9.09}
  - {click: "9", label: "ㄞ", symbol: "9", hint: "9", long_click: {commit: "9"}, width: 9.09}
  - {click: "0", label: "ㄢ", symbol: "0", hint: "0", long_click: {commit: "0"}, width: 9.09}
  - {click: "-", label: "ㄦ", symbol: "－", hint: "－", long_click: {commit: "－"}, width: 9.1}

  # Row 2 (10 keys: ㄆ..ㄣ) - 全形中文符號
  - {click: "q", label: "ㄆ", symbol: "＋", hint: "＋", long_click: {commit: "＋"}, width: 10}
  - {click: "w", label: "ㄊ", symbol: "×", hint: "×", long_click: {commit: "×"}, width: 10}
  - {click: "e", label: "ㄍ", symbol: "÷", hint: "÷", long_click: {commit: "÷"}, width: 10}
  - {click: "r", label: "ㄐ", symbol: "＝", hint: "＝", long_click: {commit: "＝"}, width: 10}
  - {click: "t", label: "ㄔ", symbol: "／", hint: "／", long_click: {commit: "／"}, width: 10}
  - {click: "y", label: "ㄗ", symbol: "＿", hint: "＿", long_click: {commit: "＿"}, width: 10}
  - {click: "u", label: "ㄧ", symbol: "＜", hint: "＜", long_click: {commit: "＜"}, width: 10}
  - {click: "i", label: "ㄛ", symbol: "＞", hint: "＞", long_click: {commit: "＞"}, width: 10}
  - {click: "o", label: "ㄟ", symbol: "〔", hint: "〔", long_click: {commit: "〔"}, width: 10}
  - {click: "p", label: "ㄣ", symbol: "〕", hint: "〕", long_click: {commit: "〕"}, width: 10}

  # Row 3 (10 keys: ㄇ..ㄤ) - 全形中文符號
  - {click: "a", label: "ㄇ", symbol: "！", hint: "！", long_click: {commit: "！"}, width: 10}
  - {click: "s", label: "ㄋ", symbol: "＠", hint: "＠", long_click: {commit: "＠"}, width: 10}
  - {click: "d", label: "ㄎ", symbol: "＃", hint: "＃", long_click: {commit: "＃"}, width: 10}
  - {click: "f", label: "ㄑ", symbol: "＄", hint: "＄", long_click: {commit: "＄"}, width: 10}
  - {click: "g", label: "ㄕ", symbol: "％", hint: "％", long_click: {commit: "％"}, width: 10}
  - {click: "h", label: "ㄘ", symbol: "＾", hint: "＾", long_click: {commit: "＾"}, width: 10}
  - {click: "j", label: "ㄨ", symbol: "＆", hint: "＆", long_click: {commit: "＆"}, width: 10}
  - {click: "k", label: "ㄜ", symbol: "＊", hint: "＊", long_click: {commit: "＊"}, width: 10}
  - {click: "l", label: "ㄠ", symbol: "（", hint: "（", long_click: {commit: "（"}, width: 10}
  - {click: ";", label: "ㄤ", symbol: "）", hint: "）", long_click: {commit: "）"}, width: 10}

  # Row 4 (11 keys: ㄈ..ㄥ + BackSpace) - 全形中文符號
  - {click: "z", label: "ㄈ", symbol: "－", hint: "－", long_click: {commit: "－"}, width: 9.09}
  - {click: "x", label: "ㄌ", symbol: "”", hint: "”", long_click: {commit: "”"}, width: 9.09}
  - {click: "c", label: "ㄏ", symbol: "’", hint: "’", long_click: {commit: "’"}, width: 9.09}
  - {click: "v", label: "ㄒ", symbol: "：", hint: "：", long_click: {commit: "："}, width: 9.09}
  - {click: "b", label: "ㄖ", symbol: "；", hint: "；", long_click: {commit: "；"}, width: 9.09}
  - {click: "n", label: "ㄙ", symbol: "，", hint: "，", long_click: {commit: "，"}, width: 9.09}
  - {click: "m", label: "ㄩ", symbol: "？", hint: "？", long_click: {commit: "？"}, width: 9.09}
  - {click: ",", label: "ㄝ", symbol: '\\x60', hint: '\\x60', long_click: {commit: '\\x60'}, width: 9.09}
  - {click: ".", label: "ㄡ", symbol: "～", hint: "～", long_click: {commit: "～"}, width: 9.09}
  - {click: "/", label: "ㄥ", symbol: "＼", hint: "＼", long_click: {commit: "＼"}, width: 9.09}
  - {click: BackSpace, label: "⌫", width: 9.1}

  # Row 5 (7 keys: !#1, 🌐, @, 中(TW), 。, 123, 完成)
  - {click: Keyboard_symbols_1, label: "!#1", width: 12}
  - {click: Keyboard_latin, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 10}
  - click: space
    label: "中(TW)"
    double_click: commit_period
    swipe_left: Left
    swipe_right: Right
    popup: [cursor_left, commit_simplified, commit_pinyin, focus_next, commit_raw, commit_bopomo, cursor_right]
    width: 34
  - {click: "。", label: "。", popup: ["。", "，", "？", "！", "、", "～", "：", "＝", quote_bracket_corner, quote_bracket_square, quote_paren, "…"], width: 10}
  - {click: Keyboard_number, label: "123", width: 11}
  - {click: Return, label: "完成", width: 12}
`;

const latinSamsungYaml = `name: "三星英文小寫鍵盤"
author: "Samsung / 洋蔥"
ascii_mode: 1
width: 10
height: 56
key_text_offset_y: 4
key_symbol_offset_x: 16
key_symbol_offset_y: -18
key_hint_offset_x: 16
key_hint_offset_y: -18
keys:
  # Row 1 (10 keys: 1~0)
  - {click: "1", label: "1", width: 10}
  - {click: "2", label: "2", width: 10}
  - {click: "3", label: "3", width: 10}
  - {click: "4", label: "4", width: 10}
  - {click: "5", label: "5", width: 10}
  - {click: "6", label: "6", width: 10}
  - {click: "7", label: "7", width: 10}
  - {click: "8", label: "8", width: 10}
  - {click: "9", label: "9", width: 10}
  - {click: "0", label: "0", width: 10}

  # Row 2 (10 keys: q..p)
  - {click: "q", label: "q", symbol: "+", hint: "+", long_click: {commit: "+"}, width: 10}
  - {click: "w", label: "w", symbol: "×", hint: "×", long_click: {commit: "×"}, width: 10}
  - {click: "e", label: "e", symbol: "÷", hint: "÷", long_click: {commit: "÷"}, width: 10}
  - {click: "r", label: "r", symbol: "=", hint: "=", long_click: {commit: "="}, width: 10}
  - {click: "t", label: "t", symbol: "/", hint: "/", long_click: {commit: "/"}, width: 10}
  - {click: "y", label: "y", symbol: "_", hint: "_", long_click: {commit: "_"}, width: 10}
  - {click: "u", label: "u", symbol: "<", hint: "<", long_click: {commit: "<"}, width: 10}
  - {click: "i", label: "i", symbol: ">", hint: ">", long_click: {commit: ">"}, width: 10}
  - {click: "o", label: "o", symbol: "[", hint: "[", long_click: {commit: "["}, width: 10}
  - {click: "p", label: "p", symbol: "]", hint: "]", long_click: {commit: "]"}, width: 10}

  # Row 3 (9 keys: a..l 置中)
  - {click: "a", label: "a", symbol: "!", hint: "!", long_click: {commit: "!"}, width: 11.11}
  - {click: "s", label: "s", symbol: "@", hint: "@", long_click: {commit: "@"}, width: 11.11}
  - {click: "d", label: "d", symbol: "#", hint: "#", long_click: {commit: "#"}, width: 11.11}
  - {click: "f", label: "f", symbol: "$", hint: "$", long_click: {commit: "$"}, width: 11.11}
  - {click: "g", label: "g", symbol: "%", hint: "%", long_click: {commit: "%"}, width: 11.11}
  - {click: "h", label: "h", symbol: "&", hint: "&", long_click: {commit: "&"}, width: 11.11}
  - {click: "j", label: "j", symbol: "*", hint: "*", long_click: {commit: "*"}, width: 11.11}
  - {click: "k", label: "k", symbol: "(", hint: "(", long_click: {commit: "("}, width: 11.11}
  - {click: "l", label: "l", symbol: ")", hint: ")", long_click: {commit: ")"}, width: 11.12}

  # Row 4 (9 keys: Shift + z..m + BackSpace)
  - {click: Keyboard_latin_upper, long_click: Keyboard_latin_caps, label: "⇧", width: 14.5}
  - {click: "z", label: "z", symbol: "-", hint: "-", long_click: {commit: "-"}, width: 10.14}
  - {click: "x", label: "x", symbol: "'", hint: "'", long_click: {commit: "'"}, width: 10.14}
  - {click: "c", label: "c", symbol: '\\"', hint: '\\"', long_click: {commit: '\\"'}, width: 10.14}
  - {click: "v", label: "v", symbol: ":", hint: ":", long_click: {commit: ":"}, width: 10.14}
  - {click: "b", label: "b", symbol: ";", hint: ";", long_click: {commit: ";"}, width: 10.14}
  - {click: "n", label: "n", symbol: ",", hint: ",", long_click: {commit: ","}, width: 10.14}
  - {click: "m", label: "m", symbol: "?", hint: "?", long_click: {commit: "?"}, width: 10.14}
  - {click: BackSpace, label: "⌫", width: 14.5}

  # Row 5 (6 keys: !#1, 🌐, @, English (US), ., ↵)
  - {click: Keyboard_symbols_1, label: "!#1", width: 13}
  - {click: Keyboard_bopomo, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 11}
  - click: space
    label: "English (US)"
    double_click: commit_period_en
    swipe_left: Left
    swipe_right: Right
    popup: [cursor_left, commit_simplified, commit_pinyin, focus_next, commit_raw, commit_bopomo, cursor_right]
    width: 40
  - {click: ".", label: ".", popup: [".", ",", "?", "!", ".com", ".org", ".net", ".tw"], width: 11}
  - {click: Return, label: "↵", width: 14}
`;

const latinSamsungUpperYaml = `name: "三星英文大寫鍵盤"
author: "Samsung / 洋蔥"
ascii_mode: 1
width: 10
height: 56
key_text_offset_y: 4
key_symbol_offset_x: 16
key_symbol_offset_y: -18
key_hint_offset_x: 16
key_hint_offset_y: -18
keys:
  # Row 1 (10 keys: 1~0)
  - {click: "1", label: "1", width: 10}
  - {click: "2", label: "2", width: 10}
  - {click: "3", label: "3", width: 10}
  - {click: "4", label: "4", width: 10}
  - {click: "5", label: "5", width: 10}
  - {click: "6", label: "6", width: 10}
  - {click: "7", label: "7", width: 10}
  - {click: "8", label: "8", width: 10}
  - {click: "9", label: "9", width: 10}
  - {click: "0", label: "0", width: 10}

  # Row 2 (10 keys: Q..P)
  - {click: "Q", label: "Q", symbol: "+", hint: "+", long_click: {commit: "+"}, select: latin_samsung, width: 10}
  - {click: "W", label: "W", symbol: "×", hint: "×", long_click: {commit: "×"}, select: latin_samsung, width: 10}
  - {click: "E", label: "E", symbol: "÷", hint: "÷", long_click: {commit: "÷"}, select: latin_samsung, width: 10}
  - {click: "R", label: "R", symbol: "=", hint: "=", long_click: {commit: "="}, select: latin_samsung, width: 10}
  - {click: "T", label: "T", symbol: "/", hint: "/", long_click: {commit: "/"}, select: latin_samsung, width: 10}
  - {click: "Y", label: "Y", symbol: "_", hint: "_", long_click: {commit: "_"}, select: latin_samsung, width: 10}
  - {click: "U", label: "U", symbol: "<", hint: "<", long_click: {commit: "<"}, select: latin_samsung, width: 10}
  - {click: "I", label: "I", symbol: ">", hint: ">", long_click: {commit: ">"}, select: latin_samsung, width: 10}
  - {click: "O", label: "O", symbol: "[", hint: "[", long_click: {commit: "["}, select: latin_samsung, width: 10}
  - {click: "P", label: "P", symbol: "]", hint: "]", long_click: {commit: "]"}, select: latin_samsung, width: 10}

  # Row 3 (9 keys: A..L 置中)
  - {click: "A", label: "A", symbol: "!", hint: "!", long_click: {commit: "!"}, select: latin_samsung, width: 11.11}
  - {click: "S", label: "S", symbol: "@", hint: "@", long_click: {commit: "@"}, select: latin_samsung, width: 11.11}
  - {click: "D", label: "D", symbol: "#", hint: "#", long_click: {commit: "#"}, select: latin_samsung, width: 11.11}
  - {click: "F", label: "F", symbol: "$", hint: "$", long_click: {commit: "$"}, select: latin_samsung, width: 11.11}
  - {click: "G", label: "G", symbol: "%", hint: "%", long_click: {commit: "%"}, select: latin_samsung, width: 11.11}
  - {click: "H", label: "H", symbol: "&", hint: "&", long_click: {commit: "&"}, select: latin_samsung, width: 11.11}
  - {click: "J", label: "J", symbol: "*", hint: "*", long_click: {commit: "*"}, select: latin_samsung, width: 11.11}
  - {click: "K", label: "K", symbol: "(", hint: "(", long_click: {commit: "("}, select: latin_samsung, width: 11.11}
  - {click: "L", label: "L", symbol: ")", hint: ")", long_click: {commit: ")"}, select: latin_samsung, width: 11.12}

  # Row 4 (9 keys: Shift + Z..M + BackSpace)
  - {click: Keyboard_latin, long_click: Keyboard_latin_caps, label: "⇧", width: 14.5}
  - {click: "Z", label: "Z", symbol: "-", hint: "-", long_click: {commit: "-"}, select: latin_samsung, width: 10.14}
  - {click: "X", label: "X", symbol: "'", hint: "'", long_click: {commit: "'"}, select: latin_samsung, width: 10.14}
  - {click: "C", label: "C", symbol: '\\"', hint: '\\"', long_click: {commit: '\\"'}, select: latin_samsung, width: 10.14}
  - {click: "V", label: "V", symbol: ":", hint: ":", long_click: {commit: ":"}, select: latin_samsung, width: 10.14}
  - {click: "B", label: "B", symbol: ";", hint: ";", long_click: {commit: ";"}, select: latin_samsung, width: 10.14}
  - {click: "N", label: "N", symbol: ",", hint: ",", long_click: {commit: ","}, select: latin_samsung, width: 10.14}
  - {click: "M", label: "M", symbol: "?", hint: "?", long_click: {commit: "?"}, select: latin_samsung, width: 10.14}
  - {click: BackSpace, label: "⌫", width: 14.5}

  # Row 5 (6 keys: !#1, 🌐, @, English (US), ., ↵)
  - {click: Keyboard_symbols_1, label: "!#1", width: 13}
  - {click: Keyboard_bopomo, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 11}
  - click: space
    label: "English (US)"
    double_click: commit_period_en
    swipe_left: Left
    swipe_right: Right
    popup: [cursor_left, commit_simplified, commit_pinyin, focus_next, commit_raw, commit_bopomo, cursor_right]
    width: 40
  - {click: ".", label: ".", popup: [".", ",", "?", "!", ".com", ".org", ".net", ".tw"], width: 11}
  - {click: Return, label: "↵", width: 14}
`;

const latinSamsungCapsYaml = `name: "三星英文大寫鎖定鍵盤"
author: "Samsung / 洋蔥"
ascii_mode: 1
width: 10
height: 56
key_text_offset_y: 4
key_symbol_offset_x: 16
key_symbol_offset_y: -18
key_hint_offset_x: 16
key_hint_offset_y: -18
keys:
  # Row 1 (10 keys: 1~0)
  - {click: "1", label: "1", width: 10}
  - {click: "2", label: "2", width: 10}
  - {click: "3", label: "3", width: 10}
  - {click: "4", label: "4", width: 10}
  - {click: "5", label: "5", width: 10}
  - {click: "6", label: "6", width: 10}
  - {click: "7", label: "7", width: 10}
  - {click: "8", label: "8", width: 10}
  - {click: "9", label: "9", width: 10}
  - {click: "0", label: "0", width: 10}

  # Row 2 (10 keys: Q..P)
  - {click: "Q", label: "Q", symbol: "+", hint: "+", long_click: {commit: "+"}, width: 10}
  - {click: "W", label: "W", symbol: "×", hint: "×", long_click: {commit: "×"}, width: 10}
  - {click: "E", label: "E", symbol: "÷", hint: "÷", long_click: {commit: "÷"}, width: 10}
  - {click: "R", label: "R", symbol: "=", hint: "=", long_click: {commit: "="}, width: 10}
  - {click: "T", label: "T", symbol: "/", hint: "/", long_click: {commit: "/"}, width: 10}
  - {click: "Y", label: "Y", symbol: "_", hint: "_", long_click: {commit: "_"}, width: 10}
  - {click: "U", label: "U", symbol: "<", hint: "<", long_click: {commit: "<"}, width: 10}
  - {click: "I", label: "I", symbol: ">", hint: ">", long_click: {commit: ">"}, width: 10}
  - {click: "O", label: "O", symbol: "[", hint: "[", long_click: {commit: "["}, width: 10}
  - {click: "P", label: "P", symbol: "]", hint: "]", long_click: {commit: "]"}, width: 10}

  # Row 3 (9 keys: A..L 置中)
  - {click: "A", label: "A", symbol: "!", hint: "!", long_click: {commit: "!"}, width: 11.11}
  - {click: "S", label: "S", symbol: "@", hint: "@", long_click: {commit: "@"}, width: 11.11}
  - {click: "D", label: "D", symbol: "#", hint: "#", long_click: {commit: "#"}, width: 11.11}
  - {click: "F", label: "F", symbol: "$", hint: "$", long_click: {commit: "$"}, width: 11.11}
  - {click: "G", label: "G", symbol: "%", hint: "%", long_click: {commit: "%"}, width: 11.11}
  - {click: "H", label: "H", symbol: "&", hint: "&", long_click: {commit: "&"}, width: 11.11}
  - {click: "J", label: "J", symbol: "*", hint: "*", long_click: {commit: "*"}, width: 11.11}
  - {click: "K", label: "K", symbol: "(", hint: "(", long_click: {commit: "("}, width: 11.11}
  - {click: "L", label: "L", symbol: ")", hint: ")", long_click: {commit: ")"}, width: 11.12}

  # Row 4 (9 keys: 藍色鎖定Shift + Z..M + BackSpace)
  - {click: Keyboard_latin, label: "⇧", text_color: "0xff2196f3", width: 14.5}
  - {click: "Z", label: "Z", symbol: "-", hint: "-", long_click: {commit: "-"}, width: 10.14}
  - {click: "X", label: "X", symbol: "'", hint: "'", long_click: {commit: "'"}, width: 10.14}
  - {click: "C", label: "C", symbol: '\\"', hint: '\\"', long_click: {commit: '\\"'}, width: 10.14}
  - {click: "V", label: "V", symbol: ":", hint: ":", long_click: {commit: ":"}, width: 10.14}
  - {click: "B", label: "B", symbol: ";", hint: ";", long_click: {commit: ";"}, width: 10.14}
  - {click: "N", label: "N", symbol: ",", hint: ",", long_click: {commit: ","}, width: 10.14}
  - {click: "M", label: "M", symbol: "?", hint: "?", long_click: {commit: "?"}, width: 10.14}
  - {click: BackSpace, label: "⌫", width: 14.5}

  # Row 5 (6 keys: !#1, 🌐, @, English (US), ., ↵)
  - {click: Keyboard_symbols_1, label: "!#1", width: 13}
  - {click: Keyboard_bopomo, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 11}
  - click: space
    label: "English (US)"
    double_click: commit_period_en
    swipe_left: Left
    swipe_right: Right
    popup: [cursor_left, commit_simplified, commit_pinyin, focus_next, commit_raw, commit_bopomo, cursor_right]
    width: 40
  - {click: ".", label: ".", popup: [".", ",", "?", "!", ".com", ".org", ".net", ".tw"], width: 11}
  - {click: Return, label: "↵", width: 14}
`;

const numberSamsungYaml = `name: "三星數字鍵盤"
author: "Samsung / 洋蔥"
ascii_mode: 1
width: 20
height: 56
keys:
  # Row 1 (1 2 3 - +)
  - {click: "1", label: "1", width: 20}
  - {click: "2", label: "2", width: 20}
  - {click: "3", label: "3", width: 20}
  - {click: "-", label: "-", width: 20}
  - {click: "+", label: "+", width: 20}

  # Row 2 (4 5 6 * /)
  - {click: "4", label: "4", width: 20}
  - {click: "5", label: "5", width: 20}
  - {click: "6", label: "6", width: 20}
  - {click: "*", label: "*", width: 20}
  - {click: "/", label: "/", width: 20}

  # Row 3 (7 8 9 = %)
  - {click: "7", label: "7", width: 20}
  - {click: "8", label: "8", width: 20}
  - {click: "9", label: "9", width: 20}
  - {click: "=", label: "=", width: 20}
  - {click: "%", label: "%", width: 20}

  # Row 4 (0 . , ⌫ ↵)
  - {click: Keyboard_bopomo, label: "中文", width: 20}
  - {click: "0", label: "0", width: 20}
  - {click: ".", label: ".", width: 20}
  - {click: BackSpace, label: "⌫", width: 20}
  - {click: Return, label: "↵", width: 20}
`;

const symbolsSamsung1Yaml = `name: "三星符號鍵盤 1/2"
author: "Samsung / 洋蔥"
width: 10
height: 56
keys:
  # Row 1 (1 2 3 4 5 6 7 8 9 0)
  - {click: "1", label: "1", width: 10}
  - {click: "2", label: "2", width: 10}
  - {click: "3", label: "3", width: 10}
  - {click: "4", label: "4", width: 10}
  - {click: "5", label: "5", width: 10}
  - {click: "6", label: "6", width: 10}
  - {click: "7", label: "7", width: 10}
  - {click: "8", label: "8", width: 10}
  - {click: "9", label: "9", width: 10}
  - {click: "0", label: "0", width: 10}

  # Row 2 (+ × ÷ = / _ < > [ ])
  - {click: "+", label: "+", width: 10}
  - {click: "×", label: "×", width: 10}
  - {click: "÷", label: "÷", width: 10}
  - {click: "=", label: "=", width: 10}
  - {click: "/", label: "/", width: 10}
  - {click: "_", label: "_", width: 10}
  - {click: "<", label: "<", width: 10}
  - {click: ">", label: ">", width: 10}
  - {click: "[", label: "[", width: 10}
  - {click: "]", label: "]", width: 10}

  # Row 3 (! @ # $ % ^ & * ( ))
  - {click: "!", label: "!", width: 10}
  - {click: "@", label: "@", width: 10}
  - {click: "#", label: "#", width: 10}
  - {click: "$", label: "$", width: 10}
  - {click: "%", label: "%", width: 10}
  - {click: "^", label: "^", width: 10}
  - {click: "&", label: "&", width: 10}
  - {click: "*", label: "*", width: 10}
  - {click: "(", label: "(", width: 10}
  - {click: ")", label: ")", width: 10}

  # Row 4 (1/2, - ' \\" : ; , ? ⌫)
  - {click: Keyboard_symbols_2, label: "1/2", width: 14}
  - {click: "-", label: "-", width: 10.28}
  - {click: "'", label: "'", width: 10.28}
  - {click: '\\"', label: '\\"', width: 10.28}
  - {click: ":", label: ":", width: 10.28}
  - {click: ";", label: ";", width: 10.28}
  - {click: ",", label: ",", width: 10.28}
  - {click: "?", label: "?", width: 10.32}
  - {click: BackSpace, label: "⌫", width: 14}

  # Row 5 (中文, 🌐, @, 中(TW), 。, 123, ↵)
  - {click: Keyboard_bopomo, label: "中文", width: 13}
  - {click: Keyboard_latin, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 10}
  - {click: space, label: "中(TW)", width: 32}
  - {click: "。", label: "。", width: 10}
  - {click: Keyboard_number, label: "123", width: 12}
  - {click: Return, label: "↵", width: 12}
`;

const symbolsSamsung2Yaml = `name: "三星符號鍵盤 2/2"
author: "Samsung / 洋蔥"
width: 10
height: 56
keys:
  # Row 1 (~ \` | • √ π ÷ × § Δ)
  - {click: "~", label: "~", width: 10}
  - {click: "\`", label: "\`", width: 10}
  - {click: "|", label: "|", width: 10}
  - {click: "•", label: "•", width: 10}
  - {click: "√", label: "√", width: 10}
  - {click: "π", label: "π", width: 10}
  - {click: "÷", label: "÷", width: 10}
  - {click: "×", label: "×", width: 10}
  - {click: "§", label: "§", width: 10}
  - {click: "Δ", label: "Δ", width: 10}

  # Row 2 (£ ¢ € ¥ ^ ° = { } \\)
  - {click: "£", label: "£", width: 10}
  - {click: "¢", label: "¢", width: 10}
  - {click: "€", label: "€", width: 10}
  - {click: "¥", label: "¥", width: 10}
  - {click: "^", label: "^", width: 10}
  - {click: "°", label: "°", width: 10}
  - {click: "=", label: "=", width: 10}
  - {click: "{", label: "{", width: 10}
  - {click: "}", label: "}", width: 10}
  - {click: "\\\\", label: "\\\\", width: 10}

  # Row 3 (% © ® ™ ✓ [ ] ■ ♠ ♡ ◇ ♧)
  - {click: "%", label: "%", width: 10}
  - {click: "©", label: "©", width: 10}
  - {click: "®", label: "®", width: 10}
  - {click: "™", label: "™", width: 10}
  - {click: "✓", label: "✓", width: 10}
  - {click: "■", label: "■", width: 10}
  - {click: "♠", label: "♠", width: 10}
  - {click: "♡", label: "♡", width: 10}
  - {click: "◇", label: "◇", width: 10}
  - {click: "♧", label: "♧", width: 10}

  # Row 4 (2/2, ☆ ▪ ¤ 〈 〉 …… ., ⌫)
  - {click: Keyboard_symbols_1, label: "2/2", width: 14}
  - {click: "☆", label: "☆", width: 10.28}
  - {click: "▪", label: "▪", width: 10.28}
  - {click: "¤", label: "¤", width: 10.28}
  - {click: "〈", label: "〈", width: 10.28}
  - {click: "〉", label: "〉", width: 10.28}
  - {click: "……", label: "……", width: 10.28}
  - {click: ".", label: ".", width: 10.32}
  - {click: BackSpace, label: "⌫", width: 14}

  # Row 5 (中文, 🌐, @, 中(TW), 。, 123, ↵)
  - {click: Keyboard_bopomo, label: "中文", width: 13}
  - {click: Keyboard_latin, label: "🌐", width: 11}
  - {click: "@", label: "@", popup: ["@", "#", "$", "%", "—", "+", "-", "*", "/", "_"], width: 10}
  - {click: space, label: "中(TW)", width: 32}
  - {click: "。", label: "。", width: 10}
  - {click: Keyboard_number, label: "123", width: 12}
  - {click: Return, label: "↵", width: 12}
`;

const cursorSamsungYaml = `name: "三星游標控制鍵盤"
author: "Samsung / 洋蔥"
width: 20
height: 56
keys:
  # Row 1 (選取模式、行首、行尾、退格)
  - {click: Home, label: "行首", width: 25}
  - {click: Up, label: "▲ 上", repeatable: true, width: 25}
  - {click: End, label: "行尾", width: 25}
  - {click: BackSpace, label: "⌫", repeatable: true, width: 25}

  # Row 2 (左、中心確定、右)
  - {click: Left, label: "◀ 左", repeatable: true, width: 33.33}
  - {click: Keyboard_bopomo, label: "👆 游標控制", width: 33.34}
  - {click: Right, label: "右 ▶", repeatable: true, width: 33.33}

  # Row 3 (下、全選、複製、貼上)
  - {click: "Control+a", label: "全選", width: 25}
  - {click: Down, label: "▼ 下", repeatable: true, width: 25}
  - {click: "Control+c", label: "複製", width: 25}
  - {click: "Control+v", label: "貼上", width: 25}

  # Row 4 (返回中文、空白、換行)
  - {click: Keyboard_bopomo, label: "返回中文", width: 35}
  - {click: space, label: "空白", width: 35}
  - {click: Return, label: "↵ 完成", width: 30}
`;

function indent(yamlStr, spaces = 4) {
  const pad = ' '.repeat(spaces);
  return yamlStr.trim().split('\n').map(l => pad + l).join('\n');
}

function getSamsungTrimeCustomYaml() {
  return `# Trime 同文輸入法 洋蔥注音客製設定 (全套三星風格旗艦版)
patch:
  "style/reset_ascii_mode": true
  "style/key_text_size": 19
  "style/symbol_text_size": 9
  "style/key_long_text_size": 9
  "style/key_text_offset_y": 4
  "style/key_symbol_offset_x": 16
  "style/key_symbol_offset_y": -18
  "style/key_hint_offset_x": 16
  "style/key_hint_offset_y": -18
  "style/candidate_view_height": 48
  "style/keyboard": bopomo_samsung
  "style/latin_keyboard": latin_samsung
  "style/keyboards":
    - bopomo_samsung
    - bopomo_onion
    - latin_samsung
    - latin_samsung_upper
    - latin_samsung_caps
    - number_samsung
    - symbols_samsung_1
    - symbols_samsung_2
    - cursor_samsung
    - default
    - latin
    - number
    - symbols

  # 鍵盤切換與快捷動作定義
  "preset_keys/Keyboard_bopomo":
    label: "中文"
    functional: true
    send: Eisu_toggle
    select: bopomo_samsung
  "preset_keys/Keyboard_latin":
    label: "🌐"
    functional: true
    send: Eisu_toggle
    select: latin_samsung
  "preset_keys/Keyboard_latin_upper":
    label: "⇧"
    functional: true
    send: Eisu_toggle
    select: latin_samsung_upper
  "preset_keys/Keyboard_latin_caps":
    label: "⇧"
    functional: true
    send: Eisu_toggle
    select: latin_samsung_caps
  "preset_keys/Keyboard_number":
    label: "123"
    functional: true
    send: Eisu_toggle
    select: number_samsung
  "preset_keys/Keyboard_symbols_1":
    label: "!#1"
    functional: true
    send: Eisu_toggle
    select: symbols_samsung_1
  "preset_keys/Keyboard_symbols_2":
    label: "1/2"
    functional: true
    send: Eisu_toggle
    select: symbols_samsung_2
  "preset_keys/Keyboard_cursor":
    label: "游標控制"
    functional: true
    send: Eisu_toggle
    select: cursor_samsung
  "preset_keys/commit_period":
    label: "。"
    commit: "。"
  "preset_keys/commit_period_en":
    label: "."
    commit: "."
  "preset_keys/quote_bracket_corner":
    label: "〔"
    text: "〔〕{Left}"
  "preset_keys/quote_bracket_square":
    label: "「"
    text: "「」{Left}"
  "preset_keys/quote_paren":
    label: "（"
    text: "（）{Left}"
  "preset_keys/focus_next":
    label: "►"
    send: Down
  "preset_keys/cursor_left":
    label: "◀"
    send: Left
  "preset_keys/cursor_right":
    label: "▶"
    send: Right
  "preset_keys/commit_simplified":
    label: "简"
    send: "Control+Right"
  "preset_keys/commit_pinyin":
    label: "拼"
    send: "Control+Left"
  "preset_keys/commit_raw":
    label: "ㄅ"
    send: "Control+Up"
  "preset_keys/commit_bopomo":
    label: "注"
    send: "Shift+Right"

  # 鍵盤佈局註冊
  "preset_keyboards/bopomo_samsung":
${indent(bopomoSamsungYaml)}
  "preset_keyboards/bopomo_onion":
${indent(bopomoSamsungYaml)}
  "preset_keyboards/latin_samsung":
${indent(latinSamsungYaml)}
  "preset_keyboards/latin_samsung_upper":
${indent(latinSamsungUpperYaml)}
  "preset_keyboards/latin_samsung_caps":
${indent(latinSamsungCapsYaml)}
  "preset_keyboards/number_samsung":
${indent(numberSamsungYaml)}
  "preset_keyboards/symbols_samsung_1":
${indent(symbolsSamsung1Yaml)}
  "preset_keyboards/symbols_samsung_2":
${indent(symbolsSamsung2Yaml)}
  "preset_keyboards/cursor_samsung":
${indent(cursorSamsungYaml)}
  "preset_keyboards/default":
${indent(bopomoSamsungYaml)}
`;
}

function getSamsungBopomoCustomYaml() {
  return `# 洋蔥注音 Trime 專用鍵盤指定與空白鍵選字
patch:
  "style/reset_ascii_mode": true
  "style/keyboard": bopomo_samsung
  "style/keyboards":
    - bopomo_samsung
    - bopomo_onion
    - latin_samsung
    - latin_samsung_upper
    - latin_samsung_caps
    - number_samsung
    - symbols_samsung_1
    - symbols_samsung_2
    - cursor_samsung
    - default
    - latin
    - number
    - symbols
  # 候選字開啟時按空白鍵直接跳下一個字
  "key_binder/bindings/@before 0":
    accept: space
    send: Down
    when: has_menu
`;
}

function getSamsungInstructions() {
  return `================================================================
🧅 洋蔥注音 Android 同文輸入法 (Trime) 三星風格旗艦匯入包
================================================================

【特色亮點】
1. 📍 鍵盤右上角標小字：
   - 採用三星標準坐標，所有按鍵右上角小字端正顯現。

2. 🔣 長按「。」三行標點陣列（智慧括號游標置中）：
   - 第一行（頂部）： （  〔  「  …
   - 第二行（中間）： ：  、  ～  ＝
   - 第三行（底部）： ？  。  ，  ！
   - 選「〔」輸出「〔〕」，游標自動停在中間！
   - 選「「」輸出「「」」，游標自動停在中間！
   - 選「（」輸出「（）」，游標自動停在中間！

3. 📧 快速符號「@」鍵：
   - 短按輸出「@」，長按彈出常用符號選單：
     _  *  +  -  /
     —  $  @  #  %

4. 👆 空白鍵完美整合選字與游標左右移動：
   - 長按空白鍵浮動選單：[ ◀  简  拼  ►  ㄅ  注  ▶ ]
   - 沒打字時：往左滑選「◀」游標向左，往右滑選「▶」游標向右！
   - 打字有候選字時：中央的「►」即為高亮移動下一個字！並保留原本的「简 拼 ㄅ 注」功能。
   - 亦可在空白鍵上直接向左滑動、向右滑動快速移動游標。
   - 點擊空白鍵：打字時直接選跳下一個候選字。

================================================================
【手機安裝步驟】
1. 打開手機檔案管理員，進入 Trime 目錄：
   /storage/emulated/0/Android/data/com.osfans.trime/files/rime/
   （部分手機可能在 /sdcard/rime/）

2. ⚠️【關鍵步驟】
   - 請將手機該目錄下的「build」資料夾整包刪除（清除舊快取）！
   - 若有「default.yaml」，請刪除（只保留 default.custom.yaml）。

3. 將此 ZIP 內的 rime 資料夾中的所有檔案複製並覆蓋至手機上述目錄。

4. 打開同文輸入法 (Trime) App，點選「重新部署」（Deploy），等待提示完成。

5. 部署完成後點擊任一輸入框即可開始享受！
================================================================
`;
}

function getSamsungFilesMap() {
  const trimeCustom = getSamsungTrimeCustomYaml();
  return {
    'rime/bopomo_samsung.yaml': bopomoSamsungYaml,
    'rime/bopomo_onion.yaml': bopomoSamsungYaml,
    'rime/latin_samsung.yaml': latinSamsungYaml,
    'rime/latin_samsung_upper.yaml': latinSamsungUpperYaml,
    'rime/latin_samsung_caps.yaml': latinSamsungCapsYaml,
    'rime/number_samsung.yaml': numberSamsungYaml,
    'rime/symbols_samsung_1.yaml': symbolsSamsung1Yaml,
    'rime/symbols_samsung_2.yaml': symbolsSamsung2Yaml,
    'rime/cursor_samsung.yaml': cursorSamsungYaml,
    'rime/trime.custom.yaml': trimeCustom,
    'rime/tongwenfeng.trime.custom.yaml': trimeCustom,
    'rime/tongwenfeng.custom.yaml': trimeCustom,
    'rime/bopomo_onion.custom.yaml': getSamsungBopomoCustomYaml(),
    'rime/Android手機Trime安裝說明.txt': getSamsungInstructions(),
    'Android手機Trime安裝說明.txt': getSamsungInstructions(),
  };
}

module.exports = {
  bopomoSamsungYaml,
  latinSamsungYaml,
  latinSamsungUpperYaml,
  latinSamsungCapsYaml,
  numberSamsungYaml,
  symbolsSamsung1Yaml,
  symbolsSamsung2Yaml,
  cursorSamsungYaml,
  getSamsungTrimeCustomYaml,
  getSamsungBopomoCustomYaml,
  getSamsungInstructions,
  getSamsungFilesMap
};
