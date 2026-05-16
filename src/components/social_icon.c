#include "../../vendor/clay.h"

#include "../arena.h"
#include "../utils.h"
#include "social_icon.h"

typedef struct {
  Clay_String link;
  bool cursorPointer;
  bool disablePointerEvents;
  bool invertWithDarkMode;
} CustomHTMLData;

static CustomHTMLData *AllocCustomData(CustomHTMLData d) {
  CustomHTMLData *p =
      (CustomHTMLData *)((char *)frameArena.memory + frameArena.offset);
  *p = d;
  frameArena.offset += sizeof(CustomHTMLData);
  return p;
}

static Clay_String *AllocString(Clay_String s) {
  Clay_String *p =
      (Clay_String *)((char *)frameArena.memory + frameArena.offset);
  *p = s;
  frameArena.offset += sizeof(Clay_String);
  return p;
}

void SocialIcon(Clay_ElementId id, Clay_String imgPath, Clay_String href) {
  CLAY(id,
       {
           .layout = {.sizing = {CLAY_SIZING_FIXED(28), CLAY_SIZING_FIXED(28)}},
           .aspectRatio = {1},
           .image = {.imageData = AllocString(imgPath)},
           .userData =
               AllocCustomData((CustomHTMLData){.link = href,
                                                .cursorPointer = true,
                                                .disablePointerEvents = false,
                                                .invertWithDarkMode = true}),
       }) {}
}
