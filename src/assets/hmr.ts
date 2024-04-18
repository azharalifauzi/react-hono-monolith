// @ts-nocheck

import RefreshRuntime from 'http://localhost:4000/@react-refresh'

RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
