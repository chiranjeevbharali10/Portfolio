// Shared dynamic imports so hovering a link can warm the same chunk the router loads.
let universePromise: Promise<typeof import("../pages/Universe")> | null = null;

export const loadUniverse = () => (universePromise ??= import("../pages/Universe"));
