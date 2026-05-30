const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/renderer-BtctnHmX.js","assets/Geometry-BiFqHrCW.js","assets/RenderTargetSystem-C3OKChzd.js","assets/FilterSystem-BNBRJkd1.js","assets/canvasUtils-Caj5AGXK.js","assets/CanvasPool-DUgQkr_4.js","assets/getTextureBatchBindGroup-C-rEa-E5.js","assets/BufferResource-BqW4mAyz.js"])))=>i.map(i=>d[i]);
var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},c=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},l=(n,r,a)=>(a=n==null?{}:e(i(n)),c(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var u=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},d=(e=>e?u(e):u)(e=>({phase:`lobby`,setPhase:t=>e({phase:t}),roomId:null,roomPlayers:[],setRoom:(t,n)=>e({roomId:t,roomPlayers:n}),myId:null,myName:``,setMyId:t=>e({myId:t}),setMyName:t=>e({myName:t}),colony:{color:`#4ade80`,name:``,xp:0,level:1,upgradePoints:0,class:`worker`,stats:{regen:0,maxHp:0,speed:0,damage:0,bulletSpeed:0,reload:0},resources:{leaf:0,fungus:0,honeydew:0,carapace:0},chambers:{},territory:null,ants:{},activeSkillCooldown:0},updateColony:t=>e(e=>({colony:{...e.colony,...t}})),updateResources:t=>e(e=>({colony:{...e.colony,resources:{...e.colony.resources,...t}}})),colonies:{},setColonies:t=>e({colonies:t}),updateColonyById:(t,n)=>e(e=>({colonies:{...e.colonies,[t]:{...e.colonies[t],...n}}})),mapSeed:null,dayPhase:`day`,dayTimer:240,setMap:t=>e({mapSeed:t}),setDayCycle:t=>e({dayPhase:t,dayTimer:240}),projectiles:[],foodShapes:[],clouds:[],predators:[],selectedAntIds:[],setSelection:t=>e({selectedAntIds:t}),placingChamber:null,setPlacingChamber:t=>e({placingChamber:t}),killFeed:[],addKill:t=>e(e=>({killFeed:[t,...e.killFeed].slice(0,6)})),chatMessages:[],addChat:t=>e(e=>({chatMessages:[...e.chatMessages,t].slice(-50)}))})),f=Object.create(null);f.open=`0`,f.close=`1`,f.ping=`2`,f.pong=`3`,f.message=`4`,f.upgrade=`5`,f.noop=`6`;var p=Object.create(null);Object.keys(f).forEach(e=>{p[f[e]]=e});var m={type:`error`,data:`parser error`},ee=typeof Blob==`function`||typeof Blob<`u`&&Object.prototype.toString.call(Blob)===`[object BlobConstructor]`,te=typeof ArrayBuffer==`function`,ne=e=>typeof ArrayBuffer.isView==`function`?ArrayBuffer.isView(e):e&&e.buffer instanceof ArrayBuffer,re=({type:e,data:t},n,r)=>ee&&t instanceof Blob?n?r(t):ie(t,r):te&&(t instanceof ArrayBuffer||ne(t))?n?r(t):ie(new Blob([t]),r):r(f[e]+(t||``)),ie=(e,t)=>{let n=new FileReader;return n.onload=function(){let e=n.result.split(`,`)[1];t(`b`+(e||``))},n.readAsDataURL(e)};function ae(e){return e instanceof Uint8Array?e:e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}var oe;function se(e,t){if(ee&&e.data instanceof Blob)return e.data.arrayBuffer().then(ae).then(t);if(te&&(e.data instanceof ArrayBuffer||ne(e.data)))return t(ae(e.data));re(e,!1,e=>{oe||=new TextEncoder,t(oe.encode(e))})}var ce=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,h=typeof Uint8Array>`u`?[]:new Uint8Array(256);for(let e=0;e<64;e++)h[ce.charCodeAt(e)]=e;var le=e=>{let t=e.length*.75,n=e.length,r,i=0,a,o,s,c;e[e.length-1]===`=`&&(t--,e[e.length-2]===`=`&&t--);let l=new ArrayBuffer(t),u=new Uint8Array(l);for(r=0;r<n;r+=4)a=h[e.charCodeAt(r)],o=h[e.charCodeAt(r+1)],s=h[e.charCodeAt(r+2)],c=h[e.charCodeAt(r+3)],u[i++]=a<<2|o>>4,u[i++]=(o&15)<<4|s>>2,u[i++]=(s&3)<<6|c&63;return l},ue=typeof ArrayBuffer==`function`,g=(e,t)=>{if(typeof e!=`string`)return{type:`message`,data:fe(e,t)};let n=e.charAt(0);return n===`b`?{type:`message`,data:de(e.substring(1),t)}:p[n]?e.length>1?{type:p[n],data:e.substring(1)}:{type:p[n]}:m},de=(e,t)=>ue?fe(le(e),t):{base64:!0,data:e},fe=(e,t)=>{switch(t){case`blob`:return e instanceof Blob?e:new Blob([e]);default:return e instanceof ArrayBuffer?e:e.buffer}},pe=``,me=(e,t)=>{let n=e.length,r=Array(n),i=0;e.forEach((e,a)=>{re(e,!1,e=>{r[a]=e,++i===n&&t(r.join(pe))})})},he=(e,t)=>{let n=e.split(pe),r=[];for(let e=0;e<n.length;e++){let i=g(n[e],t);if(r.push(i),i.type===`error`)break}return r};function ge(){return new TransformStream({transform(e,t){se(e,n=>{let r=n.length,i;if(r<126)i=new Uint8Array(1),new DataView(i.buffer).setUint8(0,r);else if(r<65536){i=new Uint8Array(3);let e=new DataView(i.buffer);e.setUint8(0,126),e.setUint16(1,r)}else{i=new Uint8Array(9);let e=new DataView(i.buffer);e.setUint8(0,127),e.setBigUint64(1,BigInt(r))}e.data&&typeof e.data!=`string`&&(i[0]|=128),t.enqueue(i),t.enqueue(n)})}})}var _e;function _(e){return e.reduce((e,t)=>e+t.length,0)}function v(e,t){if(e[0].length===t)return e.shift();let n=new Uint8Array(t),r=0;for(let i=0;i<t;i++)n[i]=e[0][r++],r===e[0].length&&(e.shift(),r=0);return e.length&&r<e[0].length&&(e[0]=e[0].slice(r)),n}function ve(e,t){_e||=new TextDecoder;let n=[],r=0,i=-1,a=!1;return new TransformStream({transform(o,s){for(n.push(o);;){if(r===0){if(_(n)<1)break;let e=v(n,1);a=(e[0]&128)==128,i=e[0]&127,r=i<126?3:i===126?1:2}else if(r===1){if(_(n)<2)break;let e=v(n,2);i=new DataView(e.buffer,e.byteOffset,e.length).getUint16(0),r=3}else if(r===2){if(_(n)<8)break;let e=v(n,8),t=new DataView(e.buffer,e.byteOffset,e.length),a=t.getUint32(0);if(a>2**21-1){s.enqueue(m);break}i=a*2**32+t.getUint32(4),r=3}else{if(_(n)<i)break;let e=v(n,i);s.enqueue(g(a?e:_e.decode(e),t)),r=0}if(i===0||i>e){s.enqueue(m);break}}}})}function y(e){if(e)return ye(e)}function ye(e){for(var t in y.prototype)e[t]=y.prototype[t];return e}y.prototype.on=y.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks[`$`+e]=this._callbacks[`$`+e]||[]).push(t),this},y.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},y.prototype.off=y.prototype.removeListener=y.prototype.removeAllListeners=y.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var n=this._callbacks[`$`+e];if(!n)return this;if(arguments.length==1)return delete this._callbacks[`$`+e],this;for(var r,i=0;i<n.length;i++)if(r=n[i],r===t||r.fn===t){n.splice(i,1);break}return n.length===0&&delete this._callbacks[`$`+e],this},y.prototype.emit=function(e){this._callbacks=this._callbacks||{};for(var t=Array(arguments.length-1),n=this._callbacks[`$`+e],r=1;r<arguments.length;r++)t[r-1]=arguments[r];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},y.prototype.emitReserved=y.prototype.emit,y.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks[`$`+e]||[]},y.prototype.hasListeners=function(e){return!!this.listeners(e).length};var b=typeof Promise==`function`&&typeof Promise.resolve==`function`?e=>Promise.resolve().then(e):(e,t)=>t(e,0),x=typeof self<`u`?self:typeof window<`u`?window:Function(`return this`)(),be=`arraybuffer`;function xe(e,...t){return t.reduce((t,n)=>(e.hasOwnProperty(n)&&(t[n]=e[n]),t),{})}var Se=x.setTimeout,Ce=x.clearTimeout;function S(e,t){t.useNativeTimers?(e.setTimeoutFn=Se.bind(x),e.clearTimeoutFn=Ce.bind(x)):(e.setTimeoutFn=x.setTimeout.bind(x),e.clearTimeoutFn=x.clearTimeout.bind(x))}var we=1.33;function Te(e){return typeof e==`string`?Ee(e):Math.ceil((e.byteLength||e.size)*we)}function Ee(e){let t=0,n=0;for(let r=0,i=e.length;r<i;r++)t=e.charCodeAt(r),t<128?n+=1:t<2048?n+=2:t<55296||t>=57344?n+=3:(r++,n+=4);return n}function De(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function Oe(e){let t=``;for(let n in e)e.hasOwnProperty(n)&&(t.length&&(t+=`&`),t+=encodeURIComponent(n)+`=`+encodeURIComponent(e[n]));return t}function ke(e){let t={},n=e.split(`&`);for(let e=0,r=n.length;e<r;e++){let r=n[e].split(`=`);t[decodeURIComponent(r[0])]=decodeURIComponent(r[1])}return t}var Ae=class extends Error{constructor(e,t,n){super(e),this.description=t,this.context=n,this.type=`TransportError`}},C=class extends y{constructor(e){super(),this.writable=!1,S(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,t,n){return super.emitReserved(`error`,new Ae(e,t,n)),this}open(){return this.readyState=`opening`,this.doOpen(),this}close(){return(this.readyState===`opening`||this.readyState===`open`)&&(this.doClose(),this.onClose()),this}send(e){this.readyState===`open`&&this.write(e)}onOpen(){this.readyState=`open`,this.writable=!0,super.emitReserved(`open`)}onData(e){let t=g(e,this.socket.binaryType);this.onPacket(t)}onPacket(e){super.emitReserved(`packet`,e)}onClose(e){this.readyState=`closed`,super.emitReserved(`close`,e)}pause(e){}createUri(e,t={}){return e+`://`+this._hostname()+this._port()+this.opts.path+this._query(t)}_hostname(){let e=this.opts.hostname;return e.indexOf(`:`)===-1?e:`[`+e+`]`}_port(){return this.opts.port&&(this.opts.secure&&Number(this.opts.port)!==443||!this.opts.secure&&Number(this.opts.port)!==80)?`:`+this.opts.port:``}_query(e){let t=Oe(e);return t.length?`?`+t:``}},je=class extends C{constructor(){super(...arguments),this._polling=!1}get name(){return`polling`}doOpen(){this._poll()}pause(e){this.readyState=`pausing`;let t=()=>{this.readyState=`paused`,e()};if(this._polling||!this.writable){let e=0;this._polling&&(e++,this.once(`pollComplete`,function(){--e||t()})),this.writable||(e++,this.once(`drain`,function(){--e||t()}))}else t()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved(`poll`)}onData(e){he(e,this.socket.binaryType).forEach(e=>{if(this.readyState===`opening`&&e.type===`open`&&this.onOpen(),e.type===`close`)return this.onClose({description:`transport closed by the server`}),!1;this.onPacket(e)}),this.readyState!==`closed`&&(this._polling=!1,this.emitReserved(`pollComplete`),this.readyState===`open`&&this._poll())}doClose(){let e=()=>{this.write([{type:`close`}])};this.readyState===`open`?e():this.once(`open`,e)}write(e){this.writable=!1,me(e,e=>{this.doWrite(e,()=>{this.writable=!0,this.emitReserved(`drain`)})})}uri(){let e=this.opts.secure?`https`:`http`,t=this.query||{};return!1!==this.opts.timestampRequests&&(t[this.opts.timestampParam]=De()),!this.supportsBinary&&!t.sid&&(t.b64=1),this.createUri(e,t)}},Me=!1;try{Me=typeof XMLHttpRequest<`u`&&`withCredentials`in new XMLHttpRequest}catch{}var Ne=Me;function Pe(){}var Fe=class extends je{constructor(e){if(super(e),typeof location<`u`){let t=location.protocol===`https:`,n=location.port;n||=t?`443`:`80`,this.xd=typeof location<`u`&&e.hostname!==location.hostname||n!==e.port}}doWrite(e,t){let n=this.request({method:`POST`,data:e});n.on(`success`,t),n.on(`error`,(e,t)=>{this.onError(`xhr post error`,e,t)})}doPoll(){let e=this.request();e.on(`data`,this.onData.bind(this)),e.on(`error`,(e,t)=>{this.onError(`xhr poll error`,e,t)}),this.pollXhr=e}},w=class e extends y{constructor(e,t,n){super(),this.createRequest=e,S(this,n),this._opts=n,this._method=n.method||`GET`,this._uri=t,this._data=n.data===void 0?null:n.data,this._create()}_create(){var t;let n=xe(this._opts,`agent`,`pfx`,`key`,`passphrase`,`cert`,`ca`,`ciphers`,`rejectUnauthorized`,`autoUnref`);n.xdomain=!!this._opts.xd;let r=this._xhr=this.createRequest(n);try{r.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){r.setDisableHeaderCheck&&r.setDisableHeaderCheck(!0);for(let e in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(e)&&r.setRequestHeader(e,this._opts.extraHeaders[e])}}catch{}if(this._method===`POST`)try{r.setRequestHeader(`Content-type`,`text/plain;charset=UTF-8`)}catch{}try{r.setRequestHeader(`Accept`,`*/*`)}catch{}(t=this._opts.cookieJar)==null||t.addCookies(r),`withCredentials`in r&&(r.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(r.timeout=this._opts.requestTimeout),r.onreadystatechange=()=>{var e;r.readyState===3&&((e=this._opts.cookieJar)==null||e.parseCookies(r.getResponseHeader(`set-cookie`))),r.readyState===4&&(r.status===200||r.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof r.status==`number`?r.status:0)},0))},r.send(this._data)}catch(e){this.setTimeoutFn(()=>{this._onError(e)},0);return}typeof document<`u`&&(this._index=e.requestsCount++,e.requests[this._index]=this)}_onError(e){this.emitReserved(`error`,e,this._xhr),this._cleanup(!0)}_cleanup(t){if(!(this._xhr===void 0||this._xhr===null)){if(this._xhr.onreadystatechange=Pe,t)try{this._xhr.abort()}catch{}typeof document<`u`&&delete e.requests[this._index],this._xhr=null}}_onLoad(){let e=this._xhr.responseText;e!==null&&(this.emitReserved(`data`,e),this.emitReserved(`success`),this._cleanup())}abort(){this._cleanup()}};if(w.requestsCount=0,w.requests={},typeof document<`u`){if(typeof attachEvent==`function`)attachEvent(`onunload`,Ie);else if(typeof addEventListener==`function`){let e=`onpagehide`in x?`pagehide`:`unload`;addEventListener(e,Ie,!1)}}function Ie(){for(let e in w.requests)w.requests.hasOwnProperty(e)&&w.requests[e].abort()}var Le=(function(){let e=ze({xdomain:!1});return e&&e.responseType!==null})(),Re=class extends Fe{constructor(e){super(e);let t=e&&e.forceBase64;this.supportsBinary=Le&&!t}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new w(ze,this.uri(),e)}};function ze(e){let t=e.xdomain;try{if(typeof XMLHttpRequest<`u`&&(!t||Ne))return new XMLHttpRequest}catch{}if(!t)try{return new x[[`Active`,`Object`].join(`X`)](`Microsoft.XMLHTTP`)}catch{}}var Be=typeof navigator<`u`&&typeof navigator.product==`string`&&navigator.product.toLowerCase()===`reactnative`,Ve=class extends C{get name(){return`websocket`}doOpen(){let e=this.uri(),t=this.opts.protocols,n=Be?{}:xe(this.opts,`agent`,`perMessageDeflate`,`pfx`,`key`,`passphrase`,`cert`,`ca`,`ciphers`,`rejectUnauthorized`,`localAddress`,`protocolVersion`,`origin`,`maxPayload`,`family`,`checkServerIdentity`);this.opts.extraHeaders&&(n.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,t,n)}catch(e){return this.emitReserved(`error`,e)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:`websocket connection closed`,context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError(`websocket error`,e)}write(e){this.writable=!1;for(let t=0;t<e.length;t++){let n=e[t],r=t===e.length-1;re(n,this.supportsBinary,e=>{try{this.doWrite(n,e)}catch{}r&&b(()=>{this.writable=!0,this.emitReserved(`drain`)},this.setTimeoutFn)})}}doClose(){this.ws!==void 0&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){let e=this.opts.secure?`wss`:`ws`,t=this.query||{};return this.opts.timestampRequests&&(t[this.opts.timestampParam]=De()),this.supportsBinary||(t.b64=1),this.createUri(e,t)}},T=x.WebSocket||x.MozWebSocket,He={websocket:class extends Ve{createSocket(e,t,n){return Be?new T(e,t,n):t?new T(e,t):new T(e)}doWrite(e,t){this.ws.send(t)}},webtransport:class extends C{get name(){return`webtransport`}doOpen(){try{this._transport=new WebTransport(this.createUri(`https`),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved(`error`,e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError(`webtransport error`,e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{let t=ve(2**53-1,this.socket.binaryType),n=e.readable.pipeThrough(t).getReader(),r=ge();r.readable.pipeTo(e.writable),this._writer=r.writable.getWriter();let i=()=>{n.read().then(({done:e,value:t})=>{e||(this.onPacket(t),i())}).catch(e=>{})};i();let a={type:`open`};this.query.sid&&(a.data=`{"sid":"${this.query.sid}"}`),this._writer.write(a).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let t=0;t<e.length;t++){let n=e[t],r=t===e.length-1;this._writer.write(n).then(()=>{r&&b(()=>{this.writable=!0,this.emitReserved(`drain`)},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)==null||e.close()}},polling:Re},Ue=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,We=[`source`,`protocol`,`authority`,`userInfo`,`user`,`password`,`host`,`port`,`relative`,`path`,`directory`,`file`,`query`,`anchor`];function E(e){if(e.length>8e3)throw`URI too long`;let t=e,n=e.indexOf(`[`),r=e.indexOf(`]`);n!=-1&&r!=-1&&(e=e.substring(0,n)+e.substring(n,r).replace(/:/g,`;`)+e.substring(r,e.length));let i=Ue.exec(e||``),a={},o=14;for(;o--;)a[We[o]]=i[o]||``;return n!=-1&&r!=-1&&(a.source=t,a.host=a.host.substring(1,a.host.length-1).replace(/;/g,`:`),a.authority=a.authority.replace(`[`,``).replace(`]`,``).replace(/;/g,`:`),a.ipv6uri=!0),a.pathNames=Ge(a,a.path),a.queryKey=Ke(a,a.query),a}function Ge(e,t){let n=t.replace(/\/{2,9}/g,`/`).split(`/`);return(t.slice(0,1)==`/`||t.length===0)&&n.splice(0,1),t.slice(-1)==`/`&&n.splice(n.length-1,1),n}function Ke(e,t){let n={};return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(e,t,r){t&&(n[t]=r)}),n}var D=typeof addEventListener==`function`&&typeof removeEventListener==`function`,O=[];D&&addEventListener(`offline`,()=>{O.forEach(e=>e())},!1);var k=class e extends y{constructor(e,t){if(super(),this.binaryType=be,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e==`object`&&(t=e,e=null),e){let n=E(e);t.hostname=n.host,t.secure=n.protocol===`https`||n.protocol===`wss`,t.port=n.port,n.query&&(t.query=n.query)}else t.host&&(t.hostname=E(t.host).host);S(this,t),this.secure=t.secure==null?typeof location<`u`&&location.protocol===`https:`:t.secure,t.hostname&&!t.port&&(t.port=this.secure?`443`:`80`),this.hostname=t.hostname||(typeof location<`u`?location.hostname:`localhost`),this.port=t.port||(typeof location<`u`&&location.port?location.port:this.secure?`443`:`80`),this.transports=[],this._transportsByName={},t.transports.forEach(e=>{let t=e.prototype.name;this.transports.push(t),this._transportsByName[t]=e}),this.opts=Object.assign({path:`/engine.io`,agent:!1,withCredentials:!1,upgrade:!0,timestampParam:`t`,rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},t),this.opts.path=this.opts.path.replace(/\/$/,``)+(this.opts.addTrailingSlash?`/`:``),typeof this.opts.query==`string`&&(this.opts.query=ke(this.opts.query)),D&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener(`beforeunload`,this._beforeunloadEventListener,!1)),this.hostname!==`localhost`&&(this._offlineEventListener=()=>{this._onClose(`transport close`,{description:`network connection lost`})},O.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){let t=Object.assign({},this.opts.query);t.EIO=4,t.transport=e,this.id&&(t.sid=this.id);let n=Object.assign({},this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](n)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved(`error`,`No transports available`)},0);return}let t=this.opts.rememberUpgrade&&e.priorWebsocketSuccess&&this.transports.indexOf(`websocket`)!==-1?`websocket`:this.transports[0];this.readyState=`opening`;let n=this.createTransport(t);n.open(),this.setTransport(n)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on(`drain`,this._onDrain.bind(this)).on(`packet`,this._onPacket.bind(this)).on(`error`,this._onError.bind(this)).on(`close`,e=>this._onClose(`transport close`,e))}onOpen(){this.readyState=`open`,e.priorWebsocketSuccess=this.transport.name===`websocket`,this.emitReserved(`open`),this.flush()}_onPacket(e){if(this.readyState===`opening`||this.readyState===`open`||this.readyState===`closing`)switch(this.emitReserved(`packet`,e),this.emitReserved(`heartbeat`),e.type){case`open`:this.onHandshake(JSON.parse(e.data));break;case`ping`:this._sendPacket(`pong`),this.emitReserved(`ping`),this.emitReserved(`pong`),this._resetPingTimeout();break;case`error`:let t=Error(`server error`);t.code=e.data,this._onError(t);break;case`message`:this.emitReserved(`data`,e.data),this.emitReserved(`message`,e.data);break}}onHandshake(e){this.emitReserved(`handshake`,e),this.id=e.sid,this.transport.query.sid=e.sid,this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!==`closed`&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);let e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose(`ping timeout`)},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved(`drain`):this.flush()}flush(){if(this.readyState!==`closed`&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){let e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved(`flush`)}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name===`polling`&&this.writeBuffer.length>1))return this.writeBuffer;let e=1;for(let t=0;t<this.writeBuffer.length;t++){let n=this.writeBuffer[t].data;if(n&&(e+=Te(n)),t>0&&e>this._maxPayload)return this.writeBuffer.slice(0,t);e+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;let e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,b(()=>{this._onClose(`ping timeout`)},this.setTimeoutFn)),e}write(e,t,n){return this._sendPacket(`message`,e,t,n),this}send(e,t,n){return this._sendPacket(`message`,e,t,n),this}_sendPacket(e,t,n,r){if(typeof t==`function`&&(r=t,t=void 0),typeof n==`function`&&(r=n,n=null),this.readyState===`closing`||this.readyState===`closed`)return;n||={},n.compress=!1!==n.compress;let i={type:e,data:t,options:n};this.emitReserved(`packetCreate`,i),this.writeBuffer.push(i),r&&this.once(`flush`,r),this.flush()}close(){let e=()=>{this._onClose(`forced close`),this.transport.close()},t=()=>{this.off(`upgrade`,t),this.off(`upgradeError`,t),e()},n=()=>{this.once(`upgrade`,t),this.once(`upgradeError`,t)};return(this.readyState===`opening`||this.readyState===`open`)&&(this.readyState=`closing`,this.writeBuffer.length?this.once(`drain`,()=>{this.upgrading?n():e()}):this.upgrading?n():e()),this}_onError(t){if(e.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState===`opening`)return this.transports.shift(),this._open();this.emitReserved(`error`,t),this._onClose(`transport error`,t)}_onClose(e,t){if(this.readyState===`opening`||this.readyState===`open`||this.readyState===`closing`){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners(`close`),this.transport.close(),this.transport.removeAllListeners(),D&&(this._beforeunloadEventListener&&removeEventListener(`beforeunload`,this._beforeunloadEventListener,!1),this._offlineEventListener)){let e=O.indexOf(this._offlineEventListener);e!==-1&&O.splice(e,1)}this.readyState=`closed`,this.id=null,this.emitReserved(`close`,e,t),this.writeBuffer=[],this._prevBufferLen=0}}};k.protocol=4;var qe=class extends k{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState===`open`&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_probe(e){let t=this.createTransport(e),n=!1;k.priorWebsocketSuccess=!1;let r=()=>{n||(t.send([{type:`ping`,data:`probe`}]),t.once(`packet`,e=>{if(!n)if(e.type===`pong`&&e.data===`probe`){if(this.upgrading=!0,this.emitReserved(`upgrading`,t),!t)return;k.priorWebsocketSuccess=t.name===`websocket`,this.transport.pause(()=>{n||this.readyState!==`closed`&&(l(),this.setTransport(t),t.send([{type:`upgrade`}]),this.emitReserved(`upgrade`,t),t=null,this.upgrading=!1,this.flush())})}else{let e=Error(`probe error`);e.transport=t.name,this.emitReserved(`upgradeError`,e)}}))};function i(){n||(n=!0,l(),t.close(),t=null)}let a=e=>{let n=Error(`probe error: `+e);n.transport=t.name,i(),this.emitReserved(`upgradeError`,n)};function o(){a(`transport closed`)}function s(){a(`socket closed`)}function c(e){t&&e.name!==t.name&&i()}let l=()=>{t.removeListener(`open`,r),t.removeListener(`error`,a),t.removeListener(`close`,o),this.off(`close`,s),this.off(`upgrading`,c)};t.once(`open`,r),t.once(`error`,a),t.once(`close`,o),this.once(`close`,s),this.once(`upgrading`,c),this._upgrades.indexOf(`webtransport`)!==-1&&e!==`webtransport`?this.setTimeoutFn(()=>{n||t.open()},200):t.open()}onHandshake(e){this._upgrades=this._filterUpgrades(e.upgrades),super.onHandshake(e)}_filterUpgrades(e){let t=[];for(let n=0;n<e.length;n++)~this.transports.indexOf(e[n])&&t.push(e[n]);return t}},Je=class extends qe{constructor(e,t={}){let n=typeof e==`object`?e:t;(!n.transports||n.transports&&typeof n.transports[0]==`string`)&&(n.transports=(n.transports||[`polling`,`websocket`,`webtransport`]).map(e=>He[e]).filter(e=>!!e)),super(e,n)}};Je.protocol;function Ye(e,t=``,n){let r=e;n||=typeof location<`u`&&location,e??=n.protocol+`//`+n.host,typeof e==`string`&&(e.charAt(0)===`/`&&(e=e.charAt(1)===`/`?n.protocol+e:n.host+e),/^(https?|wss?):\/\//.test(e)||(e=n===void 0?`https://`+e:n.protocol+`//`+e),r=E(e)),r.port||(/^(http|ws)$/.test(r.protocol)?r.port=`80`:/^(http|ws)s$/.test(r.protocol)&&(r.port=`443`)),r.path=r.path||`/`;let i=r.host.indexOf(`:`)===-1?r.host:`[`+r.host+`]`;return r.id=r.protocol+`://`+i+`:`+r.port+t,r.href=r.protocol+`://`+i+(n&&n.port===r.port?``:`:`+r.port),r}var Xe=typeof ArrayBuffer==`function`,Ze=e=>typeof ArrayBuffer.isView==`function`?ArrayBuffer.isView(e):e.buffer instanceof ArrayBuffer,Qe=Object.prototype.toString,$e=typeof Blob==`function`||typeof Blob<`u`&&Qe.call(Blob)===`[object BlobConstructor]`,et=typeof File==`function`||typeof File<`u`&&Qe.call(File)===`[object FileConstructor]`;function A(e){return Xe&&(e instanceof ArrayBuffer||Ze(e))||$e&&e instanceof Blob||et&&e instanceof File}function j(e,t){if(!e||typeof e!=`object`)return!1;if(Array.isArray(e)){for(let t=0,n=e.length;t<n;t++)if(j(e[t]))return!0;return!1}if(A(e))return!0;if(e.toJSON&&typeof e.toJSON==`function`&&arguments.length===1)return j(e.toJSON(),!0);for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&j(e[t]))return!0;return!1}function tt(e){let t=[],n=e.data,r=e;return r.data=M(n,t),r.attachments=t.length,{packet:r,buffers:t}}function M(e,t){if(!e)return e;if(A(e)){let n={_placeholder:!0,num:t.length};return t.push(e),n}else if(Array.isArray(e)){let n=Array(e.length);for(let r=0;r<e.length;r++)n[r]=M(e[r],t);return n}else if(typeof e==`object`&&!(e instanceof Date)){let n={};for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=M(e[r],t));return n}return e}function nt(e,t){return e.data=N(e.data,t),delete e.attachments,e}function N(e,t){if(!e)return e;if(e&&e._placeholder===!0){if(typeof e.num==`number`&&e.num>=0&&e.num<t.length)return t[e.num];throw Error(`illegal attachments`)}else if(Array.isArray(e))for(let n=0;n<e.length;n++)e[n]=N(e[n],t);else if(typeof e==`object`)for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&(e[n]=N(e[n],t));return e}var rt=s({Decoder:()=>ot,Encoder:()=>at,PacketType:()=>P,isPacketValid:()=>ft,protocol:()=>5}),it=[`connect`,`connect_error`,`disconnect`,`disconnecting`,`newListener`,`removeListener`],P;(function(e){e[e.CONNECT=0]=`CONNECT`,e[e.DISCONNECT=1]=`DISCONNECT`,e[e.EVENT=2]=`EVENT`,e[e.ACK=3]=`ACK`,e[e.CONNECT_ERROR=4]=`CONNECT_ERROR`,e[e.BINARY_EVENT=5]=`BINARY_EVENT`,e[e.BINARY_ACK=6]=`BINARY_ACK`})(P||={});var at=class{constructor(e){this.replacer=e}encode(e){return(e.type===P.EVENT||e.type===P.ACK)&&j(e)?this.encodeAsBinary({type:e.type===P.EVENT?P.BINARY_EVENT:P.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let t=``+e.type;return(e.type===P.BINARY_EVENT||e.type===P.BINARY_ACK)&&(t+=e.attachments+`-`),e.nsp&&e.nsp!==`/`&&(t+=e.nsp+`,`),e.id!=null&&(t+=e.id),e.data!=null&&(t+=JSON.stringify(e.data,this.replacer)),t}encodeAsBinary(e){let t=tt(e),n=this.encodeAsString(t.packet),r=t.buffers;return r.unshift(n),r}},ot=class e extends y{constructor(e){super(),this.opts=Object.assign({reviver:void 0,maxAttachments:10},typeof e==`function`?{reviver:e}:e)}add(e){let t;if(typeof e==`string`){if(this.reconstructor)throw Error(`got plaintext data when reconstructing a packet`);t=this.decodeString(e);let n=t.type===P.BINARY_EVENT;n||t.type===P.BINARY_ACK?(t.type=n?P.EVENT:P.ACK,this.reconstructor=new st(t),t.attachments===0&&super.emitReserved(`decoded`,t)):super.emitReserved(`decoded`,t)}else if(A(e)||e.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(e),t&&(this.reconstructor=null,super.emitReserved(`decoded`,t));else throw Error(`got binary data when not reconstructing a packet`);else throw Error(`Unknown type: `+e)}decodeString(t){let n=0,r={type:Number(t.charAt(0))};if(P[r.type]===void 0)throw Error(`unknown packet type `+r.type);if(r.type===P.BINARY_EVENT||r.type===P.BINARY_ACK){let e=n+1;for(;t.charAt(++n)!==`-`&&n!=t.length;);let i=t.substring(e,n);if(i!=Number(i)||t.charAt(n)!==`-`)throw Error(`Illegal attachments`);let a=Number(i);if(!lt(a)||a<0)throw Error(`Illegal attachments`);if(a>this.opts.maxAttachments)throw Error(`too many attachments`);r.attachments=a}if(t.charAt(n+1)===`/`){let e=n+1;for(;++n&&!(t.charAt(n)===`,`||n===t.length););r.nsp=t.substring(e,n)}else r.nsp=`/`;let i=t.charAt(n+1);if(i!==``&&Number(i)==i){let e=n+1;for(;++n;){let e=t.charAt(n);if(e==null||Number(e)!=e){--n;break}if(n===t.length)break}r.id=Number(t.substring(e,n+1))}if(t.charAt(++n)){let i=this.tryParse(t.substr(n));if(e.isPayloadValid(r.type,i))r.data=i;else throw Error(`invalid payload`)}return r}tryParse(e){try{return JSON.parse(e,this.opts.reviver)}catch{return!1}}static isPayloadValid(e,t){switch(e){case P.CONNECT:return F(t);case P.DISCONNECT:return t===void 0;case P.CONNECT_ERROR:return typeof t==`string`||F(t);case P.EVENT:case P.BINARY_EVENT:return Array.isArray(t)&&(typeof t[0]==`number`||typeof t[0]==`string`&&it.indexOf(t[0])===-1);case P.ACK:case P.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&=(this.reconstructor.finishedReconstruction(),null)}},st=class{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){let e=nt(this.reconPack,this.buffers);return this.finishedReconstruction(),e}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}};function ct(e){return typeof e==`string`}var lt=Number.isInteger||function(e){return typeof e==`number`&&isFinite(e)&&Math.floor(e)===e};function ut(e){return e===void 0||lt(e)}function F(e){return Object.prototype.toString.call(e)===`[object Object]`}function dt(e,t){switch(e){case P.CONNECT:return t===void 0||F(t);case P.DISCONNECT:return t===void 0;case P.EVENT:return Array.isArray(t)&&(typeof t[0]==`number`||typeof t[0]==`string`&&it.indexOf(t[0])===-1);case P.ACK:return Array.isArray(t);case P.CONNECT_ERROR:return typeof t==`string`||F(t);default:return!1}}function ft(e){return ct(e.nsp)&&ut(e.id)&&dt(e.type,e.data)}function I(e,t,n){return e.on(t,n),function(){e.off(t,n)}}var pt=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1}),mt=class extends y{constructor(e,t,n){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=t,n&&n.auth&&(this.auth=n.auth),this._opts=Object.assign({},n),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;let e=this.io;this.subs=[I(e,`open`,this.onopen.bind(this)),I(e,`packet`,this.onpacket.bind(this)),I(e,`error`,this.onerror.bind(this)),I(e,`close`,this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState===`open`&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift(`message`),this.emit.apply(this,e),this}emit(e,...t){if(pt.hasOwnProperty(e))throw Error(`"`+e.toString()+`" is a reserved event name`);if(t.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(t),this;let n={type:P.EVENT,data:t};if(n.options={},n.options.compress=this.flags.compress!==!1,typeof t[t.length-1]==`function`){let e=this.ids++,r=t.pop();this._registerAckCallback(e,r),n.id=e}let r=this.io.engine?.transport?.writable,i=this.connected&&!this.io.engine?._hasPingExpired();return this.flags.volatile&&!r||(i?(this.notifyOutgoingListeners(n),this.packet(n)):this.sendBuffer.push(n)),this.flags={},this}_registerAckCallback(e,t){let n=this.flags.timeout??this._opts.ackTimeout;if(n===void 0){this.acks[e]=t;return}let r=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let t=0;t<this.sendBuffer.length;t++)this.sendBuffer[t].id===e&&this.sendBuffer.splice(t,1);t.call(this,Error(`operation has timed out`))},n),i=(...e)=>{this.io.clearTimeoutFn(r),t.apply(this,e)};i.withError=!0,this.acks[e]=i}emitWithAck(e,...t){return new Promise((n,r)=>{let i=(e,t)=>e?r(e):n(t);i.withError=!0,t.push(i),this.emit(e,...t)})}_addToQueue(e){let t;typeof e[e.length-1]==`function`&&(t=e.pop());let n={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((e,...r)=>(this._queue[0],e===null?(this._queue.shift(),t&&t(null,...r)):n.tryCount>this._opts.retries&&(this._queue.shift(),t&&t(e)),n.pending=!1,this._drainQueue())),this._queue.push(n),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;let t=this._queue[0];t.pending&&!e||(t.pending=!0,t.tryCount++,this.flags=t.flags,this.emit.apply(this,t.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth==`function`?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:P.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved(`connect_error`,e)}onclose(e,t){this.connected=!1,delete this.id,this.emitReserved(`disconnect`,e,t),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(t=>String(t.id)===e)){let t=this.acks[e];delete this.acks[e],t.withError&&t.call(this,Error(`socket has been disconnected`))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case P.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved(`connect_error`,Error(`It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)`));break;case P.EVENT:case P.BINARY_EVENT:this.onevent(e);break;case P.ACK:case P.BINARY_ACK:this.onack(e);break;case P.DISCONNECT:this.ondisconnect();break;case P.CONNECT_ERROR:this.destroy();let t=Error(e.data.message);t.data=e.data.data,this.emitReserved(`connect_error`,t);break}}onevent(e){let t=e.data||[];e.id!=null&&t.push(this.ack(e.id)),this.connected?this.emitEvent(t):this.receiveBuffer.push(Object.freeze(t))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){let t=this._anyListeners.slice();for(let n of t)n.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]==`string`&&(this._lastOffset=e[e.length-1])}ack(e){let t=this,n=!1;return function(...r){n||(n=!0,t.packet({type:P.ACK,id:e,data:r}))}}onack(e){let t=this.acks[e.id];typeof t==`function`&&(delete this.acks[e.id],t.withError&&e.data.unshift(null),t.apply(this,e.data))}onconnect(e,t){this.id=e,this.recovered=t&&this._pid===t,this._pid=t,this.connected=!0,this.emitBuffered(),this._drainQueue(!0),this.emitReserved(`connect`)}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose(`io server disconnect`)}destroy(){this.subs&&=(this.subs.forEach(e=>e()),void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:P.DISCONNECT}),this.destroy(),this.connected&&this.onclose(`io client disconnect`),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){let t=this._anyListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){let t=this._anyOutgoingListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){let t=this._anyOutgoingListeners.slice();for(let n of t)n.apply(this,e.data)}}};function L(e){e||={},this.ms=e.min||100,this.max=e.max||1e4,this.factor=e.factor||2,this.jitter=e.jitter>0&&e.jitter<=1?e.jitter:0,this.attempts=0}L.prototype.duration=function(){var e=this.ms*this.factor**+ this.attempts++;if(this.jitter){var t=Math.random(),n=Math.floor(t*this.jitter*e);e=Math.floor(t*10)&1?e+n:e-n}return Math.min(e,this.max)|0},L.prototype.reset=function(){this.attempts=0},L.prototype.setMin=function(e){this.ms=e},L.prototype.setMax=function(e){this.max=e},L.prototype.setJitter=function(e){this.jitter=e};var R=class extends y{constructor(e,t){super(),this.nsps={},this.subs=[],e&&typeof e==`object`&&(t=e,e=void 0),t||={},t.path=t.path||`/socket.io`,this.opts=t,S(this,t),this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor(t.randomizationFactor??.5),this.backoff=new L({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState=`closed`,this.uri=e;let n=t.parser||rt;this.encoder=new n.Encoder,this.decoder=new n.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var t;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(t=this.backoff)==null||t.setMin(e),this)}randomizationFactor(e){var t;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(t=this.backoff)==null||t.setJitter(e),this)}reconnectionDelayMax(e){var t;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(t=this.backoff)==null||t.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf(`open`))return this;this.engine=new Je(this.uri,this.opts);let t=this.engine,n=this;this._readyState=`opening`,this.skipReconnect=!1;let r=I(t,`open`,function(){n.onopen(),e&&e()}),i=t=>{this.cleanup(),this._readyState=`closed`,this.emitReserved(`error`,t),e?e(t):this.maybeReconnectOnOpen()},a=I(t,`error`,i);if(!1!==this._timeout){let e=this._timeout,n=this.setTimeoutFn(()=>{r(),i(Error(`timeout`)),t.close()},e);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}return this.subs.push(r),this.subs.push(a),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState=`open`,this.emitReserved(`open`);let e=this.engine;this.subs.push(I(e,`ping`,this.onping.bind(this)),I(e,`data`,this.ondata.bind(this)),I(e,`error`,this.onerror.bind(this)),I(e,`close`,this.onclose.bind(this)),I(this.decoder,`decoded`,this.ondecoded.bind(this)))}onping(){this.emitReserved(`ping`)}ondata(e){try{this.decoder.add(e)}catch(e){this.onclose(`parse error`,e)}}ondecoded(e){b(()=>{this.emitReserved(`packet`,e)},this.setTimeoutFn)}onerror(e){this.emitReserved(`error`,e)}socket(e,t){let n=this.nsps[e];return n?this._autoConnect&&!n.active&&n.connect():(n=new mt(this,e,t),this.nsps[e]=n),n}_destroy(e){let t=Object.keys(this.nsps);for(let e of t)if(this.nsps[e].active)return;this._close()}_packet(e){let t=this.encoder.encode(e);for(let n=0;n<t.length;n++)this.engine.write(t[n],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose(`forced close`)}disconnect(){return this._close()}onclose(e,t){var n;this.cleanup(),(n=this.engine)==null||n.close(),this.backoff.reset(),this._readyState=`closed`,this.emitReserved(`close`,e,t),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;let e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved(`reconnect_failed`),this._reconnecting=!1;else{let t=this.backoff.duration();this._reconnecting=!0;let n=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved(`reconnect_attempt`,e.backoff.attempts),!e.skipReconnect&&e.open(t=>{t?(e._reconnecting=!1,e.reconnect(),this.emitReserved(`reconnect_error`,t)):e.onreconnect()}))},t);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}}onreconnect(){let e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved(`reconnect`,e)}},z={};function B(e,t){typeof e==`object`&&(t=e,e=void 0),t||={};let n=Ye(e,t.path||`/socket.io`),r=n.source,i=n.id,a=n.path,o=z[i]&&a in z[i].nsps,s=t.forceNew||t[`force new connection`]||!1===t.multiplex||o,c;return s?c=new R(r,t):(z[i]||(z[i]=new R(r,t)),c=z[i]),n.query&&!t.query&&(t.query=n.queryKey),c.socket(n.path,t)}Object.assign(B,{Manager:R,Socket:mt,io:B,connect:B});var V=null;function ht(){V=B(`http://localhost:3000`,{transports:[`websocket`,`polling`],reconnectionAttempts:5});let e=d.getState();return V.on(`connect`,()=>{e.setMyId(V.id),console.log(`[socket] connected:`,V.id)}),V.on(`disconnect`,e=>console.warn(`[socket] disconnected:`,e)),V.on(`room:joined`,({roomId:t,players:n,mapSeed:r})=>{e.setRoom(t,n),e.setMap(r),e.setPhase(`playing`),gt()}),V.on(`room:players`,e=>d.setState({roomPlayers:e})),V.on(`error`,({msg:e})=>_t(e,`error`)),V.on(`state:full`,({colonies:t,projectiles:n,foodShapes:r,clouds:i,predators:a})=>{e.setColonies(t);let o=t[V.id];o&&e.updateColony(o),d.setState({projectiles:n||[],foodShapes:r||[],clouds:i||[],predators:a||[]})}),V.on(`state:delta`,t=>{let n=t.colonies||t;e.setColonies(n);let r=n[V.id];r&&(e.updateColony(r),e.updateResources(r.resources)),d.setState({projectiles:t.projectiles||[],foodShapes:t.foodShapes||[],clouds:t.clouds||[],predators:t.predators||[]})}),V.on(`day:cycle`,({phase:t})=>{e.setDayCycle(t),_t(t===`night`?`🌙 Night falls! Apex Predators emerge!`:`☀️ Dawn breaks. Predators retreat.`,`info`)}),V.on(`kill:feed`,t=>e.addKill(t)),V.on(`game:over`,({winner:t,winnerName:n})=>{e.setPhase(`gameover`),vt(t===V.id,n)}),V}var H={createRoom:e=>V?.emit(`room:create`,e),joinRoom:e=>V?.emit(`room:join`,{roomId:e}),quickJoin:e=>V?.emit(`room:quickjoin`,{name:e}),moveAnts:(e,t)=>V?.emit(`ants:move`,{antIds:e,target:t}),recruitAnt:e=>V?.emit(`ant:recruit`,{caste:e}),buildChamber:(e,t)=>V?.emit(`chamber:build`,{type:e,position:t}),attackTarget:(e,t)=>V?.emit(`ants:attack`,{antIds:e,targetId:t}),sendChat:e=>V?.emit(`chat`,{msg:e}),sendPlayerInput:e=>V?.emit(`player:input`,e),upgradeStat:e=>V?.emit(`player:upgrade-stat`,{stat:e}),evolve:e=>V?.emit(`player:evolve`,{className:e})};function U(){return V}function gt(){let e=document.getElementById(`lobby-screen`);e&&(e.style.display=`none`)}function _t(e,t=`info`){let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.textContent=e,n.appendChild(r),setTimeout(()=>r.classList.add(`toast-show`),10),setTimeout(()=>{r.classList.remove(`toast-show`),setTimeout(()=>r.remove(),400)},3e3)}function vt(e,t){let n=document.getElementById(`gameover-screen`);n&&(n.style.display=`flex`,document.getElementById(`gameover-title`).textContent=e?`COLONY TRIUMPHANT`:`COLONY FALLEN`,document.getElementById(`gameover-sub`).textContent=e?`Your queen reigns supreme over all territories.`:`${t||`Another colony`} consumed the last of your forces.`)}var yt=2048,W=null,G=null,K=1.5,q={w:!1,a:!1,s:!1,d:!1,shift:!1},bt=0,xt=0,St=0,Ct=0,J=!1,Y=!1;function wt(e,t){W=e,G=t;let n=e.canvas;n.addEventListener(`wheel`,e=>{e.preventDefault();let t=n.getBoundingClientRect(),r=e.clientX-t.left,i=e.clientY-t.top,a=(r-G.x)/K,o=(i-G.y)/K,s=e.deltaY<0?1.1:.9;K=Math.max(.4,Math.min(3,K*s)),G.scale.x=K,G.scale.y=K,G.x=r-a*K,G.y=i-o*K,Dt()},{passive:!1}),window.addEventListener(`mousemove`,e=>{bt=e.clientX,xt=e.clientY}),n.addEventListener(`mousedown`,e=>{if(e.button===0){let{placingChamber:t}=d.getState();if(t){let r=n.getBoundingClientRect(),i=(e.clientX-r.left-G.x)/K,a=(e.clientY-r.top-G.y)/K;H.buildChamber(t,{x:i,y:a}),d.getState().setPlacingChamber(null),Ot(),At(e.clientX-r.left,e.clientY-r.top,`#fbbf24`)}else J=!0}}),window.addEventListener(`mouseup`,e=>{e.button===0&&(J=!1)}),n.addEventListener(`contextmenu`,e=>e.preventDefault()),window.addEventListener(`keydown`,e=>{let{phase:t}=d.getState();if(t!==`playing`)return;let n=e.key.toLowerCase();(n===`w`||e.key===`ArrowUp`)&&(q.w=!0),(n===`s`||e.key===`ArrowDown`)&&(q.s=!0),(n===`a`||e.key===`ArrowLeft`)&&(q.a=!0),(n===`d`||e.key===`ArrowRight`)&&(q.d=!0),e.key===`Shift`&&(q.shift=!0),n===`e`&&(Y=!Y,jt(Y?`⚙️ Auto-fire ENABLED`:`⚙️ Auto-fire DISABLED`,`info`)),e.key===`Escape`&&(d.getState().setPlacingChamber(null),Ot()),n===`b`&&kt(`hud-build`)}),window.addEventListener(`keyup`,e=>{let t=e.key.toLowerCase();(t===`w`||e.key===`ArrowUp`)&&(q.w=!1),(t===`s`||e.key===`ArrowDown`)&&(q.s=!1),(t===`a`||e.key===`ArrowLeft`)&&(q.a=!1),(t===`d`||e.key===`ArrowRight`)&&(q.d=!1),e.key===`Shift`&&(q.shift=!1)}),e.ticker.add(()=>{let{phase:e}=d.getState();if(e!==`playing`)return;let t=n.getBoundingClientRect(),r=bt-t.left,i=xt-t.top;St=(r-G.x)/K,Ct=(i-G.y)/K,H.sendPlayerInput({keys:q,mx:St,my:Ct,firing:J||Y,activeSkill:q.shift})})}function Tt(e,t,n){!W||!G||(K=n??1.5,G.scale.x=K,G.scale.y=K,G.x=W.screen.width/2-e*K,G.y=W.screen.height/2-t*K,Dt())}function Et(e){d.getState().setPlacingChamber(e),document.body.style.cursor=`crosshair`;let t=document.getElementById(`placement-hint`);t||(t=document.createElement(`div`),t.id=`placement-hint`,document.body.appendChild(t)),t.style.cssText=`
    position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
    background:rgba(251,191,36,0.12);border:0.5px solid rgba(251,191,36,0.5);
    border-radius:99px;padding:6px 20px;font-family:'Cinzel',serif;
    font-size:11px;letter-spacing:0.1em;color:#fbbf24;pointer-events:none;z-index:50;
  `,t.textContent=`Click inside your territory to deploy ${e.toUpperCase()} · Esc to cancel`}function Dt(){if(!W||!G)return;let e=W.screen.width-yt*K,t=W.screen.height-yt*K;G.x=Math.min(0,Math.max(e,G.x)),G.y=Math.min(0,Math.max(t,G.y))}function Ot(){document.body.style.cursor=`default`,document.getElementById(`placement-hint`)?.remove()}function kt(e){let t=document.getElementById(e);t&&(t.style.display=t.style.display===`none`?`flex`:`none`)}function At(e,t,n){if(!document.getElementById(`_rpl`)){let e=document.createElement(`style`);e.id=`_rpl`,e.textContent=`@keyframes _rpl{to{transform:scale(4);opacity:0}}`,document.head.appendChild(e)}let r=document.createElement(`div`);r.style.cssText=`
    position:fixed;left:${e}px;top:${t}px;
    width:14px;height:14px;margin:-7px;
    border:2px solid ${n};border-radius:50%;
    pointer-events:none;z-index:200;
    animation:_rpl 0.4s ease-out forwards;
  `,document.body.appendChild(r),setTimeout(()=>r.remove(),420)}function jt(e,t=`info`){let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.textContent=e,n.appendChild(r),setTimeout(()=>r.classList.add(`toast-show`),10),setTimeout(()=>{r.classList.remove(`toast-show`),setTimeout(()=>r.remove(),400)},2e3)}var X={};function Z(e,t){if(X[e]===t)return;X[e]=t;let n=document.getElementById(e);n&&(n.textContent=t)}function Mt(e,t,n){let r=e+t;if(X[r]===n)return;X[r]=n;let i=document.getElementById(e);i&&(i.style[t]=n)}function Nt(e){e.insertAdjacentHTML(`beforeend`,`
    <!-- Top-Left: Resources -->
    <div id="hud-resources" style="position:absolute;top:16px;left:16px;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:12px 18px;display:none;flex-direction:column;gap:6px;
      font-family:'Crimson Pro',serif;font-size:14px;min-width:160px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:4px">NEST RESOURCES</div>
      <div class="res-row"><span class="res-icon">🍃</span><span id="res-leaf">0</span><span class="res-label">Leaf Points</span></div>
      <div class="res-row"><span class="res-icon">🪲</span><span id="res-carapace">0</span><span class="res-label">Carapaces</span></div>
    </div>

    <!-- Top-Center: Day/Night cycle -->
    <div id="hud-daycycle" style="position:absolute;top:16px;left:50%;transform:translateX(-50%);
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:99px;
      padding:7px 22px;display:none;align-items:center;gap:12px;
      font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;
      box-shadow:0 6px 24px rgba(0,0,0,0.55);">
      <span id="day-icon">☀</span>
      <span id="day-label" style="color:#fbbf24">DAY</span>
      <div style="width:90px;height:4px;background:#1b1b22;border-radius:2px;overflow:hidden">
        <div id="day-bar" style="height:100%;background:#fbbf24;width:100%;border-radius:2px"></div>
      </div>
    </div>

    <!-- Top-Right: Controls button -->
    <button id="help-btn" style="position:absolute;top:16px;right:16px;display:none;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.3);border-radius:8px;
      color:#4ade80;font-family:'Cinzel',serif;font-size:11px;
      letter-spacing:0.1em;padding:7px 16px;cursor:pointer;
      transition:all 0.18s;box-shadow:0 4px 16px rgba(0,0,0,0.4);">? HOW TO PLAY</button>

    <!-- Top-Center-Below: Evolution choices panel (neon glassmorphic dropdown cards) -->
    <div id="hud-evolution" style="position:absolute;top:80px;left:50%;transform:translateX(-50%);
      display:none;flex-direction:column;align-items:center;gap:10px;z-index:90;">
      <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;
        letter-spacing:0.2em;color:#4ade80;text-shadow:0 0 10px rgba(74,222,128,0.6);
        background:rgba(10,10,14,0.9);backdrop-filter:blur(8px);
        padding:4px 20px;border-radius:99px;border:0.5px solid rgba(74,222,128,0.2)">
        ▲ EVOLUTION CHOOSE AN ANT CLASS ▲
      </div>
      <div id="evolve-cards-list" style="display:flex;gap:16px;justify-content:center;"></div>
    </div>

    <!-- Bottom-Left: Glassmorphic Stat Upgrade Sidebar -->
    <div id="hud-stats-panel" style="position:absolute;bottom:100px;left:16px;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:14px 18px;display:none;flex-direction:column;gap:10px;
      font-family:'Crimson Pro',serif;min-width:210px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:2px">
        ANT STAT UPGRADES <span id="stat-points-avail" style="float:right;color:#fbbf24;font-weight:700;"></span>
      </div>
      <div class="stat-upgrade-row" data-stat="regen">
        <span class="stat-lbl">🩹 Regen</span>
        <div class="stat-blocks" id="blocks-regen"></div>
        <button class="stat-add-btn" id="btn-add-regen">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="maxHp">
        <span class="stat-lbl">❤️ Health</span>
        <div class="stat-blocks" id="blocks-maxHp"></div>
        <button class="stat-add-btn" id="btn-add-maxHp">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="speed">
        <span class="stat-lbl">💨 Speed</span>
        <div class="stat-blocks" id="blocks-speed"></div>
        <button class="stat-add-btn" id="btn-add-speed">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="damage">
        <span class="stat-lbl">💥 Damage</span>
        <div class="stat-blocks" id="blocks-damage"></div>
        <button class="stat-add-btn" id="btn-add-damage">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="bulletSpeed">
        <span class="stat-lbl">🚀 Range</span>
        <div class="stat-blocks" id="blocks-bulletSpeed"></div>
        <button class="stat-add-btn" id="btn-add-bulletSpeed">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="reload">
        <span class="stat-lbl">⏱️ Reload</span>
        <div class="stat-blocks" id="blocks-reload"></div>
        <button class="stat-add-btn" id="btn-add-reload">+</button>
      </div>
    </div>

    <!-- Bottom-Center: Sleek XP and Level indicators -->
    <div id="hud-level-bar" style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:10px;
      padding:10px 24px;display:none;align-items:center;gap:14px;
      min-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.65);">
      <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#e8e6d9;">
        LVL <span id="hud-lvl-val">1</span>
      </div>
      <div style="flex:1;height:6px;background:#1b1b22;border-radius:3px;overflow:hidden;position:relative;">
        <div id="hud-xp-fill" style="height:100%;background:linear-gradient(to right, #4ade80, #34d399);width:0%;border-radius:3px;transition:width 0.4s ease;"></div>
      </div>
      <div style="font-family:monospace;font-size:11px;color:#9ca38f;">
        <span id="hud-xp-val">0</span> / <span id="hud-xp-max">40</span> XP
      </div>
    </div>

    <!-- Bottom-Center-Above: Nest deploy buttons (RTS-IO elements) -->
    <div id="hud-build" style="position:absolute;bottom:76px;left:50%;transform:translateX(-50%);
      display:none;gap:8px;align-items:center;">
      <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.18em;
        color:#4ade80;margin-right:6px;text-align:right;">NEST DEPLOY<br><span style="color:#6b6b5a;font-size:7px;">(B KEY)</span></div>
      ${$(`nursery`,`🥚`,`Nursery`,`50🍃`,`Larva Swarm Nest - breeds AI follower drones`)}
      ${$(`granary`,`🌾`,`Granary`,`25🍃`,`Sustenance depot - slowly heals allies`)}
      ${$(`barracks`,`⚔️`,`Barracks`,`40🍃`,`Shield wall - blocks and damages enemies`)}
      ${$(`tunnel`,`🕳`,`Tunnel`,`30🍃`,`Warp Portal & auto-turret`)}
    </div>

    <!-- Top-Right-Below: Kill feed -->
    <div id="hud-killfeed" style="position:absolute;top:58px;right:16px;
      display:none;flex-direction:column;gap:4px;max-width:260px;
      font-family:'Crimson Pro',serif;font-size:12px;"></div>

    <!-- Toast container -->
    <div id="toast-container" style="position:absolute;bottom:145px;left:50%;
      transform:translateX(-50%);display:flex;flex-direction:column;
      gap:6px;align-items:center;pointer-events:none;"></div>

    <!-- Controls modal (Refined top-down shooter guide) -->
    <div id="controls-modal" style="position:fixed;inset:0;z-index:180;display:none;
      align-items:center;justify-content:center;
      background:rgba(5,5,8,0.85);backdrop-filter:blur(8px);">
      <div style="background:#0a0a0f;border:0.5px solid rgba(74,222,128,0.3);
        border-radius:16px;padding:2.2rem 2.8rem;max-width:500px;width:92%;
        font-family:'Crimson Pro',serif;max-height:86vh;overflow-y:auto;
        box-shadow:0 12px 48px rgba(0,0,0,0.8);">
        <div style="font-family:'Cinzel',serif;font-size:1.15rem;font-weight:700;
          letter-spacing:0.18em;color:#4ade80;margin-bottom:1.5rem;text-align:center;
          text-shadow:0 0 10px rgba(74,222,128,0.4)">ANTIVUS SHOOTER GUIDE</div>

        <div class="ctrl-s">MOVEMENT & AIMING</div>
        <div class="ctrl-r"><span class="ctrl-k">W, A, S, D</span><span class="ctrl-d">Directly move your Ant</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Mouse Move</span><span class="ctrl-d">Aim your chemical acid/needles</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Left Click</span><span class="ctrl-d">Hold to continuously shoot</span></div>
        <div class="ctrl-r"><span class="ctrl-k">E Key</span><span class="ctrl-d">Toggle Continuous Auto-Fire</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Shift Key</span><span class="ctrl-d">Active Class Skill (e.g. Dash / Poison clouds)</span></div>

        <div class="ctrl-s" style="margin-top:1.2rem">LEVELING & STAT UPGRADES</div>
        <p class="ctrl-note">Shoot wild **food shapes** (Leaf Chunks 🍃, Sugar Crystals 🌾) or defeat enemy ants to gain XP. Leveling up grants stat points. Click '[+]' in the bottom-left to upgrade your ant's Regen, Health, Speed, Damage, Range, and Reload!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">EVOLUTION TIER DROPDOWN</div>
        <p class="ctrl-note">At **Level 5** and **Level 15**, choose your specialized class from the evolution panel! Upgrade into heavy Soldier biting tanks, fast Scouts, range Snipers, or healing Farmers!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">PHEROMONE TURF CONTROL ( turf war )</div>
        <p class="ctrl-note">Walking paints the tiles with your colony's color. Friendly ants running on your color get **+35% Speed & high regen**! Enemies stepping on your color are **slowed by 25%**.</p>

        <div class="ctrl-s" style="margin-top:1.2rem">NIGHT SURVIVAL BOSS EVENTS</div>
        <p class="ctrl-note">At Night, the arena goes dark and spotlights fade in. Glowing neon **Giant Wolf Spiders** spawn and hunt players. Team up or fortify your nest to survive!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">NEST CHAMBER DEPLOY (B KEY)</div>
        <div class="ctrl-r"><span class="ctrl-k">🥚 Nursery</span><span class="ctrl-d">Spawns mini AI drone-ants that protect you</span></div>
        <div class="ctrl-r"><span class="ctrl-k">🕳 Tunnel</span><span class="ctrl-d">Shoots acid turrets and acts as a warp portal</span></div>
        <div class="ctrl-r"><span class="ctrl-k">⚔️ Barracks</span><span class="ctrl-d">High-HP shield barricade dealing touch damage</span></div>

        <button id="close-controls" style="margin-top:1.8rem;width:100%;padding:0.75rem;
          background:#4ade80;color:#070705;border:none;border-radius:8px;
          font-family:'Cinzel',serif;font-size:0.8rem;font-weight:700;
          letter-spacing:0.12em;cursor:pointer;transition:all 0.18s;
          box-shadow:0 4px 12px rgba(74,222,128,0.35);">GOT IT</button>
      </div>
    </div>

    <!-- Game over -->
    <div id="gameover-screen" style="position:fixed;inset:0;z-index:200;
      background:rgba(5,5,8,0.96);backdrop-filter:blur(16px);
      display:none;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;">
      <div id="gameover-title" style="font-family:'Cinzel',serif;font-size:2.8rem;
        font-weight:800;color:#4ade80;letter-spacing:0.18em;text-shadow:0 0 20px rgba(74,222,128,0.4);text-align:center;"></div>
      <div id="gameover-sub" style="font-family:'Crimson Pro',serif;font-size:1.15rem;
        color:#9ca38f;font-style:italic;text-align:center;max-width:440px;"></div>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.8rem 2.2rem;
        font-family:'Cinzel',serif;font-size:0.8rem;font-weight:700;
        letter-spacing:0.15em;background:#4ade80;color:#070705;
        border:none;border-radius:8px;cursor:pointer;box-shadow:0 6px 18px rgba(74,222,128,0.45);">RESPAWN NEW CLASS</button>
    </div>
  `),zt(),document.getElementById(`help-btn`).addEventListener(`click`,()=>{document.getElementById(`controls-modal`).style.display=`flex`}),document.getElementById(`close-controls`).addEventListener(`click`,()=>{document.getElementById(`controls-modal`).style.display=`none`}),document.getElementById(`controls-modal`).addEventListener(`click`,e=>{e.target===document.getElementById(`controls-modal`)&&(document.getElementById(`controls-modal`).style.display=`none`)}),document.querySelectorAll(`[data-build]`).forEach(e=>{e.addEventListener(`click`,()=>Et(e.dataset.build))}),[`regen`,`maxHp`,`speed`,`damage`,`bulletSpeed`,`reload`].forEach(e=>{let t=document.getElementById(`btn-add-${e}`);t&&t.addEventListener(`click`,()=>{H.upgradeStat(e)})}),d.subscribe(e=>{let{phase:t,colony:n,dayPhase:r,killFeed:i,myId:a}=e;if(t!==`playing`)return;Rt();let o=n.resources||{};Z(`res-leaf`,Math.floor(o.leaf??0)),Z(`res-carapace`,Math.floor(o.carapace??0)),Z(`hud-lvl-val`,n.level??1),Z(`hud-xp-val`,Math.round(n.xp??0));let s=40+(n.level??1)*10;Z(`hud-xp-max`,s),Mt(`hud-xp-fill`,`width`,Math.min(100,(n.xp??0)/s*100)+`%`),Pt(n),It(n);let c=r===`day`;Z(`day-icon`,c?`☀`:`🌙`),Z(`day-label`,c?`DAY`:`NIGHT`),Mt(`day-label`,`color`,c?`#fbbf24`:`#a78bfa`),Mt(`day-bar`,`background`,c?`#fbbf24`:`#a78bfa`);let l=document.getElementById(`hud-killfeed`),u=(i||[]).map(e=>`<div class="kill-entry">${e.text}</div>`).join(``);l&&l.innerHTML!==u&&(l.innerHTML=u)}),d.subscribe(e=>e.phase,e=>{e===`playing`&&setTimeout(()=>{localStorage.getItem(`antivus_shooter_seen`)||(document.getElementById(`controls-modal`).style.display=`flex`,localStorage.setItem(`antivus_shooter_seen`,`1`))},600)})}function Pt(e){let t=e.upgradePoints??0,n=document.getElementById(`stat-points-avail`);n&&(n.textContent=t>0?`(${t} PTS)`:``,n.style.color=t>0?`#fbbf24`:`#4ade80`);let r=e.stats||{};[`regen`,`maxHp`,`speed`,`damage`,`bulletSpeed`,`reload`].forEach(e=>{let n=r[e]??0,i=document.getElementById(`blocks-${e}`);if(i){let e=``;for(let t=1;t<=7;t++)e+=`<div class="stat-block-slot ${t<=n?`stat-block-filled`:`stat-block-empty`}"></div>`;i.innerHTML!==e&&(i.innerHTML=e)}let a=document.getElementById(`btn-add-${e}`);a&&(t>0&&n<7?a.style.display=`inline-flex`:a.style.display=`none`)})}var Q=``,Ft={soldier:{emoji:`⚔️`,title:`Soldier`,desc:`Heavy biting tank. Extreme HP, strong melee tusk spray.`,color:`#f87171`},scout:{emoji:`▲`,title:`Scout`,desc:`Super fast. Rapid fires poison needles. Active Dash (Shift).`,color:`#60a5fa`},ranger:{emoji:`✚`,title:`Ranger`,desc:`Long range. Heavy acid spitting blobs.`,color:`#34d399`},farmer:{emoji:`🍄`,title:`Farmer`,desc:`Honeydew healing droplets, high leaf income gathering aura.`,color:`#fb923c`},bombardier:{emoji:`💣`,title:`Bombardier`,desc:`Heavy chemical explosive spores. Explodes on death!`,color:`#ef4444`},weaver:{emoji:`🕸️`,title:`Weaver`,desc:`Fires sticky silk webs to trap targets. Build strong chambers.`,color:`#a78bfa`},bullet:{emoji:`🚀`,title:`Bullet Ant`,desc:`Single needle extremely high pierce damage. Rapid speed.`,color:`#38bdf8`},stinkbug:{emoji:`☣️`,title:`Stinkbug`,desc:`Defensive poison trails on Shift. Toxic HP-draining aura.`,color:`#c084fc`},acidgunner:{emoji:`🔫`,title:`Acid Gunner`,desc:`Fires three-way spreading chemical acid streams.`,color:`#4ade80`},sniper:{emoji:`🎯`,title:`Sniper Ant`,desc:`Fires ultra range needle spikes. High pierce damage.`,color:`#f43f5e`},cultivator:{emoji:`🌳`,title:`Cultivator`,desc:`Fires spores that grow toxic cloud fields. Deploy follower swarms.`,color:`#fb923c`}};function It(e){let t=e.level??1,n=e.class,r=[];t>=5&&t<15&&n===`worker`?r=[`soldier`,`scout`,`ranger`,`farmer`]:t>=15&&(n===`soldier`?r=[`bombardier`,`weaver`]:n===`scout`?r=[`bullet`,`stinkbug`]:n===`ranger`?r=[`acidgunner`,`sniper`]:n===`farmer`&&(r=[`cultivator`]));let i=r.join(`-`),a=document.getElementById(`hud-evolution`);if(r.length===0){a&&(a.style.display=`none`),Q=``;return}if(Q===i){a&&(a.style.display=`flex`);return}Q=i;let o=document.getElementById(`evolve-cards-list`);o&&(o.innerHTML=r.map(e=>{let t=Ft[e]||{emoji:`🐜`,title:e.toUpperCase(),desc:`Specialized Caste`,color:`#ffffff`};return`
        <div class="evolve-card" style="--c:${t.color};" onclick="window.antEvolve('${e}')">
          <div class="evolve-card-emoji">${t.emoji}</div>
          <div class="evolve-card-title">${t.title}</div>
          <div class="evolve-card-desc">${t.desc}</div>
          <button class="evolve-card-btn">SELECT CASTE</button>
        </div>
      `}).join(``)),a.style.display=`flex`}window.antEvolve=function(e){H.evolve(e)};var Lt=!1;function Rt(){Lt||(Lt=!0,[`hud-resources`,`hud-daycycle`,`hud-stats-panel`,`hud-level-bar`,`hud-build`,`hud-killfeed`,`help-btn`].forEach(e=>{let t=document.getElementById(e);t&&(t.style.display=`flex`)}))}function $(e,t,n,r,i){return`<button class="build-btn" data-build="${e}" title="${i}">
    <span class="build-icon">${t}</span>
    <span class="build-label">${n}</span>
    <span class="build-cost">${r}</span>
  </button>`}function zt(){if(document.getElementById(`hud-styles`))return;let e=document.createElement(`style`);e.id=`hud-styles`,e.textContent=`
    .res-row{display:flex;align-items:center;gap:10px;color:#e8e6d9;font-size:13px}
    .res-icon{font-size:15px}.res-label{color:#9ca38f;font-size:11px;margin-left:auto}
    .build-btn{background:rgba(10,10,14,0.85);backdrop-filter:blur(10px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:8px 14px;cursor:pointer;color:#e8e6d9;
      display:flex;flex-direction:column;align-items:center;gap:3px;
      transition:all 0.18s;min-width:76px;box-shadow:0 6px 18px rgba(0,0,0,0.5);}
    .build-btn:hover{border-color:#4ade80;background:rgba(74,222,128,0.08);transform:translateY(-3px);box-shadow:0 8px 24px rgba(74,222,128,0.22);}
    .build-icon{font-size:19px}.build-label{font-family:'Cinzel',serif;font-size:8px;
      letter-spacing:0.12em;color:#9ca38f}.build-cost{font-size:10px;color:#4ade80;font-weight:700;}

    /* Stat Upgrade Rows */
    .stat-upgrade-row{display:flex;align-items:center;gap:10px;padding:3px 0;height:24px}
    .stat-lbl{font-size:13px;color:#e8e6d9;min-width:65px;font-family:'Crimson Pro',serif}
    .stat-blocks{display:flex;gap:4px;flex:1;align-items:center}
    .stat-block-slot{width:10px;height:12px;border-radius:2px;border:0.5px solid rgba(74,222,128,0.18)}
    .stat-block-filled{background:#4ade80;box-shadow:0 0 4px #4ade80aa}
    .stat-block-empty{background:rgba(255,255,255,0.03)}
    .stat-add-btn{width:16px;height:16px;border-radius:4px;border:none;background:#fbbf24;
      color:#070705;font-weight:800;font-size:11px;display:none;align-items:center;justify-content:center;
      cursor:pointer;transition:transform 0.15s;}
    .stat-add-btn:hover{transform:scale(1.15)}

    /* Evolution Cards Overlay */
    .evolve-card{background:rgba(10,10,15,0.86);backdrop-filter:blur(14px);
      border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;
      padding:16px 20px;width:180px;display:flex;flex-direction:column;
      align-items:center;text-align:center;gap:10px;cursor:pointer;
      transition:all 0.22s;box-shadow:0 8px 32px rgba(0,0,0,0.65);}
    .evolve-card:hover{border-color:var(--c);transform:translateY(-6px);box-shadow:0 12px 36px var(--c)3a}
    .evolve-card-emoji{font-size:32px;filter:drop-shadow(0 0 10px var(--c)77)}
    .evolve-card-title{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:#e8e6d9;letter-spacing:0.08em}
    .evolve-card-desc{font-size:11px;color:#9ca38f;line-height:1.4;height:45px;display:flex;align-items:center;justify-content:center}
    .evolve-card-btn{width:100%;padding:6px;border:0.5px solid var(--c);border-radius:6px;
      background:none;color:var(--c);font-family:'Cinzel',serif;font-size:8px;
      font-weight:700;letter-spacing:0.08em;cursor:pointer;transition:all 0.15s;}
    .evolve-card:hover .evolve-card-btn{background:var(--c);color:#070705}

    .kill-entry{background:rgba(10,10,14,0.85);backdrop-filter:blur(10px);
      border:0.5px solid rgba(239,68,68,0.22);border-radius:8px;
      padding:6px 14px;color:#fca5a5;font-size:12px;animation:_ki 0.3s ease both;
      box-shadow:0 4px 12px rgba(0,0,0,0.45);}
    @keyframes _ki{from{opacity:0;transform:translateX(10px)}}
    .toast{padding:8px 24px;border-radius:99px;background:rgba(10,10,14,0.92);
      backdrop-filter:blur(10px);border:0.5px solid rgba(74,222,128,0.25);
      color:#e8e6d9;font-size:13px;font-family:'Crimson Pro',serif;
      box-shadow:0 6px 20px rgba(0,0,0,0.5);
      opacity:0;transform:translateY(8px);transition:all 0.3s;pointer-events:none}
    .toast-show{opacity:1!important;transform:translateY(0)!important}
    .toast-error{border-color:rgba(239,68,68,0.4)!important;color:#fca5a5}
    .ctrl-s{font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:0.2em;
      color:#4ade80;margin-bottom:6px;margin-top:6px;border-bottom:0.5px solid rgba(74,222,128,0.15);padding-bottom:2px}
    .ctrl-r{display:flex;align-items:baseline;gap:12px;padding:5px 0;
      border-bottom:0.5px solid rgba(255,255,255,0.03);font-size:13px}
    .ctrl-k{background:rgba(74,222,128,0.08);border:0.5px solid rgba(74,222,128,0.2);
      border-radius:4px;padding:1px 8px;font-size:10px;color:#4ade80;
      white-space:nowrap;flex-shrink:0;font-family:'Cinzel',serif;letter-spacing:0.05em}
    .ctrl-d{color:#9ca38f;font-size:13px}
    .ctrl-note{color:#9ca38f;font-size:12.5px;font-style:italic;margin:6px 0 0 4px;line-height:1.55}
  `,document.head.appendChild(e)}function Bt(){let e=document.getElementById(`ui-overlay`),t=document.createElement(`div`);t.id=`lobby-screen`,t.innerHTML=`
    <div class="lobby-bg">
      <div class="lobby-particles" id="lobby-particles"></div>
      <div class="lobby-content">

        <div class="lobby-header">
          <div class="lobby-logo">
            <span class="logo-ant">🐜</span>
            <div class="logo-text">
              <div class="logo-main">ANTIVUS</div>
              <div class="logo-sub">COLONIAL WARS</div>
            </div>
          </div>
          <p class="lobby-tagline">Command your colony. Conquer the territory. Crush the rivals.</p>
        </div>

        <!-- Name input shared -->
        <div style="display:flex;justify-content:center;margin-bottom:1rem">
          <input id="colony-name" class="lobby-input" style="max-width:300px;text-align:center"
            placeholder="Name your colony..." maxlength="18" />
        </div>

        <div class="lobby-panels">

          <!-- Quick create -->
          <div class="lobby-panel">
            <div class="panel-title">⚡ FOUND A COLONY</div>
            <div class="panel-desc">Create a new room. Share the room code with friends to invite them.</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <label style="font-size:12px;color:#6b6b5a;white-space:nowrap">Max players</label>
              <select id="max-players" class="lobby-input" style="flex:1;padding:6px 8px">
                <option value="2">2 players</option>
                <option value="4">4 players</option>
                <option value="6" selected>6 players</option>
                <option value="8">8 players</option>
              </select>
            </div>
            <button class="lobby-btn btn-primary" id="btn-create">Found New Colony</button>

            <!-- Room code display (hidden until created) -->
            <div id="room-code-display" style="display:none;margin-top:12px;
              background:#0d0d09;border:0.5px solid rgba(74,222,128,0.3);
              border-radius:8px;padding:10px 14px;text-align:center">
              <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:6px">ROOM CODE — SHARE WITH FRIENDS</div>
              <div id="room-code-val" style="font-family:monospace;font-size:13px;color:#e8e6d9;word-break:break-all"></div>
              <button id="btn-copy-code" style="margin-top:8px;padding:4px 12px;
                background:rgba(74,222,128,0.1);border:0.5px solid rgba(74,222,128,0.3);
                border-radius:6px;color:#4ade80;font-size:11px;cursor:pointer;
                font-family:'Cinzel',serif;letter-spacing:0.1em">COPY CODE</button>
            </div>
          </div>

          <div class="lobby-divider"><span>OR</span></div>

          <!-- Join by code -->
          <div class="lobby-panel">
            <div class="panel-title">🔑 JOIN BY CODE</div>
            <div class="panel-desc">Enter a room code shared by a friend.</div>
            <input id="room-code-input" class="lobby-input" placeholder="Paste room code..." maxlength="36" />
            <button class="lobby-btn btn-secondary" id="btn-join-code">Join Room</button>
          </div>

        </div>

        <!-- Open rooms browser -->
        <div class="lobby-section">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;color:#4ade80">OPEN ROOMS</div>
            <button id="btn-refresh" style="background:none;border:none;color:#6b6b5a;
              font-size:12px;cursor:pointer;font-family:'Crimson Pro',serif">⟳ Refresh</button>
          </div>
          <div id="rooms-list" style="display:flex;flex-direction:column;gap:6px;min-height:40px">
            <div style="color:#3a3a2a;font-size:13px;font-style:italic;text-align:center;padding:8px 0">
              Searching for open rooms...
            </div>
          </div>
        </div>

        <div class="lobby-footer">
          <div class="feature-pills">
            <span class="fpill">🧪 Pheromone Turf Speed</span>
            <span class="fpill">🏗 Swarming Drone Nurseries</span>
            <span class="fpill">🌙 Night Predator Bosses</span>
            <span class="fpill">⚔️ 12 Evolved Ant Classes</span>
            <span class="fpill">💥 Chemical Reactions</span>
          </div>
        </div>

      </div>
    </div>
  `,e.appendChild(t),Ut(),Ht(),document.getElementById(`btn-create`).addEventListener(`click`,()=>{let e=document.getElementById(`colony-name`).value.trim();if(!e){Wt();return}let t=parseInt(document.getElementById(`max-players`).value);d.getState().setMyName(e),H.createRoom({name:e,maxPlayers:t})});let n=U();n&&n.on(`room:joined`,({roomId:e})=>{let t=document.getElementById(`room-code-display`),n=document.getElementById(`room-code-val`);t&&n&&(t.style.display=`block`,n.textContent=e)}),document.getElementById(`btn-copy-code`).addEventListener(`click`,()=>{let e=document.getElementById(`room-code-val`).textContent;navigator.clipboard.writeText(e).then(()=>{document.getElementById(`btn-copy-code`).textContent=`✓ COPIED!`,setTimeout(()=>{document.getElementById(`btn-copy-code`).textContent=`COPY CODE`},2e3)})}),document.getElementById(`btn-join-code`).addEventListener(`click`,()=>{let e=document.getElementById(`colony-name`).value.trim();if(!e){Wt();return}let t=document.getElementById(`room-code-input`).value.trim();if(!t){document.getElementById(`room-code-input`).focus();return}d.getState().setMyName(e),H.joinRoom(t)}),document.getElementById(`room-code-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&document.getElementById(`btn-join-code`).click()}),document.getElementById(`btn-refresh`).addEventListener(`click`,()=>{let e=U();e&&e.emit(`rooms:refresh`)});let r=U();r&&r.on(`rooms:list`,e=>Vt(e))}function Vt(e){let t=document.getElementById(`rooms-list`);if(t){if(!e||e.length===0){t.innerHTML=`
      <div style="color:#3a3a2a;font-size:13px;font-style:italic;text-align:center;padding:8px 0">
        No open rooms — create one and invite friends!
      </div>`;return}t.innerHTML=e.map(e=>`
    <div class="room-row">
      <div style="flex:1">
        <div style="font-size:13px;color:#e8e6d9">${e.hostName}'s Colony</div>
        <div style="font-size:11px;color:#6b6b5a;margin-top:2px">
          ${e.playerCount}/${e.maxPlayers} players
          <span style="margin:0 6px;opacity:0.3">·</span>
          <span style="font-family:monospace;font-size:10px;opacity:0.5">${e.id.slice(0,8)}...</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="room-dots">
          ${Array.from({length:e.maxPlayers},(t,n)=>`<div class="room-dot ${n<e.playerCount?`filled`:``}"></div>`).join(``)}
        </div>
        <button class="join-btn" data-room="${e.id}">JOIN</button>
      </div>
    </div>
  `).join(``),t.querySelectorAll(`.join-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=document.getElementById(`colony-name`).value.trim();if(!t){document.getElementById(`colony-name`).focus(),document.getElementById(`colony-name`).placeholder=`← Enter a name first!`;return}d.getState().setMyName(t),H.joinRoom(e.dataset.room)})})}}function Ht(){let e=document.getElementById(`lobby-particles`);for(let t=0;t<20;t++){let t=document.createElement(`div`);t.className=`particle`,t.style.cssText=`
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-delay:${Math.random()*8}s;
      animation-duration:${7+Math.random()*10}s;
      width:${2+Math.random()*3}px; height:${2+Math.random()*3}px;
      opacity:${.1+Math.random()*.25};
    `,e.appendChild(t)}}function Ut(){if(document.getElementById(`lobby-styles`))return;let e=document.createElement(`style`);e.id=`lobby-styles`,e.textContent=`
    #lobby-screen { position:fixed; inset:0; z-index:50; font-family:'Crimson Pro',serif; }
    .lobby-bg {
      width:100%; height:100%;
      background: radial-gradient(ellipse at 30% 20%, #0d1f0a 0%, #070705 60%);
      display:flex; align-items:center; justify-content:center;
      overflow:hidden; position:relative;
    }
    .lobby-particles { position:absolute; inset:0; pointer-events:none; }
    .particle {
      position:absolute; background:#4ade80; border-radius:50%;
      animation: float linear infinite;
    }
    @keyframes float { 0%{transform:translateY(0) rotate(0deg)} 100%{transform:translateY(-120vh) rotate(360deg)} }
    .lobby-content {
      position:relative; z-index:2; width:min(800px,95vw);
      display:flex; flex-direction:column; gap:0.75rem;
      padding:1rem 0; animation: fadeUp 0.7s ease both;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    .lobby-header { text-align:center; }
    .lobby-logo { display:inline-flex; align-items:center; gap:1rem; margin-bottom:0.4rem; }
    .logo-ant  { font-size:3rem; filter:drop-shadow(0 0 16px #4ade8077); }
    .logo-main { font-family:'Cinzel',serif; font-size:2rem; font-weight:800; color:#e8e6d9; letter-spacing:0.12em; line-height:1; }
    .logo-sub  { font-family:'Cinzel',serif; font-size:0.8rem; font-weight:600; color:#4ade80; letter-spacing:0.35em; }
    .lobby-tagline { font-size:1.05rem; color:#6b6b5a; font-style:italic; }
    .lobby-panels { display:flex; gap:1rem; align-items:flex-start; }
    @media(max-width:580px) { .lobby-panels { flex-direction:column; } }
    .lobby-panel {
      flex:1; background:#0f0f0a;
      border:0.5px solid rgba(74,222,128,0.15); border-radius:12px;
      padding:1rem; display:flex; flex-direction:column; gap:0.6rem;
      transition:border-color 0.2s;
    }
    .lobby-panel:hover { border-color:rgba(74,222,128,0.3); }
    .panel-title { font-family:'Cinzel',serif; font-size:0.75rem; font-weight:600; letter-spacing:0.2em; color:#4ade80; }
    .panel-desc  { font-size:0.9rem; color:#6b6b5a; line-height:1.5; }
    .lobby-input {
      width:100%; background:#161610; border:0.5px solid rgba(74,222,128,0.2);
      border-radius:8px; padding:0.6rem 1rem; color:#e8e6d9;
      font-family:'Crimson Pro',serif; font-size:1rem; outline:none;
      transition:border-color 0.2s;
    }
    .lobby-input:focus { border-color:rgba(74,222,128,0.6); }
    .lobby-input::placeholder { color:#3a3a2a; }
    select.lobby-input { cursor:pointer; }
    .lobby-btn {
      padding:0.75rem 1.5rem; border-radius:8px;
      font-family:'Cinzel',serif; font-size:0.75rem; font-weight:600;
      letter-spacing:0.1em; cursor:pointer; border:none; transition:all 0.18s;
    }
    .btn-primary  { background:#4ade80; color:#070705; }
    .btn-primary:hover  { background:#86efac; transform:translateY(-1px); box-shadow:0 6px 20px #4ade8033; }
    .btn-secondary { background:transparent; color:#4ade80; border:0.5px solid rgba(74,222,128,0.45); }
    .btn-secondary:hover { background:rgba(74,222,128,0.07); transform:translateY(-1px); }
    .lobby-divider {
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; color:#3a3a2a; font-size:0.8rem;
      letter-spacing:0.1em; padding:0 0.25rem;
    }
    .lobby-section {
      background:#0f0f0a; border:0.5px solid rgba(74,222,128,0.1);
      border-radius:12px; padding:0.85rem 1.25rem;
    }
    .room-row {
      display:flex; align-items:center; gap:12px;
      padding:10px 12px; background:#161610;
      border:0.5px solid rgba(74,222,128,0.1); border-radius:8px;
      transition:border-color 0.15s;
    }
    .room-row:hover { border-color:rgba(74,222,128,0.3); }
    .room-dots { display:flex; gap:3px; }
    .room-dot {
      width:7px; height:7px; border-radius:50%;
      background:rgba(74,222,128,0.15); border:0.5px solid rgba(74,222,128,0.2);
    }
    .room-dot.filled { background:#4ade80; }
    .join-btn {
      padding:5px 14px; background:rgba(74,222,128,0.1);
      border:0.5px solid rgba(74,222,128,0.35); border-radius:6px;
      color:#4ade80; font-family:'Cinzel',serif; font-size:10px;
      letter-spacing:0.1em; cursor:pointer; transition:all 0.15s;
      white-space:nowrap;
    }
    .join-btn:hover { background:rgba(74,222,128,0.2); }
    .lobby-footer { text-align:center; }
    .feature-pills { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
    .fpill {
      padding:3px 10px; border-radius:99px;
      border:0.5px solid rgba(74,222,128,0.12);
      font-size:0.78rem; color:#6b6b5a;
    }
  `,document.head.appendChild(e)}function Wt(){let e=document.getElementById(`colony-name`);e&&(e.focus(),e.style.borderColor=`rgba(239,68,68,0.7)`,e.placeholder=`← You need a colony name!`,setTimeout(()=>{e.style.borderColor=``,e.placeholder=`Name your colony...`},2500))}var Gt=`modulepreload`,Kt=function(e){return`/`+e},qt={},Jt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Kt(t,n),t in qt)return;qt[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:Gt,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};async function Yt(){let e=d.getState(),t=document.getElementById(`ui-overlay`),{initRenderer:n}=await Jt(async()=>{let{initRenderer:e}=await import(`./renderer-BtctnHmX.js`);return{initRenderer:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]));await n(document.getElementById(`app`)),ht(),Nt(t),Bt(),e.setPhase(`lobby`),console.log(`[antivus] booted`)}Yt().catch(console.error);export{o as a,d as i,wt as n,l as o,Tt as r,Jt as t};