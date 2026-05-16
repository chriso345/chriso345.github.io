export const stringDefinition = {
    type: 'struct',
    members: [
        { name: 'isStaticallyAllocated', type: 'uint32_t' },
        { name: 'length', type: 'uint32_t' },
        { name: 'chars', type: 'uint32_t' },
    ],
}
export const stringSliceDefinition = {
    type: 'struct',
    members: [
        { name: 'length', type: 'uint32_t' },
        { name: 'chars', type: 'uint32_t' },
        { name: 'baseChars', type: 'uint32_t' },
    ],
}
export const borderWidthDefinition = {
    type: 'struct',
    members: [
        { name: 'left', type: 'uint16_t' },
        { name: 'right', type: 'uint16_t' },
        { name: 'top', type: 'uint16_t' },
        { name: 'bottom', type: 'uint16_t' },
        { name: 'betweenChildren', type: 'uint16_t' },
    ],
}
export const cornerRadiusDefinition = {
    type: 'struct',
    members: [
        { name: 'topLeft', type: 'float' },
        { name: 'topRight', type: 'float' },
        { name: 'bottomLeft', type: 'float' },
        { name: 'bottomRight', type: 'float' },
    ],
}
export const colorDefinition = {
    type: 'struct',
    members: [
        { name: 'r', type: 'float' },
        { name: 'g', type: 'float' },
        { name: 'b', type: 'float' },
        { name: 'a', type: 'float' },
    ],
}
export const textConfigDefinition = {
    name: 'text',
    type: 'struct',
    members: [
        { name: 'userData', type: 'uint32_t' },
        { name: 'textColor', ...colorDefinition },
        { name: 'fontId', type: 'uint16_t' },
        { name: 'fontSize', type: 'uint16_t' },
        { name: 'letterSpacing', type: 'uint16_t' },
        { name: 'lineSpacing', type: 'uint16_t' },
        { name: 'wrapMode', type: 'uint8_t' },
        { name: 'disablePointerEvents', type: 'uint8_t' },
        { name: '_padding', type: 'uint16_t' },
    ],
}
export const textRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'stringContents', ...stringSliceDefinition },
        { name: 'textColor', ...colorDefinition },
        { name: 'fontId', type: 'uint16_t' },
        { name: 'fontSize', type: 'uint16_t' },
        { name: 'letterSpacing', type: 'uint16_t' },
        { name: 'lineHeight', type: 'uint16_t' },
    ],
}
export const rectangleRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'backgroundColor', ...colorDefinition },
        { name: 'cornerRadius', ...cornerRadiusDefinition },
    ],
}
export const imageRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'backgroundColor', ...colorDefinition },
        { name: 'cornerRadius', ...cornerRadiusDefinition },
        { name: 'imageData', type: 'uint32_t' },
    ],
}
export const customRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'backgroundColor', ...colorDefinition },
        { name: 'cornerRadius', ...cornerRadiusDefinition },
        { name: 'customData', type: 'uint32_t' },
    ],
}
export const borderRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'color', ...colorDefinition },
        { name: 'cornerRadius', ...cornerRadiusDefinition },
        { name: 'width', ...borderWidthDefinition },
        { name: 'padding', type: 'uint16_t' },
    ],
}
export const clipRenderDataDefinition = {
    type: 'struct',
    members: [
        { name: 'horizontal', type: 'bool' },
        { name: 'vertical', type: 'bool' },
    ],
}
export const customHTMLDataDefinition = {
    type: 'struct',
    members: [
        { name: 'link', ...stringDefinition },
        { name: 'cursorPointer', type: 'uint8_t' },
        { name: 'disablePointerEvents', type: 'uint8_t' },
        { name: 'invertWithDarkMode', type: 'uint8_t' },
        { name: 'padding', type: 'uint16_t' },
    ],
}
export const renderCommandDefinition = {
    name: 'Clay_RenderCommand',
    type: 'struct',
    members: [
        {
            name: 'boundingBox',
            type: 'struct',
            members: [
                { name: 'x', type: 'float' },
                { name: 'y', type: 'float' },
                { name: 'width', type: 'float' },
                { name: 'height', type: 'float' },
            ],
        },
        {
            name: 'renderData',
            type: 'union',
            members: [
                { name: 'rectangle', ...rectangleRenderDataDefinition },
                { name: 'text', ...textRenderDataDefinition },
                { name: 'image', ...imageRenderDataDefinition },
                { name: 'custom', ...customRenderDataDefinition },
                { name: 'border', ...borderRenderDataDefinition },
                { name: 'clip', ...clipRenderDataDefinition },
            ],
        },
        { name: 'userData', type: 'uint32_t' },
        { name: 'id', type: 'uint32_t' },
        { name: 'zIndex', type: 'int16_t' },
        { name: 'commandType', type: 'uint8_t' },
        { name: '_padding', type: 'uint8_t' },
    ],
}

