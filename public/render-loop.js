export function renderLoopHTML({
    memoryDataView,
    scratchSpaceAddress,
    renderCommandSize,
    instance,
    elementCache,
    textDecoder,
    customHTMLDataDefinition,
    stringDefinition,
    fontsById,
    GLOBAL_FONT_SCALING_FACTOR,
}) {
    let capacity = memoryDataView.getInt32(scratchSpaceAddress, true)
    let length = memoryDataView.getInt32(scratchSpaceAddress + 4, true)
    let arrayOffset = memoryDataView.getUint32(scratchSpaceAddress + 8, true)
    let darkMode =
        memoryDataView.getUint8(instance.exports.USING_DARK_MODE.value) !== 0
    let scissorStack = [
        {
            nextAllocation: { x: 0, y: 0 },
            element: window.htmlRoot,
            nextElementIndex: 0,
        },
    ]
    let previousId = 0
    for (let i = 0; i < length; i++, arrayOffset += renderCommandSize) {
        let entireRenderCommandMemory = new Uint8Array(
            memoryDataView.buffer.slice(
                arrayOffset,
                arrayOffset + renderCommandSize
            )
        )
        let renderCommand = window.readStructAtAddress(
            arrayOffset,
            window.renderCommandDefinition,
            memoryDataView
        )
        let parentElement = scissorStack[scissorStack.length - 1]
        let element = null
        let isMultiConfigElement = previousId === renderCommand.id.value
        if (!elementCache[renderCommand.id.value]) {
            let elementType = 'div'
            switch (renderCommand.commandType.value & 0xff) {
                case window.CLAY_RENDER_COMMAND_TYPE_TEXT:
                case window.CLAY_RENDER_COMMAND_TYPE_RECTANGLE: {
                    if (renderCommand.userData.value !== 0) {
                        if (
                            window.readStructAtAddress(
                                renderCommand.userData.value,
                                window.customHTMLDataDefinition,
                                memoryDataView
                            ).link.length.value > 0
                        ) {
                            elementType = 'a'
                        }
                    }
                    break
                }
                case window.CLAY_RENDER_COMMAND_TYPE_IMAGE: {
                    elementType = 'img'
                    break
                }
                default:
                    break
            }
            element = document.createElement(elementType)
            element.id = renderCommand.id.value
            if (
                renderCommand.commandType.value ===
                window.CLAY_RENDER_COMMAND_TYPE_SCISSOR_START
            ) {
                element.style.overflow = 'hidden'
            }
            elementCache[renderCommand.id.value] = {
                exists: true,
                element: element,
                previousMemoryCommand: new Uint8Array(0),
                previousMemoryConfig: new Uint8Array(0),
                previousMemoryText: new Uint8Array(0),
            }
        }
        let elementData = elementCache[renderCommand.id.value]
        element = elementData.element
        if (
            !isMultiConfigElement &&
            Array.prototype.indexOf.call(
                parentElement.element.children,
                element
            ) !== parentElement.nextElementIndex
        ) {
            if (parentElement.nextElementIndex === 0) {
                parentElement.element.insertAdjacentElement(
                    'afterbegin',
                    element
                )
            } else {
                parentElement.element.childNodes[
                    Math.min(
                        parentElement.nextElementIndex - 1,
                        parentElement.element.childNodes.length - 1
                    )
                ].insertAdjacentElement('afterend', element)
            }
        }
        elementData.exists = true
        let dirty =
            window.MemoryIsDifferent(
                elementData.previousMemoryCommand,
                entireRenderCommandMemory,
                renderCommandSize
            ) && !isMultiConfigElement
        if (!isMultiConfigElement) {
            parentElement.nextElementIndex++
        }
        previousId = renderCommand.id.value
        elementData.previousMemoryCommand = entireRenderCommandMemory
        let offsetX =
            scissorStack.length > 0
                ? scissorStack[scissorStack.length - 1].nextAllocation.x
                : 0
        let offsetY =
            scissorStack.length > 0
                ? scissorStack[scissorStack.length - 1].nextAllocation.y
                : 0
        if (dirty) {
            element.style.transform = `translate(${Math.round(renderCommand.boundingBox.x.value - offsetX)}px, ${Math.round(renderCommand.boundingBox.y.value - offsetY)}px)`
            element.style.width =
                Math.round(renderCommand.boundingBox.width.value) + 'px'
            element.style.height =
                Math.round(renderCommand.boundingBox.height.value) + 'px'
        }
        switch (renderCommand.commandType.value & 0xff) {
            case window.CLAY_RENDER_COMMAND_TYPE_NONE: {
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_RECTANGLE: {
                let config = renderCommand.renderData.rectangle
                let configMemory = JSON.stringify(config)
                if (configMemory === elementData.previousMemoryConfig) {
                    break
                }
                window.SetElementBackgroundColorAndRadius(
                    element,
                    config.cornerRadius,
                    config.backgroundColor
                )
                if (renderCommand.userData.value !== 0) {
                    let customData = window.readStructAtAddress(
                        renderCommand.userData.value,
                        window.customHTMLDataDefinition,
                        memoryDataView
                    )
                    let linkContents =
                        customData.link.length.value > 0
                            ? textDecoder.decode(
                                  new Uint8Array(
                                      memoryDataView.buffer.slice(
                                          customData.link.chars.value,
                                          customData.link.chars.value +
                                              customData.link.length.value
                                      )
                                  )
                              )
                            : 0
                    memoryDataView.setUint32(0, renderCommand.id.value, true)
                    if (
                        linkContents.length > 0 &&
                        (window.mouseDownThisFrame || window.touchDown) &&
                        instance.exports.Clay_PointerOver(0)
                    ) {
                        window.location.href = linkContents
                    }
                    if (linkContents.length > 0) {
                        element.href = linkContents
                    }
                    if (
                        linkContents.length > 0 ||
                        customData.cursorPointer.value
                    ) {
                        element.style.pointerEvents = 'all'
                        element.style.cursor = 'pointer'
                    }
                }
                elementData.previousMemoryConfig = configMemory
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_BORDER: {
                let config = renderCommand.renderData.border
                let configMemory = JSON.stringify(config)
                if (configMemory === elementData.previousMemoryConfig) {
                    break
                }
                let color = config.color
                elementData.previousMemoryConfig = configMemory
                if (config.width.left.value > 0) {
                    element.style.borderLeft = `${config.width.left.value}px solid rgba(${color.r.value}, ${color.g.value}, ${color.b.value}, ${color.a.value / 255})`
                }
                if (config.width.right.value > 0) {
                    element.style.borderRight = `${config.width.right.value}px solid rgba(${color.r.value}, ${color.g.value}, ${color.b.value}, ${color.a.value / 255})`
                }
                if (config.width.top.value > 0) {
                    element.style.borderTop = `${config.width.top.value}px solid rgba(${color.r.value}, ${color.g.value}, ${color.b.value}, ${color.a.value / 255})`
                }
                if (config.width.bottom.value > 0) {
                    element.style.borderBottom = `${config.width.bottom.value}px solid rgba(${color.r.value}, ${color.g.value}, ${color.b.value}, ${color.a.value / 255})`
                }
                if (config.cornerRadius.topLeft.value > 0) {
                    element.style.borderTopLeftRadius =
                        config.cornerRadius.topLeft.value + 'px'
                }
                if (config.cornerRadius.topRight.value > 0) {
                    element.style.borderTopRightRadius =
                        config.cornerRadius.topRight.value + 'px'
                }
                if (config.cornerRadius.bottomLeft.value > 0) {
                    element.style.borderBottomLeftRadius =
                        config.cornerRadius.bottomLeft.value + 'px'
                }
                if (config.cornerRadius.bottomRight.value > 0) {
                    element.style.borderBottomRightRadius =
                        config.cornerRadius.bottomRight.value + 'px'
                }
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_TEXT: {
                let config = renderCommand.renderData.text
                let configMemory = JSON.stringify(config)
                let stringContents = new Uint8Array(
                    memoryDataView.buffer.slice(
                        config.stringContents.chars.value,
                        config.stringContents.chars.value +
                            config.stringContents.length.value
                    )
                )
                if (configMemory !== elementData.previousMemoryConfig) {
                    element.className = 'text'
                    let textColor = config.textColor
                    let fontSize = Math.round(
                        config.fontSize.value * GLOBAL_FONT_SCALING_FACTOR
                    )
                    element.style.color = `rgba(${textColor.r.value}, ${textColor.g.value}, ${textColor.b.value}, ${textColor.a.value})`
                    element.style.fontFamily = fontsById[config.fontId.value]
                    element.style.fontSize = fontSize + 'px'
                    if (renderCommand.userData.value !== 0) {
                        let customData = window.readStructAtAddress(
                            renderCommand.userData.value,
                            window.customHTMLDataDefinition,
                            memoryDataView
                        )
                        element.style.pointerEvents = customData
                            .disablePointerEvents.value
                            ? 'none'
                            : 'all'
                        let linkContents =
                            customData.link.length.value > 0
                                ? textDecoder.decode(
                                      new Uint8Array(
                                          memoryDataView.buffer.slice(
                                              customData.link.chars.value,
                                              customData.link.chars.value +
                                                  customData.link.length.value
                                          )
                                      )
                                  )
                                : 0
                        memoryDataView.setUint32(
                            0,
                            renderCommand.id.value,
                            true
                        )
                        if (
                            linkContents.length > 0 &&
                            (window.mouseDownThisFrame || window.touchDown) &&
                            instance.exports.Clay_PointerOver(0)
                        ) {
                            window.location.href = linkContents
                        }
                        if (linkContents.length > 0) {
                            element.href = linkContents
                        }
                        if (
                            linkContents.length > 0 ||
                            customData.cursorPointer.value
                        ) {
                            element.style.pointerEvents = 'all'
                            element.style.cursor = 'pointer'
                        }
                    }
                    elementData.previousMemoryConfig = configMemory
                }
                if (
                    stringContents.length !==
                        elementData.previousMemoryText.length ||
                    window.MemoryIsDifferent(
                        stringContents,
                        elementData.previousMemoryText,
                        stringContents.length
                    )
                ) {
                    element.innerHTML = textDecoder.decode(stringContents)
                }
                elementData.previousMemoryText = stringContents
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_SCISSOR_START: {
                scissorStack.push({
                    nextAllocation: {
                        x: renderCommand.boundingBox.x.value,
                        y: renderCommand.boundingBox.y.value,
                    },
                    element,
                    nextElementIndex: 0,
                })
                let config = renderCommand.renderData.clip
                let configMemory = JSON.stringify(config)
                if (configMemory === elementData.previousMemoryConfig) {
                    break
                }
                if (config.horizontal.value) {
                    element.style.overflowX = 'scroll'
                    element.style.pointerEvents = 'auto'
                }
                if (config.vertical.value) {
                    element.style.overflowY = 'scroll'
                    element.style.pointerEvents = 'auto'
                }
                elementData.previousMemoryConfig = configMemory
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_SCISSOR_END: {
                scissorStack.splice(scissorStack.length - 1, 1)
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_IMAGE: {
                let config = renderCommand.renderData.image
                let imageURL = window.readStructAtAddress(
                    config.imageData.value,
                    window.stringDefinition,
                    memoryDataView
                )
                let srcContents = new Uint8Array(
                    memoryDataView.buffer.slice(
                        imageURL.chars.value,
                        imageURL.chars.value + imageURL.length.value
                    )
                )
                if (
                    srcContents.length !==
                        elementData.previousMemoryText.length ||
                    window.MemoryIsDifferent(
                        srcContents,
                        elementData.previousMemoryText,
                        srcContents.length
                    )
                ) {
                    element.src = textDecoder.decode(srcContents)
                }
                elementData.previousMemoryText = srcContents
                if (renderCommand.userData.value !== 0) {
                    let customData = window.readStructAtAddress(
                        renderCommand.userData.value,
                        window.customHTMLDataDefinition,
                        memoryDataView
                    )
                    let linkContents =
                        customData.link.length.value > 0
                            ? textDecoder.decode(
                                  new Uint8Array(
                                      memoryDataView.buffer.slice(
                                          customData.link.chars.value,
                                          customData.link.chars.value +
                                              customData.link.length.value
                                      )
                                  )
                              )
                            : null
                    memoryDataView.setUint32(0, renderCommand.id.value, true)
                    if (
                        linkContents &&
                        (window.mouseDownThisFrame || window.touchDown) &&
                        instance.exports.Clay_PointerOver(0)
                    ) {
                        window.open(linkContents, '_blank', 'noopener')
                    }
                    if (linkContents || customData.cursorPointer.value) {
                        element.style.pointerEvents = 'all'
                        element.style.cursor = 'pointer'
                    }
                    if (customData.disablePointerEvents.value) {
                        element.style.pointerEvents = 'none'
                    }
                    if (customData.invertWithDarkMode.value) {
                        element.style.filter = darkMode ? 'invert(1)' : 'none'
                        element.style.transition = 'filter 0.3s'
                    }
                }
                break
            }
            case window.CLAY_RENDER_COMMAND_TYPE_CUSTOM:
                break
            default: {
                console.log('Error: unhandled render command')
            }
        }
    }
    // Attach dark mode toggle event listener after render
    const toggle = document.getElementById('ToggleOuter');
    if (toggle && !toggle.hasToggleListener) {
        toggle.addEventListener('pointerdown', () => {
            // Simulate Clay pointer event for dark mode toggle
            window.mouseDownThisFrame = true;
        });
        toggle.hasToggleListener = true;
        toggle.style.pointerEvents = 'all';
        toggle.style.cursor = 'pointer';
    }
    for (const key of Object.keys(elementCache)) {
        if (elementCache[key].exists) {
            elementCache[key].exists = false
        } else {
            elementCache[key].element.remove()
            delete elementCache[key]
        }
    }
}
