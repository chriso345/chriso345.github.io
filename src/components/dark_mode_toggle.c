#include "../../vendor/clay.h"

#include "../theme.h"
#include "../utils.h"
#include "dark_mode_toggle.h"

static void HandleThemeToggle(Clay_ElementId id, Clay_PointerData ptr,
                              void *ud) {
  if (ptr.state == CLAY_POINTER_DATA_PRESSED_THIS_FRAME) {
    JS_LOG("Toggling dark mode");
    USING_DARK_MODE = !USING_DARK_MODE;
  }
}

void DarkModeToggle(void) {
  Clay_Color toggleBg = USING_DARK_MODE ? (Clay_Color){240, 213, 137, 255}
                                        : (Clay_Color){61, 26, 5, 80};
  CLAY(CLAY_ID("ToggleOuter"),
       {
           .floating =
               {
                   .offset = {20, 20},
                   .zIndex = 10,
                   .attachTo = CLAY_ATTACH_TO_ROOT,
                   .attachPoints = {.element = CLAY_ATTACH_POINT_LEFT_TOP,
                                    .parent = CLAY_ATTACH_POINT_LEFT_TOP},
               },
           .layout =
               {
                   .sizing = {CLAY_SIZING_FIXED(52), CLAY_SIZING_FIXED(28)},
                   .padding = {4, 4, 4, 4},
                   .childAlignment = {.y = CLAY_ALIGN_Y_CENTER},
               },
           .backgroundColor = toggleBg,
           .cornerRadius = CLAY_CORNER_RADIUS(14),
           .userData = NULL,
       }) {
    Clay_Color thumbColor = USING_DARK_MODE ? COLOR_BG_DARK : COLOR_BG_LIGHT;
    CLAY(CLAY_ID("ToggleThumb"),
         {
             .layout =
                 {
                     .sizing = {CLAY_SIZING_FIXED(20), CLAY_SIZING_FIXED(20)},
                 },
             .backgroundColor = thumbColor,
             .cornerRadius = CLAY_CORNER_RADIUS(10),
             .floating =
                 {
                     .offset = {USING_DARK_MODE ? 24.0f : 4.0f, 4.0f},
                     .zIndex = 11,
                     .attachTo = CLAY_ATTACH_TO_PARENT,
                     .attachPoints = {.element = CLAY_ATTACH_POINT_LEFT_TOP,
                                      .parent = CLAY_ATTACH_POINT_LEFT_TOP},
                 },
         }) {
      Clay_OnHover(HandleThemeToggle, NULL);
    }
    Clay_OnHover(HandleThemeToggle, NULL);
  }
}
