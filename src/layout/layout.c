#include "../../vendor/clay.h"

#include "../components/dark_mode_toggle.h"
#include "../components/hero_section.h"
#include "../theme.h"
#include "layout.h"

Clay_RenderCommandArray CreateLayout(void) {
  Clay_BeginLayout();
  CLAY(CLAY_ID("Root"),
       {
           .layout =
               {
                   .layoutDirection = CLAY_TOP_TO_BOTTOM,
                   .sizing = {CLAY_SIZING_GROW(0), CLAY_SIZING_GROW(0)},
                   .childAlignment = {CLAY_ALIGN_X_CENTER, CLAY_ALIGN_Y_CENTER},
               },
           .backgroundColor = bg(),
       }) {
    HeroSection();
  }
  DarkModeToggle();
  return Clay_EndLayout(0);
}
