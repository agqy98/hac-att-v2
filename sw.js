if(!self.define){let e,c={};const i=(i,r)=>(i=new URL(i+".js",r).href,c[i]||new Promise((c=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=c,document.head.appendChild(e)}else e=i,importScripts(i),c()})).then((()=>{let e=c[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,s)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(c[o])return;let d={};const n=e=>i(e,o),a={module:{uri:o},exports:d,require:n};c[o]=Promise.all(r.map((e=>a[e]||n(e)))).then((e=>(s(...e),d)))}}define(["./workbox-d249b2c8"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"package-lock.json",revision:"a12056c3b03e6abe9114fc2b022381f3"},{url:"package.json",revision:"3a27943d07815ea4451fe19006decfcc"},{url:"public/favicon.ico",revision:"c92b85a5b907c70211f4ec25e29a8c4a"},{url:"public/index.html",revision:"e54d1c53a6c9a8d359e0ca55845a9fae"},{url:"public/logo192.png",revision:"33dbdd0177549353eeeb785d02c294af"},{url:"public/logo512.png",revision:"917515db74ea8d1aee6a246cfbcc0b45"},{url:"public/manifest.json",revision:"d9d975cebe2ec20b6c652e1e4c12ccf0"},{url:"public/robots.txt",revision:"fa1ded1ed7c11438a9b0385b1e112850"},{url:"README.md",revision:"33822368bfb3ad3de6fceb9cd76aa0dd"},{url:"src/App.css",revision:"2651f2265d6613947b1cc23282b21735"},{url:"src/App.js",revision:"729c6e80666d816e274383ec4ca462df"},{url:"src/App.test.js",revision:"d18ac434afb00158b91831ac1e36c491"},{url:"src/index.css",revision:"6c2104b8d219ed99234ae2d6329f4357"},{url:"src/index.js",revision:"de8d7d2b70f260537bba30e87a711959"},{url:"src/logo.svg",revision:"06e733283fa43d1dd57738cfc409adbd"},{url:"src/reportWebVitals.js",revision:"240e2381f826a9bb84d178b29b7b9abe"},{url:"src/setupTests.js",revision:"1a77571e1a8cf36018a41bcedf60db75"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]})}));
//# sourceMappingURL=sw.js.map
