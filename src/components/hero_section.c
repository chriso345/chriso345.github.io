#include "../../vendor/clay.h"

#include "../theme.h"
#include "hero_section.h"
#include "social_icon.h"

void HeroSection(void) {
  CLAY(CLAY_ID("HeroName"),
       {
           .layout =
               {
                   .sizing = {CLAY_SIZING_GROW(0), CLAY_SIZING_GROW(1)},
                   .childAlignment = {CLAY_ALIGN_X_CENTER, CLAY_ALIGN_Y_CENTER},
               },
       }) {
    CLAY_TEXT(
        CLAY_STRING("Chris Oliver"),
        CLAY_TEXT_CONFIG(
            {.fontId = FONT_NUNITO, .fontSize = 96, .textColor = text()}));
    CLAY(CLAY_ID("SocialCol"),
         {
             .floating =
                 {
                     .offset = {-32, -32},
                     .zIndex = 10,
                     .attachTo = CLAY_ATTACH_TO_ROOT,
                     .attachPoints = {.element = CLAY_ATTACH_POINT_RIGHT_BOTTOM,
                                      .parent = CLAY_ATTACH_POINT_RIGHT_BOTTOM},
                 },
             .layout =
                 {
                     .layoutDirection = CLAY_TOP_TO_BOTTOM,
                     .childGap = 24,
                     .childAlignment = {CLAY_ALIGN_X_CENTER,
                                        CLAY_ALIGN_Y_BOTTOM},
                 },
         }) {
      SocialIcon(CLAY_ID("LinkedIn"), CLAY_STRING("/public/icons/linkedin.svg"),
                 CLAY_STRING("https://linkedin.com/in/chriso345"));
      SocialIcon(CLAY_ID("GitHub"), CLAY_STRING("/public/icons/github.svg"),
                 CLAY_STRING("https://github.com/chriso345"));
    }
  }
}
