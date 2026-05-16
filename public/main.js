import {
    getStructTotalSize,
    readStructAtAddress,
    getTextDimensions,
    MemoryIsDifferent,
    SetElementBackgroundColorAndRadius,
    renderCommandDefinition,
    customHTMLDataDefinition,
    stringDefinition,
} from './html-utils.js'
import { wasmInit } from './wasm-init.js'
import { renderLoopHTML } from './render-loop.js'

const CLAY_RENDER_COMMAND_TYPE_NONE = 0
const CLAY_RENDER_COMMAND_TYPE_RECTANGLE = 1
const CLAY_RENDER_COMMAND_TYPE_BORDER = 2
const CLAY_RENDER_COMMAND_TYPE_TEXT = 3
const CLAY_RENDER_COMMAND_TYPE_IMAGE = 4
const CLAY_RENDER_COMMAND_TYPE_SCISSOR_START = 5
const CLAY_RENDER_COMMAND_TYPE_SCISSOR_END = 6
const CLAY_RENDER_COMMAND_TYPE_CUSTOM = 7
const GLOBAL_FONT_SCALING_FACTOR = 0.8
let fontsById = [
    'Montserrat', // FONT_MONTSERRAT = 0
    'Nunito', // FONT_NUNITO     = 1
]

let previousFrameTime
let wasmState

function onWasmReady(state) {
    wasmState = state
    previousFrameTime = performance.now()
    requestAnimationFrame(mainRenderLoop)
}

function mainRenderLoop(currentTime) {
    const elapsed = currentTime - previousFrameTime
    previousFrameTime = currentTime
    wasmState.instance.exports.UpdateDrawFrame(
        wasmState.scratchSpaceAddress,
        window.innerWidth,
        window.innerHeight,
        0,
        0,
        window.mousePositionXThisFrame,
        window.mousePositionYThisFrame,
        window.touchDown,
        window.mouseDown,
        0,
        0,
        window.dKeyPressedThisFrame,
        elapsed / 1000
    )
    renderLoopHTML({
        ...wasmState,
        fontsById,
        GLOBAL_FONT_SCALING_FACTOR,
    })
    requestAnimationFrame(mainRenderLoop)
    window.mouseDownThisFrame = false
    window.arrowKeyUpPressedThisFrame = false
    window.arrowKeyDownPressedThisFrame = false
    window.dKeyPressedThisFrame = false
}

window.getStructTotalSize = getStructTotalSize
window.readStructAtAddress = readStructAtAddress
window.getTextDimensions = getTextDimensions
window.MemoryIsDifferent = MemoryIsDifferent
window.SetElementBackgroundColorAndRadius = SetElementBackgroundColorAndRadius
window.renderCommandDefinition = renderCommandDefinition
window.customHTMLDataDefinition = customHTMLDataDefinition
window.stringDefinition = stringDefinition
window.CLAY_RENDER_COMMAND_TYPE_NONE = CLAY_RENDER_COMMAND_TYPE_NONE
window.CLAY_RENDER_COMMAND_TYPE_RECTANGLE = CLAY_RENDER_COMMAND_TYPE_RECTANGLE
window.CLAY_RENDER_COMMAND_TYPE_BORDER = CLAY_RENDER_COMMAND_TYPE_BORDER
window.CLAY_RENDER_COMMAND_TYPE_TEXT = CLAY_RENDER_COMMAND_TYPE_TEXT
window.CLAY_RENDER_COMMAND_TYPE_IMAGE = CLAY_RENDER_COMMAND_TYPE_IMAGE
window.CLAY_RENDER_COMMAND_TYPE_SCISSOR_START =
    CLAY_RENDER_COMMAND_TYPE_SCISSOR_START
window.CLAY_RENDER_COMMAND_TYPE_SCISSOR_END =
    CLAY_RENDER_COMMAND_TYPE_SCISSOR_END
window.CLAY_RENDER_COMMAND_TYPE_CUSTOM = CLAY_RENDER_COMMAND_TYPE_CUSTOM
window.GLOBAL_FONT_SCALING_FACTOR = GLOBAL_FONT_SCALING_FACTOR
window.fontsById = fontsById

wasmInit(fontsById, GLOBAL_FONT_SCALING_FACTOR, onWasmReady)
