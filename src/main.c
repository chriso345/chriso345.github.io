#include "opts.h"
#include "utils.h"

#define CLAY_IMPLEMENTATION
#include "../vendor/clay.h"

double windowWidth = 1024;
double windowHeight = 768;

uint32_t ACTIVE_RENDERER_INDEX = 0;

/* Fonts map to "fontsById" in index.html */
const uint32_t FONT_MONTSERRAT = 0;
const uint32_t FONT_NUNITO = 1;

// Palette
const Clay_Color COLOR_BG_LIGHT = {230, 218, 212, 255};
const Clay_Color COLOR_TEXT_LIGHT = {34, 34, 34, 255};

// Dark mode colours
const Clay_Color COLOR_BG_DARK = {25, 37, 43, 255};
const Clay_Color COLOR_TEXT_DARK = {221, 221, 221, 255};

const Clay_Color COLOR_ACCENT = {111, 173, 162, 255};
const Clay_Color COLOR_MUTED = {150, 150, 150, 255};
const Clay_Color COLOR_TRANSPARENT = {0, 0, 0, 0};

// Scratch Arena for per-frame allocations (e.g. strings, custom data)
typedef struct {
  void *memory;
  uintptr_t offset;
} Arena;
Arena frameArena = {};

bool USING_DARK_MODE = true;
static inline Clay_Color bg(void) {
  return USING_DARK_MODE ? COLOR_BG_DARK : COLOR_BG_LIGHT;
}
static inline Clay_Color text(void) {
  return USING_DARK_MODE ? COLOR_TEXT_DARK : COLOR_TEXT_LIGHT;
}

typedef struct {
  Clay_String link;
  bool cursorPointer;
  bool disablePointerEvents;
  bool invertWithDarkMode;
} CustomHTMLData;

static CustomHTMLData *AllocCustomData(CustomHTMLData d) {
  CustomHTMLData *p = (CustomHTMLData *)(frameArena.memory + frameArena.offset);
  *p = d;
  frameArena.offset += sizeof(CustomHTMLData);
  return p;
}

static Clay_String *AllocString(Clay_String s) {
  Clay_String *p = (Clay_String *)(frameArena.memory + frameArena.offset);
  *p = s;
  frameArena.offset += sizeof(Clay_String);
  return p;
}

static void SocialIcon(Clay_ElementId id, Clay_String imgPath,
                       Clay_String href) {
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

static void HeroSection(void) {
  // Centered name
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

    // Social buttons, bottom right, vertical
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

static void HandleThemeToggle(Clay_ElementId id, Clay_PointerData ptr,
                              void *ud) {
  if (ptr.state == CLAY_POINTER_DATA_PRESSED_THIS_FRAME) {
    USING_DARK_MODE = !USING_DARK_MODE;
  }
}

static void DarkModeToggle(void) {
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
           .userData = AllocCustomData((CustomHTMLData){.cursorPointer = true}),
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

static Clay_RenderCommandArray CreateLayout(void) {
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
#if SHOW_CANVAS_BORDER
           .border = {.color = COLOR_ACCENT,
                      .width = {.left = 4, .right = 4, .top = 4, .bottom = 4}},
           .cornerRadius = CLAY_CORNER_RADIUS(16),
#endif
       }) {
    HeroSection();
  }
  DarkModeToggle();

  return Clay_EndLayout(0);
}

bool debugModeEnabled = false;

CLAY_WASM_EXPORT("SetScratchMemory")
void SetScratchMemory(void *memory) { frameArena.memory = memory; }

CLAY_WASM_EXPORT("UpdateDrawFrame")
Clay_RenderCommandArray
UpdateDrawFrame(float width, float height, float mouseWheelX, float mouseWheelY,
                float mousePositionX, float mousePositionY, bool isTouchDown,
                bool isMouseDown, bool arrowKeyDownPressedThisFrame,
                bool arrowKeyUpPressedThisFrame, bool dKeyPressedThisFrame,
                float deltaTime) {
  frameArena.offset = 0;
  windowWidth = width;
  windowHeight = height;

  Clay_SetLayoutDimensions((Clay_Dimensions){width, height});

  Clay_ScrollContainerData scrollContainerData = Clay_GetScrollContainerData(
      Clay_GetElementId(CLAY_STRING("OuterScrollContainer")));
  Clay_LayoutElementHashMapItem *perfPage = Clay__GetHashMapItem(
      Clay_GetElementId(CLAY_STRING("PerformanceOuter")).id);

  if (dKeyPressedThisFrame && DEBUG_MODE_ALLOWED) {
    debugModeEnabled = !debugModeEnabled;
    Clay_SetDebugModeEnabled(debugModeEnabled);
  }
  Clay_SetCullingEnabled(ACTIVE_RENDERER_INDEX == 1);
  Clay_SetExternalScrollHandlingEnabled(ACTIVE_RENDERER_INDEX == 0);

  Clay__debugViewHighlightColor = (Clay_Color){105, 210, 231, 120};

  Clay_SetPointerState((Clay_Vector2){mousePositionX, mousePositionY},
                       isMouseDown || isTouchDown);

  Clay_UpdateScrollContainers(
      isTouchDown, (Clay_Vector2){mouseWheelX, mouseWheelY}, deltaTime);

  return CreateLayout();
}

int main(void) { return 0; }