export function getStructTotalSize(definition) {
    switch (definition.type) {
        case 'union':
        case 'struct': {
            let totalSize = 0
            for (const member of definition.members) {
                let result = getStructTotalSize(member)
                if (definition.type === 'struct') {
                    totalSize += result
                } else {
                    totalSize = Math.max(totalSize, result)
                }
            }
            return totalSize
        }
        case 'float':
            return 4
        case 'uint32_t':
            return 4
        case 'int32_t':
            return 4
        case 'uint16_t':
            return 2
        case 'int16_t':
            return 2
        case 'uint8_t':
            return 1
        case 'bool':
            return 1
        default:
            throw 'Unimplemented C data type ' + definition.type
    }
}

export function readStructAtAddress(address, definition, memoryDataView) {
    switch (definition.type) {
        case 'union':
        case 'struct': {
            let struct = { __size: 0 }
            for (const member of definition.members) {
                let result = readStructAtAddress(
                    address,
                    member,
                    memoryDataView
                )
                struct[member.name] = result
                if (definition.type === 'struct') {
                    struct.__size += result.__size
                    address += result.__size
                } else {
                    struct.__size = Math.max(struct.__size, result.__size)
                }
            }
            return struct
        }
        case 'float':
            return {
                value: memoryDataView.getFloat32(address, true),
                __size: 4,
            }
        case 'uint32_t':
            return { value: memoryDataView.getUint32(address, true), __size: 4 }
        case 'int32_t':
            return { value: memoryDataView.getUint32(address, true), __size: 4 }
        case 'uint16_t':
            return { value: memoryDataView.getUint16(address, true), __size: 2 }
        case 'int16_t':
            return { value: memoryDataView.getInt16(address, true), __size: 2 }
        case 'uint8_t':
            return { value: memoryDataView.getUint8(address, true), __size: 1 }
        case 'bool':
            return { value: memoryDataView.getUint8(address, true), __size: 1 }
        default:
            throw 'Unimplemented C data type ' + definition.type
    }
}

export function getTextDimensions(text, font) {
    window.canvasContext.font = font
    let metrics = window.canvasContext.measureText(text)
    return {
        width: metrics.width,
        height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
    }
}

export function MemoryIsDifferent(one, two, length) {
    for (let i = 0; i < length; i++) {
        if (one[i] !== two[i]) return true
    }
    return false
}

export function SetElementBackgroundColorAndRadius(
    element,
    cornerRadius,
    backgroundColor
) {
    element.style.backgroundColor = `rgba(${backgroundColor.r.value}, ${backgroundColor.g.value}, ${backgroundColor.b.value}, ${backgroundColor.a.value / 255})`
    if (cornerRadius.topLeft.value > 0)
        element.style.borderTopLeftRadius = cornerRadius.topLeft.value + 'px'
    if (cornerRadius.topRight.value > 0)
        element.style.borderTopRightRadius = cornerRadius.topRight.value + 'px'
    if (cornerRadius.bottomLeft.value > 0)
        element.style.borderBottomLeftRadius =
            cornerRadius.bottomLeft.value + 'px'
    if (cornerRadius.bottomRight.value > 0)
        element.style.borderBottomRightRadius =
            cornerRadius.bottomRight.value + 'px'
}
