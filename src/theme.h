#ifndef THEME_H
#define THEME_H

#include <stdint.h>

#include "../vendor/clay.h"

extern const uint32_t FONT_MONTSERRAT;
extern const uint32_t FONT_NUNITO;

extern const Clay_Color COLOR_BG_LIGHT;
extern const Clay_Color COLOR_TEXT_LIGHT;
extern const Clay_Color COLOR_BG_DARK;
extern const Clay_Color COLOR_TEXT_DARK;
extern const Clay_Color COLOR_ACCENT;
extern const Clay_Color COLOR_MUTED;
extern const Clay_Color COLOR_TRANSPARENT;

extern bool USING_DARK_MODE;
Clay_Color bg(void);
Clay_Color text(void);

#endif // THEME_H
