export const findChangedFieldKeys = (
  original: any,
  updated: any,
  parentKey = ""
): string[] => {
  console.log("Check original and updated", { original, updated, parentKey });
  const changedKeys: string[] = [];

  const isObject = (obj: any) =>
    obj && typeof obj === "object" && !Array.isArray(obj);

  const isArray = (arr: any) => Array.isArray(arr);

  const fullKey = (key: string) => (parentKey ? `${parentKey}-${key}` : key);

  // Handle deleted keys as well (keys that exist in original but not in updated)
  const allKeys = new Set([
    ...Object.keys(original || {}),
    ...Object.keys(updated || {}),
  ]);

  for (const key of allKeys) {
    if (key === "id") {
      continue;
    }
    const originalValue = original ? original[key] : undefined;
    const updatedValue = updated ? updated[key] : undefined;

    if (isObject(originalValue) && isObject(updatedValue)) {
      // Recurse for nested object
      changedKeys.push(
        ...findChangedFieldKeys(originalValue, updatedValue, fullKey(key))
      );
    } else if (isArray(originalValue) && isArray(updatedValue)) {
      // Compare arrays by JSON.stringify (you can make it smarter if needed)
      if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
        changedKeys.push(fullKey(key));
      }
    } else {
      // Compare primitive values (or different types)
      if (originalValue !== updatedValue) {
        changedKeys.push(fullKey(key));
      }
    }
  }

  console.log("Step 8", { changedKeys });

  return changedKeys;
};


// Helper function to format address
  export function formatAddress(addressObj: any): string {
    if (!addressObj) return "";

    const addressParts = [
      ...(addressObj.addressLines || []),
      addressObj.locality,
      addressObj.administrativeArea,
      addressObj.postalCode,
    ].filter(Boolean); // Remove empty/null values

    return addressParts.join(", ");
  }