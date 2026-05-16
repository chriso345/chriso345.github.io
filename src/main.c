#include "layout/layout.h"
#include "opts.h"
#include "utils.h"

#define CLAY_IMPLEMENTATION
#include "../vendor/clay.h"

double windowWidth = 1024;
double windowHeight = 768;

#include "arena.h"

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

  if (dKeyPressedThisFrame && DEBUG_MODE_ALLOWED) {
    debugModeEnabled = !debugModeEnabled;
    Clay_SetDebugModeEnabled(debugModeEnabled);
  }
  Clay_SetCullingEnabled(0);
  Clay_SetExternalScrollHandlingEnabled(1);

  Clay__debugViewHighlightColor = (Clay_Color){105, 210, 231, 120};

  Clay_SetPointerState((Clay_Vector2){mousePositionX, mousePositionY},
                       isMouseDown || isTouchDown);

  Clay_UpdateScrollContainers(
      isTouchDown, (Clay_Vector2){mouseWheelX, mouseWheelY}, deltaTime);

  return CreateLayout();
}
