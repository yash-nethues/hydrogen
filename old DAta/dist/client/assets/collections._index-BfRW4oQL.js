import{u as i,j as s,L as r}from"./components-CBM5eEXI.js";import{P as n}from"./PaginatedResourceSection-DBW1kUeq.js";import{I as d}from"./Image-DeF0sh8k.js";import"./index-BplfgVfs.js";function j(){const{collections:e}=i();return s.jsxs("div",{className:"collections",children:[s.jsx("h1",{children:"Collections"}),s.jsx(n,{connection:e,resourcesClassName:"collections-grid",children:({node:a,index:t})=>s.jsx(m,{collection:a,index:t},a.id)})]})}function m({collection:e,index:a}){return s.jsxs(r,{className:"collection-item",to:`/collections/${e.handle}`,prefetch:"intent",children:[(e==null?void 0:e.image)&&s.jsx(d,{alt:e.image.altText||e.title,aspectRatio:"1/1",data:e.image,loading:a<3?"eager":void 0}),s.jsx("h5",{children:e.title})]},e.id)}export{j as default};
