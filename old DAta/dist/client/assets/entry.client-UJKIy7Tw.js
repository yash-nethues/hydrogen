import{E as v,i as C,e as M,f as g,m as y,s as E,g as S,h as b,k as F,l as P,n as k,o as D,r,p as z,R as H,q as L,t as O,v as T,j as R}from"./components-CBM5eEXI.js";/**
 * @remix-run/react v2.15.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function j(u){if(!u)return null;let m=Object.entries(u),s={};for(let[a,e]of m)if(e&&e.__type==="RouteErrorResponse")s[a]=new v(e.status,e.statusText,e.data,e.internal===!0);else if(e&&e.__type==="Error"){if(e.__subType){let i=window[e.__subType];if(typeof i=="function")try{let o=new i(e.message);o.stack=e.stack,s[a]=o}catch{}}if(s[a]==null){let i=new Error(e.message);i.stack=e.stack,s[a]=i}}else s[a]=e;return s}/**
 * @remix-run/react v2.15.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n,t,c=!1,f;new Promise(u=>{f=u}).catch(()=>{});function B(u){if(!t){if(window.__remixContext.future.v3_singleFetch){if(!n){let d=window.__remixContext.stream;C(d,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,n=M(d,window).then(l=>{window.__remixContext.state=l.value,n.value=!0}).catch(l=>{n.error=l})}if(n.error)throw n.error;if(!n.value)throw n}let i=g(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),o;if(!window.__remixContext.isSpaMode){o={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let d=y(i,window.location,window.__remixContext.basename);if(d)for(let l of d){let _=l.route.id,x=window.__remixRouteModules[_],w=window.__remixManifest.routes[_];x&&E(w,x,window.__remixContext.isSpaMode)&&(x.HydrateFallback||!w.hasLoader)?o.loaderData[_]=void 0:w&&!w.hasLoader&&(o.loaderData[_]=null)}o&&o.errors&&(o.errors=j(o.errors))}t=S({routes:i,history:b(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.v3_singleFetch===!0},hydrationData:o,mapRouteProperties:F,dataStrategy:window.__remixContext.future.v3_singleFetch?P(window.__remixManifest,window.__remixRouteModules,()=>t):void 0,patchRoutesOnNavigation:k(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),t.state.initialized&&(c=!0,t.initialize()),t.createRoutesForHMR=D,window.__remixRouter=t,f&&f(t)}let[m,s]=r.useState(void 0),[a,e]=r.useState(t.state.location);return r.useLayoutEffect(()=>{c||(c=!0,t.initialize())},[]),r.useLayoutEffect(()=>t.subscribe(i=>{i.location!==a&&e(i.location)}),[a]),z(t,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),r.createElement(r.Fragment,null,r.createElement(H.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:m,isSpaMode:window.__remixContext.isSpaMode}},r.createElement(L,{location:a},r.createElement(O,{router:t,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.v3_singleFetch?r.createElement(r.Fragment,null):null)}var p,h=T;h.createRoot,p=h.hydrateRoot;window.location.origin.includes("webcache.googleusercontent.com")||r.startTransition(()=>{p(document,R.jsx(r.StrictMode,{children:R.jsx(B,{})}))});
