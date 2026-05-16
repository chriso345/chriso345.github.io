import {
    getStructTotalSize,
    readStructAtAddress,
    getTextDimensions,
    stringDefinition,
    textConfigDefinition,
    renderCommandDefinition,
    customHTMLDataDefinition,
} from './html-utils.js'

export async function wasmInit(
    fontsById,
    GLOBAL_FONT_SCALING_FACTOR,
    onWasmReady
) {
    await Promise.all(fontsById.map((f) => document.fonts.load(`12px "${f}"`)))
    const measureCanvas = document.createElement('canvas')
    window.canvasContext = measureCanvas.getContext('2d')
    window.htmlRoot = document.body.appendChild(document.createElement('div'))
    window.mousePositionXThisFrame = 0
    window.mousePositionYThisFrame = 0
    window.mouseWheelXThisFrame = 0
    window.mouseWheelYThisFrame = 0
    window.touchDown = false
    window.arrowKeyDownPressedThisFrame = false
    window.arrowKeyUpPressedThisFrame = false
    let zeroTimeout = null
    document.addEventListener('wheel', (event) => {
        window.mouseWheelXThisFrame = event.deltaX * -0.1
        window.mouseWheelYThisFrame = event.deltaY * -0.1
        clearTimeout(zeroTimeout)
        zeroTimeout = setTimeout(() => {
            window.mouseWheelXThisFrame = 0
            window.mouseWheelYThisFrame = 0
        }, 10)
    })

    let textDecoder = new TextDecoder('utf-8')
    let previousFrameTime
    let renderCommandSize = 0
    let scratchSpaceAddress = 8
    let heapSpaceAddress = 0
    let memoryDataView
    let elementCache = {}
    let imageCache = {}
    let instance

    function createMainArena(arenaStructAddress, arenaMemoryAddress) {
        let memorySize = instance.exports.Clay_MinMemorySize()
        instance.exports.Clay_CreateArenaWithCapacityAndMemory(
            arenaStructAddress,
            memorySize,
            arenaMemoryAddress
        )
    }

    const importObject = {
        clay: {
            measureTextFunction: (
                addressOfDimensions,
                textToMeasure,
                addressOfConfig,
                userData
            ) => {
                let stringLength = memoryDataView.getUint32(textToMeasure, true)
                let pointerToString = memoryDataView.getUint32(
                    textToMeasure + 4,
                    true
                )
                let textConfig = readStructAtAddress(
                    addressOfConfig,
                    textConfigDefinition,
                    memoryDataView
                )
                let text = textDecoder.decode(
                    new Uint8Array(
                        memoryDataView.buffer.slice(
                            pointerToString,
                            pointerToString + stringLength
                        )
                    )
                )
                let sourceDimensions = getTextDimensions(
                    text,
                    `${Math.round(textConfig.fontSize.value * GLOBAL_FONT_SCALING_FACTOR)}px ${fontsById[textConfig.fontId.value]}`
                )
                memoryDataView.setFloat32(
                    addressOfDimensions,
                    sourceDimensions.width,
                    true
                )
                memoryDataView.setFloat32(
                    addressOfDimensions + 4,
                    sourceDimensions.height,
                    true
                )
            },
            queryScrollOffsetFunction: (addressOfOffset, elementId) => {
                let container = document.getElementById(elementId.toString())
                if (container) {
                    memoryDataView.setFloat32(
                        addressOfOffset,
                        -container.scrollLeft,
                        true
                    )
                    memoryDataView.setFloat32(
                        addressOfOffset + 4,
                        -container.scrollTop,
                        true
                    )
                }
            },
        },
        env: {
            js_log: (ptr, length) => {
                const bytes = new Uint8Array(
                    instance.exports.memory.buffer,
                    ptr,
                    length
                )
                console.log('[C]', new TextDecoder().decode(bytes))
            },
        },
    }

    const wasmResponse = await WebAssembly.instantiateStreaming(
        fetch('/wasm/index.wasm'),
        importObject
    )
    instance = wasmResponse.instance
    memoryDataView = new DataView(
        new Uint8Array(instance.exports.memory.buffer).buffer
    )
    scratchSpaceAddress = instance.exports.__heap_base.value
    let clayScratchSpaceAddress = instance.exports.__heap_base.value + 1024
    heapSpaceAddress = instance.exports.__heap_base.value + 2048
    let arenaAddress = scratchSpaceAddress + 8
    window.instance = instance
    createMainArena(arenaAddress, heapSpaceAddress)
    memoryDataView.setFloat32(
        instance.exports.__heap_base.value,
        window.innerWidth,
        true
    )
    memoryDataView.setFloat32(
        instance.exports.__heap_base.value + 4,
        window.innerHeight,
        true
    )
    instance.exports.Clay_Initialize(
        arenaAddress,
        instance.exports.__heap_base.value
    )
    instance.exports.SetScratchMemory(clayScratchSpaceAddress)
    renderCommandSize = getStructTotalSize(renderCommandDefinition)
    onWasmReady({
        instance,
        memoryDataView,
        scratchSpaceAddress,
        renderCommandSize,
        textDecoder,
        elementCache,
        customHTMLDataDefinition,
        stringDefinition,
    })
}
