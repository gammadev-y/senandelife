// src/utils/objectUtils.ts
export const isObject = (item: unknown): item is Record<string, unknown> => {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
};

export function deepMerge<T extends object, U extends object>(
    target: T,
    source: U
): T & U {
    const output: Record<string, any> = { ...target };

    for (const key of Object.keys(source)) {
        const sourceValue = (source as any)[key];
        const targetValue = output[key];

        if (isObject(sourceValue)) {
            if (isObject(targetValue)) {
                output[key] = deepMerge(targetValue, sourceValue);
            } else {
                // If target value is not an object, create a deep copy of the source object.
                output[key] = deepMerge({}, sourceValue);
            }
        } else if (Array.isArray(sourceValue)) {
            // Overwrite with a new array to prevent aliasing.
            output[key] = [...sourceValue];
        } else if (sourceValue !== undefined) {
            output[key] = sourceValue;
        }
    }

    return output as T & U;
}
