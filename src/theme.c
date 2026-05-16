#include "../vendor/clay.h"

#include "theme.h"

const uint32_t FONT_MONTSERRAT = 0;
const uint32_t FONT_NUNITO = 1;

const Clay_Color COLOR_BG_LIGHT = {230, 218, 212, 255};
const Clay_Color COLOR_TEXT_LIGHT = {34, 34, 34, 255};
const Clay_Color COLOR_BG_DARK = {25, 37, 43, 255};
const Clay_Color COLOR_TEXT_DARK = {221, 221, 221, 255};
const Clay_Color COLOR_ACCENT = {111, 173, 162, 255};
const Clay_Color COLOR_MUTED = {150, 150, 150, 255};
const Clay_Color COLOR_TRANSPARENT = {0, 0, 0, 0};

bool USING_DARK_MODE = true;
Clay_Color bg(void) { return USING_DARK_MODE ? COLOR_BG_DARK : COLOR_BG_LIGHT; }
Clay_Color text(void) {
  return USING_DARK_MODE ? COLOR_TEXT_DARK : COLOR_TEXT_LIGHT;
}
