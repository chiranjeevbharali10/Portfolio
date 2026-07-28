let loaded = false;

export const isAppLoaded = () => loaded;

export const setAppLoaded = () => {
  loaded = true;
  window.dispatchEvent(new Event('appLoaded'));
};
