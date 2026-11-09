// Shared dynamic imports so hovering a link can warm the same chunk the router loads.
let universePromise: Promise<typeof import("../pages/Universe")> | null = null;

export const loadUniverse = () => (universePromise ??= import("../pages/Universe"));

let relaxPromise: Promise<typeof import("../pages/Relax/Relax")> | null = null;

export const loadRelax = () => (relaxPromise ??= import("../pages/Relax/Relax"));

let projectsPromise: Promise<typeof import("../pages/Projects")> | null = null;

export const loadProjects = () => (projectsPromise ??= import("../pages/Projects"));
