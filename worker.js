!function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){var n=r(1),o=r(5);new n(o.name,o.version,"verbose").fromCache(["/","cosmic-lib.css","index.css","index.html","index.js","stellar-sdk.js","browserconfig.xml","manifest.json","icons/16x16.png","icons/32x32.png","icons/192x192.png","icons/512x512.png","icons/apple-touch.png","icons/mstile.png","icons/safari.svg"]).precache().register()},function(t,e,r){var n=r(2);function o(t,e,r,n,o,i,c){try{var a=t[i](c),s=a.value}catch(t){return void r(t)}a.done?e(s):Promise.resolve(s).then(n,o)}function i(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var c=2e3,a=t.exports=function(){"use strict";function t(e,r,n){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.name=e,this.version=r,this.verbose=n,this.hostname=location.host.replace(/:.*/,""),this.enabled="localhost"!==this.hostname&&"127.0.0.1"!==this.hostname,this.root="".concat(location.protocol,"//").concat(location.host,"/"),this.startByRoot=new RegExp("^"+this.root),this.timeout=c,this.cacheName="".concat(e,"-").concat(r),this.files={},this.get=[]}var e,r,n;return e=t,(r=[{key:"log",value:function(t){this.verbose&&console.log(t)}},{key:"precache",value:function(){return this.get=Object.keys(this.files),this}},{key:"register",value:function(){var t=this;self.addEventListener("install",function(e){var r,n;t.log("Installing ".concat(t.cacheName,"...")),e.waitUntil((r=t,n=t.get,caches.open(r.cacheName).then(function(t){return t.addAll(n)})).then(function(){return self.skipWaiting()}).then(function(){return t.log("".concat(t.cacheName," installed"))}))}),self.addEventListener("activate",function(e){var r;e.waitUntil((r=t.cacheName,caches.keys().then(function(t){return Promise.all(t.map(function(t){t!==r&&caches.delete(t)}))})))}),self.addEventListener("fetch",function(e){if(t.enabled&&"GET"===e.request.method&&e.request.url.match(t.startByRoot)){var r=new Request(e.request.url.replace(/\?.*$/,"")),n=r.url.replace(t.startByRoot,"")||"index.html",o=t.files[n];o&&s[o]?e.respondWith(s[o](t,r,n)):e.respondWith(s.fromNetwork(t,r,n))}})}}])&&i(e.prototype,r),n&&i(e,n),t}();var s={};function u(t,e,r){var n=r.clone();caches.open(t.cacheName).then(function(t){return t.put(e,n)})}s.fromCache=function(t,e,r){return t.log("Looking for ".concat(r," into ").concat(t.cacheName," cache...")),caches.open(t.cacheName).then(function(t){return t.match(e)})},s.fromNetwork=function(t,e,r){return t.log("Downloading ".concat(r,"...")),new Promise(function(r,n){var o=setTimeout(n,t.timeout);return fetch(e).then(function(t){clearTimeout(o),r(t)})})},s.cacheOrNetwork=function(){var t,e=(t=n.mark(function t(e,r,o){var i,c;return n.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,s.fromCache(e,r,o);case 2:if(!(i=t.sent)){t.next=5;break}return t.abrupt("return",i);case 5:return t.next=7,s.fromNetwork(e,r,o);case 7:return c=t.sent,u(e,r,c),t.abrupt("return",c);case 10:case"end":return t.stop()}},t)}),function(){var e=this,r=arguments;return new Promise(function(n,i){var c=t.apply(e,r);function a(t){o(c,n,i,a,s,"next",t)}function s(t){o(c,n,i,a,s,"throw",t)}a(void 0)})});return function(t,r,n){return e.apply(this,arguments)}}();var l=function(t){a.prototype[t]=function(e){var r=this;return e.forEach(function(e){return r.files[e]=t}),this}};for(var f in s)l(f)},function(t,e,r){t.exports=r(3)},function(t,e,r){(function(t){function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var r=function(t){"use strict";var r,n=Object.prototype,o=n.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},c=i.iterator||"@@iterator",a=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function u(t,e,r,n){var o=e&&e.prototype instanceof y?e:y,i=Object.create(o.prototype),c=new _(n||[]);return i._invoke=function(t,e,r){var n=f;return function(o,i){if(n===p)throw new Error("Generator is already running");if(n===d){if("throw"===o)throw i;return S()}for(r.method=o,r.arg=i;;){var c=r.delegate;if(c){var a=L(c,r);if(a){if(a===m)continue;return a}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===f)throw n=d,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=p;var s=l(t,e,r);if("normal"===s.type){if(n=r.done?d:h,s.arg===m)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(n=d,r.method="throw",r.arg=s.arg)}}}(t,r,c),i}function l(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}t.wrap=u;var f="suspendedStart",h="suspendedYield",p="executing",d="completed",m={};function y(){}function v(){}function b(){}var g={};g[c]=function(){return this};var w=Object.getPrototypeOf,x=w&&w(w(P([])));x&&x!==n&&o.call(x,c)&&(g=x);var j=b.prototype=y.prototype=Object.create(g);function k(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function E(t){var r;this._invoke=function(n,i){function c(){return new Promise(function(r,c){!function r(n,i,c,a){var s=l(t[n],t,i);if("throw"!==s.type){var u=s.arg,f=u.value;return f&&"object"===e(f)&&o.call(f,"__await")?Promise.resolve(f.__await).then(function(t){r("next",t,c,a)},function(t){r("throw",t,c,a)}):Promise.resolve(f).then(function(t){u.value=t,c(u)},function(t){return r("throw",t,c,a)})}a(s.arg)}(n,i,r,c)})}return r=r?r.then(c,c):c()}}function L(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,L(t,e),"throw"===e.method))return m;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return m}var o=l(n,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,m;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,m):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,m)}function O(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function N(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0)}function P(t){if(t){var e=t[c];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,i=function e(){for(;++n<t.length;)if(o.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=r,e.done=!0,e};return i.next=i}}return{next:S}}function S(){return{value:r,done:!0}}return v.prototype=j.constructor=b,b.constructor=v,b[s]=v.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===v||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,b):(t.__proto__=b,s in t||(t[s]="GeneratorFunction")),t.prototype=Object.create(j),t},t.awrap=function(t){return{__await:t}},k(E.prototype),E.prototype[a]=function(){return this},t.AsyncIterator=E,t.async=function(e,r,n,o){var i=new E(u(e,r,n,o));return t.isGeneratorFunction(r)?i:i.next().then(function(t){return t.done?t.value:i.next()})},k(j),j[s]="Generator",j[c]=function(){return this},j.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=P,_.prototype={constructor:_,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(N),!t)for(var e in this)"t"===e.charAt(0)&&o.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,o){return a.type="throw",a.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var c=this.tryEntries[i],a=c.completion;if("root"===c.tryLoc)return n("end");if(c.tryLoc<=this.prev){var s=o.call(c,"catchLoc"),u=o.call(c,"finallyLoc");if(s&&u){if(this.prev<c.catchLoc)return n(c.catchLoc,!0);if(this.prev<c.finallyLoc)return n(c.finallyLoc)}else if(s){if(this.prev<c.catchLoc)return n(c.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<c.finallyLoc)return n(c.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&o.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var i=n;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var c=i?i.completion:{};return c.type=t,c.arg=e,i?(this.method="next",this.next=i.finallyLoc,m):this.complete(c)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),m},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),N(r),m}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;N(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:P(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),m}},t}("object"===e(t)?t.exports:{});try{regeneratorRuntime=r}catch(t){Function("r","regeneratorRuntime = r")(r)}}).call(this,r(4)(t))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t){t.exports={name:"stellar-authenticator",version:"0.13.12",description:"An application to easily & securely sign Stellar transactions",author:"MisterTicot",repository:"github:cosmic-plus/webapp-stellar-authenticator",license:"MIT",browserslist:"last 4 versions, > 0.1%",keywords:["cryptocurrency","stellar","authenticator","safe","wallet"],scripts:{test:'echo "Error: no test specified" && exit 1',get:"git submodule update --init --recursive",prettier:"prettier --write --no-semi '**.js' 'src/**.js' '**.json' '**.md'",eslint:"eslint --fix '**.js' 'src/**.js'",lint:"npm run prettier && npm run eslint","build-js":"webpack -p && cp -f node_modules/stellar-sdk/dist/stellar-sdk.min.js web/stellar-sdk.js","build-scss":"node-sass src/index.scss -o web -t compressed","build-css":"npm run build-scss && autoprefixer-cli web/index.css","build-html":"cp -fl src/*.html web","build-misc":"cp -f AUTHORS LICENSE README.md CHANGELOG.md package-lock.json web",build:"sh setenv.sh -p && for i in js css html misc; do npm run build-$i || return; done",rebuild:"npm run get && cp -f web/package-lock.json . && npm ci && npm run build",check:"npm run rebuild && cd web && git status","watch-css":"npm run build-css && node-sass src/index.scss -wo web","watch-js":"webpack -d --watch",watch:"sh setenv.sh -d && npm run build-html && npm run watch-css & npm run watch-js",serve:"npm run watch & cd web && live-server --no-browser"},devDependencies:{"@babel/core":"^7.4.3","@babel/plugin-transform-runtime":"^7.4.3","@babel/preset-env":"^7.4.3","@babel/runtime":"^7.4.3","autoprefixer-cli":"^1.0.0","babel-loader":"^8.0.5",eslint:"^5.16.0","live-server":"^1.2.1","node-sass":"^4.11.0",prettier:"^1.16.4",webpack:"^4.29.6","webpack-cli":"^3.2.3"},dependencies:{"@cosmic-plus/base":"^1.3.6","@cosmic-plus/jsutils":"^1.15.0","cosmic-lib":"^1.2.10","normalize.css":"^8.0.1","scrypt-async":"^2.0.0",tweetnacl:"^1.0.1","tweetnacl-util":"^0.15.0"}}}]);
//# sourceMappingURL=worker.js.map