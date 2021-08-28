/**
  @2021 mdestagreddy Github
**/

var JAVASCRIPT_NAME = "[ElementPanZoom]";

//Outside Function
function ElementPanZoom(elem) {
  let init = this;
  let error = {}
  
  let el = typeof elem == "string" ? document.querySelector(elem) : elem;
  let ta = el.querySelector("*");
  if (el.hasAttribute("element-pan-zoom-init")) {
    error.inited = `Warning: ${el} is already inited.`;
    console.warn(JAVASCRIPT_NAME, error.inited);
    return;
  }
  el.setAttribute("element-pan-zoom-init", "");
  
  init.translation = {
    x: 0,
    y: 0,
    scale: 0
  }
  init.dimension = {
    container: {
      width: 0,
      height: 0,
      ratio: 0
    },
    content: {
      width: 0,
      height: 0,
      ratio: 0,
      left: 0,
      top: 0
    },
    width: 0,
    height: 0,
    max: {
      x: 0,
      y: 0,
      scale: 0
    }
  }
  init.isAnimate = false;
  init.gesture = {
    start: { x: 0, y: 0 },
    move: { x: 0, y: 0 },
    start_2: { x: 0, y: 0 },
    move_2: { x: 0, y: 0 },
    started: false,
    length: 0,
    event: {
      start: undefined,
      move: undefined,
      end: undefined
    }
  }
  
  init._events = {}
  init.on = (type, fn) => {
    if ( !init._events[type] ) {
      init._events[type] = [];
    }
  
    init._events[type].push(fn);
  }
  init.off = (type, fn) => {
    if ( !init._events[type] ) { return; }
    
    let index = init._events[type].indexOf(fn);
    
    if ( index > -1 ) {
      init._events[type].splice(index, 1);
    }
  }
  init._execEvent = (type) => {
    if ( !init._events[type] ) { return; }
    
    let i = 0;
    l = init._events[type].length;
  
    if ( !l ) { return; }
  
    for ( ; i < l; i++ ) {
      init._events[type][i].apply(init, [].slice.call(arguments, 1));
    }
  }
  
  init.ev = {
    moving: {x: 0, y: 0, scale: 0},
    end: {e: false}
  }
  
  init.el = {
    container: el,
    content: ta
  }
  
  if (!ta) {
    error.child = "Your need element this child.";
    console.error(JAVASCRIPT_NAME, error.child);
    throw TypeError(error.child);
  }
  let _bezier = (easingType, x) => {
    let eType = (easingType ? easingType : "").toLowerCase();
    
    if (eType == "easein.sine") {
      return 1 - Math.cos((x * Math.PI) / 2);
    }
    else if (eType == "easeout.sine") {
      return Math.sin((x * Math.PI) / 2);
    }
    else if (eType == "easeinout.sine") {
      return 0 - (Math.cos(Math.PI * x) - 1) / 2;
    }
    
    else if (eType == "easein.quad") {
      return Math.pow(x, 2);
    }
    else if (eType == "easeout.quad") {
      return 1 - (1 - x) * (1 - x);
    }
    else if (eType == "easeinout.quad") {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(0 - 2 * x + 2, 2) / 2;
    }
    
    else if (eType == "easein.cubic") {
      return Math.pow(x, 3);
    }
    else if (eType == "easeout.cubic") {
      return 1 - Math.pow(1 - x, 3);
    }
    else if (eType == "easeinout.cubic") {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(0 - 2 * x + 2, 3) / 2;
    }
    
    else if (eType == "easein.quart") {
      return Math.pow(x, 4);
    }
    else if (eType == "easeout.quart") {
      return 1 - Math.pow(1 - x, 4);
    }
    else if (eType == "easeinout.quart") {
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(0 - 2 * x + 2, 4) / 2;
    }
    
    else if (eType == "easein.quint") {
      return Math.pow(x, 5);
    }
    else if (eType == "easeout.quint") {
      return 1 - Math.pow(1 - x, 5);
    }
    else if (eType == "easeinout.quint") {
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(0 - 2 * x + 2, 5) / 2;
    }
    
    else if (eType == "easein.expo") {
      return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    }
    else if (eType == "easeout.expo") {
      return x === 1 ? 1 : 1 - Math.pow(2, 0 - 10 * x);
    }
    else if (eType == "easeinout.expo") {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, 0 - 20 * x + 10)) / 2;
    }
    
    else if (eType == "easein.circ") {
      return 1 - Math.sqrt(1 - Math.pow(x, 2));
    }
    else if (eType == "easeout.circ") {
      return Math.sqrt(1 - Math.pow(x - 1, 2));
    }
    else if (eType == "easeinout.circ") {
      return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(0 - 2 * x + 2, 2)) + 1) / 2;
    }
    
    else if (eType == "linear") {
      return x;
    }
    else {
      return 1 - Math.pow(1 - x, 3);
    }
  }
  let listeners = (eventsType, fn) => {
    let _eventsArray = eventsType.split(" ");
    for (let _i in _eventsArray) {
      el.addEventListener(_eventsArray[_i], fn);
    }
  }
  
  ta.style.position = "absolute";
  el.style.position = "relative";
  ta.style.display = "block";
  el.style.overflow = "hidden";
  el.style.minWidth = "1px";
  el.style.minHeight = "1px";
  el.style.display = "block";
  el.style.objectFit = "contain";
  el.style.touchAction = "none";
  
  let _clamp = (min, max, value) => {
    return Math.max(min, Math.min(max, value));
  }
  let _fC = (frame) => {
    return 1000 / frame;
  }
  let _distance = (x1, x2, y1, y2) => {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
  let animLoop;
  let dim = {
    rect: el.getBoundingClientRect(),
    targetWidth: 0, targetHeight: 0,
    w: 0, h: 0,
    left: 0, top: 0,
    targetRatio: 0, boxRatio: 0,
    zoomed: {
      x: 0,
      y: 0
    },
    maxZoomed: {
      x: 0,
      y: 0,
      scale: 0
    }
  }
  
  let opt = {
    initialScale: Number(el.getAttribute("initial-scale") || 1),
    maxScale: Number(el.getAttribute("max-scale") || 2),
    initialX: Number(el.getAttribute("x") || 0),
    initialY: Number(el.getAttribute("y") || 0),
    motionDeceleration: _clamp(0.01, 0.25, Number(el.getAttribute("deceleration") || 0.03)),
    motionStop: _clamp(0.01, 4, Number(el.getAttribute("stop-motion") || 0.125)),
    easeZoom: el.getAttribute("ease-zoom") || "easeout.expo",
    easeZoomDuration: _clamp(100, 750, Number(el.getAttribute("ease-zoom-duration") || 500))
  }
  
  let tr = {
    x: opt.initialX,
    y: opt.initialY,
    scale: opt.initialScale,
  }
  let gesture = {
    start1: {x: 0, y: 0},
    move1: {x: 0, y: 0},
    start2: {x: 0, y: 0},
    move2: {x: 0, y: 0},
    md: {x: 0, y: 0},
    d: false,
    del: {x: 0, y: 0},
    m: false,
    c: {x: 0, y: 0, scale: 1},
    time: {ts: 0, s: 0, e: 0},
    length: 0,
    l: 0,
    distance: 0,
    newDistance: 0,
    tar: {x: 0, y: 0}
  }
  
  let anim = {
    vsync: {
      start: 0,
      end: 0,
      timestamp: 0
    },
    a: {
      finish: true,
      timestart: 0,
      time: 0,
      current: 0,
      easeName: "",
      s: {x: 0, y: 0, scale: 0},
      e: {x: 0, y: 0, scale: 0},
      duration: 0
    },
    vel: {x: 0, y: 0}
  }
  let _animate = (easing, x, y, scale, duration) => {
    if (init.isAnimate) {
      duration = duration ? duration : 0;
      anim.a.finish = false;
      anim.a.timestart = performance.now();
      anim.a.easeName = easing;
      anim.a.s.x = tr.x;
      anim.a.s.y = tr.y;
      anim.a.s.scale = tr.scale;
      ix = _clamp(0, Infinity, (dim.w * _clamp(1, dim.maxZoomed.scale, scale)) - el.clientWidth) / 2;
      iy = _clamp(0, Infinity, (dim.h * _clamp(1, dim.maxZoomed.scale, scale)) - el.clientHeight) / 2;
      anim.a.e.x = _clamp(0 - ix, ix, x);
      anim.a.e.y = _clamp(0 - iy, iy, y);
      anim.a.e.scale = _clamp(1, dim.maxZoomed.scale, scale);
      anim.a.duration = duration;
    }
  }
  
  listeners("touchstart mousedown", (e) => {
    init.gesture.event.start = e;
    anim.a.finish = true;
    if (gesture.d != true && anim.a.finish == true) {
      gesture.length = e.touches ? e.touches.length : 1;
      gesture.c.x = tr.x;
      gesture.c.y = tr.y;
      gesture.c.scale = tr.scale;
      gesture.start1.x = e.touches ? e.touches[0].clientX : e.clientX;
      gesture.start1.y = e.touches ? e.touches[0].clientY : e.clientY;
      gesture.move1.x = gesture.start1.x;
      gesture.move1.y = gesture.start1.y;
      if (e.touches && gesture.length >= 2) {
        gesture.start2.x = e.touches[1].clientX;
        gesture.start2.y = e.touches[1].clientY;
        gesture.move2.x = gesture.start2.x;
        gesture.move2.y = gesture.start2.y;
        gesture.distance = _distance(gesture.start1.x, gesture.start2.x, gesture.start1.y, gesture.start2.y);
      }
      dim.rect = el.getBoundingClientRect();
      gesture.tar.x = 0 - (((gesture.start1.x + gesture.start2.x) / 2) - (dim.rect.left + el.clientWidth / 2)) / 2;
      gesture.tar.y = 0 - (((gesture.start1.y + gesture.start2.y) / 2) - (dim.rect.top + el.clientHeight / 2)) / 2;
      gesture.newDistance = gesture.distance;     
      
      gesture.md.x = tr.x;
      gesture.md.y = tr.y;
      gesture.d = true;
      gesture.m = false;
      init.gesture.started = true;
      if (tr.scale != 1) {
        e.stopPropagation();
      }
      
      init.gesture.start.x = gesture.start1.x;
      init.gesture.start.y = gesture.start1.y;
      init.gesture.start_2.x = gesture.start2.x;
      init.gesture.start_2.y = gesture.start2.y;
      init.gesture.move.x = gesture.move1.x;
      init.gesture.move.y = gesture.move1.y;
      init.gesture.move_2.x = gesture.move2.x;
      init.gesture.move_2.y = gesture.move2.y;
      init.gesture.length = gesture.length;
      
      init._execEvent("gesture.start");
    }
  });
  listeners("touchmove mousemove", (e) => {
    init.gesture.event.move = e;
    if (e.touches && anim.a.finish == true) { gesture.d = true; init.gesture.started = true; }
    if (gesture.d == true && anim.a.finish == true) {
      gesture.length = e.touches ? e.touches.length : 1;
      gesture.move1.x = e.touches ? e.touches[0].clientX : e.clientX;
      gesture.move1.y = e.touches ? e.touches[0].clientY : e.clientY;
      if (e.touches && gesture.length >= 2) {
        gesture.move2.x = e.touches[1].clientX;
        gesture.move2.y = e.touches[1].clientY;
        gesture.newDistance = _distance(gesture.move1.x, gesture.move2.x, gesture.move1.y, gesture.move2.y);
        gesture.md.x = tr.x;
        gesture.md.y = tr.y;
      }
      if (gesture.m != true || gesture.length - gesture.l != 0) {
        gesture.m = true;
        
        gesture.md.x = tr.x;
        gesture.md.y = tr.y;
        gesture.c.x = tr.x;
        gesture.c.y = tr.y;
        gesture.c.scale = tr.scale;
        gesture.start1.x = e.touches ? e.touches[0].clientX : e.clientX;
        gesture.start1.y = e.touches ? e.touches[0].clientY : e.clientY;
        gesture.move1.x = gesture.start1.x;
        gesture.move1.y = gesture.start1.y;
        if (e.touches && gesture.length >= 2) {
          gesture.start2.x = e.touches[1].clientX;
          gesture.start2.y = e.touches[1].clientY;
          gesture.move2.x = gesture.start2.x;
          gesture.move2.y = gesture.start2.y;
          gesture.distance = _distance(gesture.start1.x, gesture.start2.x, gesture.start1.y, gesture.start2.y);
        }
        dim.rect = el.getBoundingClientRect();
        gesture.tar.x = 0 - (((gesture.move1.x + gesture.move2.x) / 2) - (dim.rect.left + el.clientWidth / 2)) / 2;
        gesture.tar.y = 0 - (((gesture.move1.y + gesture.move2.y) / 2) - (dim.rect.top + el.clientHeight / 2)) / 2;
        gesture.newDistance = gesture.distance;
      }
      if (tr.scale != 1) {
        e.stopPropagation();
      }
      
      init.gesture.start.x = gesture.start1.x;
      init.gesture.start.y = gesture.start1.y;
      init.gesture.start_2.x = gesture.start2.x;
      init.gesture.start_2.y = gesture.start2.y;
      init.gesture.move.x = gesture.move1.x;
      init.gesture.move.y = gesture.move1.y;
      init.gesture.move_2.x = gesture.move2.x;
      init.gesture.move_2.y = gesture.move2.y;
      init.gesture.length = gesture.length;
      
      init._execEvent("gesture.move");
    }
  });
  listeners("touchend mouseleave mouseup", (e) => {
    init.gesture.event.end = e;
    if (gesture.d == true && anim.a.finish == true) {
      if (e.mouseleave) {
        gesture.c.x = tr.x;
        gesture.c.y = tr.y;
      }
      gesture.length = e.touches ? e.touches.length : 0;
      if (gesture.length == 0) {
        gesture.del.x = (tr.x - gesture.md.x) / gesture.time.ts;
        gesture.del.y = (tr.y - gesture.md.y) / gesture.time.ts;
      }
      else {
        gesture.del.x = 0;
        gesture.del.y = 0;
      }
      if (!(tr.scale <= 1) && gesture.length == 0) {
        anim.vel.x = gesture.del.x;
        anim.vel.y = gesture.del.y;
      }
      else {
        anim.vel.x = 0;
        anim.vel.y = 0;
      }
      if (tr.scale < 1) {
        _animate(opt.easeZoom, 0, 0, 1, opt.easeZoomDuration);
      }
      if (tr.scale > dim.maxZoomed.scale) {
        _animate(opt.easeZoom,
          tr.x / (tr.scale / dim.maxZoomed.scale),
          tr.y / (tr.scale / dim.maxZoomed.scale),
          dim.maxZoomed.scale, opt.easeZoomDuration);
      }
      
      gesture.m = false;
      gesture.d = false;
      init.gesture.started = false;
      init.gesture.length = gesture.length;
      
      if (tr.scale != 1) {
        e.stopPropagation();
      }
      init._execEvent("gesture.end");
    }
  });
  listeners("dblclick", () => {
    if (tr.scale > 1) {
      _animate(opt.easeZoom, 0, 0, 1, opt.easeZoomDuration);
    }
    else {
      dim.rect = el.getBoundingClientRect();
      _animate(opt.easeZoom,
        (dim.rect.left + ((el.clientWidth / 2) - gesture.start1.x)) * dim.maxZoomed.scale,
        (dim.rect.top + ((el.clientHeight / 2) - gesture.start1.y)) * dim.maxZoomed.scale,
        dim.maxZoomed.scale, opt.easeZoomDuration);
    }
  });
  
  let _resize = () => {
    dim.targetWidth = ta.videoWidth || ta.naturalWidth || ta.clientWidth;
    dim.targetHeight = ta.videoHeight || ta.naturalHeight || ta.clientHeight;
    dim.boxRatio = el.clientWidth / el.clientHeight;
    dim.targetRatio = dim.targetWidth / dim.targetHeight;
    if (dim.boxRatio < dim.targetRatio) {
      dim.w = el.clientWidth;
      dim.h = el.clientWidth / dim.targetRatio;
      dim.left = 0;
      dim.top = (el.clientHeight - dim.h) / 2;
      dim.maxZoomed.scale = _clamp(_clamp(2, Infinity, dim.targetRatio / dim.boxRatio), Infinity, _clamp(1, 64, opt.maxScale));
    }
    else {
      dim.w = el.clientHeight * dim.targetRatio;
      dim.h = el.clientHeight;
      dim.left = (el.clientWidth - dim.w) / 2;
      dim.top = 0;
      dim.maxZoomed.scale = _clamp(_clamp(2, Infinity, dim.boxRatio / dim.targetRatio), Infinity, _clamp(1, 64, opt.maxScale));
    }
    dim.maxZoomed.x = _clamp(0, Infinity, (dim.w * dim.maxZoomed.scale) - el.clientWidth) / 2;
    dim.maxZoomed.y = _clamp(0, Infinity, (dim.h * dim.maxZoomed.scale) - el.clientHeight) / 2;
    
    ta.style.left = dim.left + "px";
    ta.style.top = dim.top + "px";
    ta.style.width = dim.w + "px";
    ta.style.height = dim.h + "px";
    anim.a.finish = true;
    gesture.m = 0;
    gesture.d = 0;
    anim.vel.x = 0;
    anim.vel.y = 0;
    tr.scale = _clamp(1, dim.maxZoomed.scale, opt.initialScale);
    tr.x = _clamp(0 - dim.zoomed.x, dim.zoomed.x, opt.initialX);
    tr.y = _clamp(0 - dim.zoomed.y, dim.zoomed.y, opt.initialY);
    
    init.dimension.container.width = el.clientWidth;
    init.dimension.container.height = el.clientHeight;
    init.dimension.container.ratio = dim.boxRatio;
    
    init.dimension.content.width = dim.w;
    init.dimension.content.height = dim.h;
    init.dimension.content.ratio = dim.w / dim.h;
    init.dimension.content.left = dim.left;
    init.dimension.content.top = dim.top;
    
    init.dimension.max.x = dim.maxZoomed.x;
    init.dimension.max.y = dim.maxZoomed.y;
    init.dimension.max.scale = dim.maxZoomed.scale;
    
    init._execEvent("resize");
  }
  
  if (!(/SCRIPT|IFRAME|OBJECT|EMBED|AMP-IFRAME/i.test(ta.tagName))) {
    let resize = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        _resize();
      });
    });
    resize.observe(el);
    let resizeTarget = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        _resize();
      });
    });
    resizeTarget.observe(ta);
    ta.addEventListener("load", function() {
      _resize();
    });
    
    animLoop = () => {
      if (!el.querySelector("*")) {
        window.cancelAnimationFrame(animLoop);
        error.missing = `Missing child ${ta}`;
        console.error(JAVASCRIPT_NAME, error.missing);
        throw Error(error.missing); 
      }
      if (isNaN(tr.x) || isNaN(tr.y) || isNaN(tr.scale)) { _resize() }
      
      ta.style.transition = "transform 0ms";
      gesture.l = gesture.length;
      gesture.time.s = performance.now();
      gesture.time.ts = (gesture.time.s - gesture.time.e) / _fC(60);
      gesture.time.e = gesture.time.s;
      if (gesture.length <= 1) {
        gesture.md.x = tr.x;
        gesture.md.y = tr.y;
      }
      
      anim.vsync.start = performance.now();
      anim.vsync.timestamp = (anim.vsync.start - anim.vsync.end) / _fC(60);
      anim.vsync.end = anim.vsync.start;
      
      if (anim.a.finish == false) {
        anim.a.time = 0 - (anim.a.timestart - performance.now()) / anim.a.duration;
        anim.a.current = _bezier(anim.a.easeName, _clamp(0, 1, anim.a.time));
        tr.x = anim.a.s.x + ((anim.a.e.x - anim.a.s.x) * anim.a.current);
        tr.y = anim.a.s.y + ((anim.a.e.y - anim.a.s.y) * anim.a.current);
        tr.scale = anim.a.s.scale + ((anim.a.e.scale - anim.a.s.scale) * anim.a.current);
        if (anim.a.time > 1) { anim.a.finish = true }
      }
      dim.zoomed.x = _clamp(0, Infinity, (dim.w * tr.scale) - el.clientWidth) / 2;
      dim.zoomed.y = _clamp(0, Infinity, (dim.h * tr.scale) - el.clientHeight) / 2;
      
      if (gesture.d == true && anim.a.finish == true) {
        if (gesture.length <= 1) {
          if (tr.scale > 1) {
          	if (dim.zoomed.x != 0) {
	            tr.x = gesture.c.x + (gesture.move1.x - gesture.start1.x);
            }
            if (dim.zoomed.y != 0) {
      	      tr.y = gesture.c.y + (gesture.move1.y - gesture.start1.y);
            }
          }
        }
        else {
          b = (el.clientWidth > el.clientHeight ? el.clientHeight : el.clientWidth) / 2;
          hh = ((gesture.newDistance - gesture.distance) / b) * (0.5 + gesture.c.scale / 2);
          th1x = (gesture.move1.x - gesture.start1.x);
          th2x = (gesture.move2.x - gesture.start2.x);
          tr.x = gesture.c.x + ((th1x + th2x) / 2) + (gesture.tar.x + gesture.c.x / 2) * hh / (gesture.c.scale / 2);
          th1y = (gesture.move1.y - gesture.start1.y);
          th2y = (gesture.move2.y - gesture.start2.y);
          tr.y = gesture.c.y + ((th1y + th2y) / 2) + (gesture.tar.y + gesture.c.y / 2) * hh / (gesture.c.scale / 2);
          tr.scale = _clamp(0.01, Infinity, gesture.c.scale + hh);
        }
      }
      else {
        if (!(Math.abs(anim.vel.x) > opt.motionStop || Math.abs(anim.vel.y) > opt.motionStop) || anim.a.finish == false) {
          anim.vel.x = 0;
          anim.vel.y = 0;
        }
        if (anim.a.finish == true) {
          tr.x += anim.vel.x * anim.vsync.timestamp;
          tr.y += anim.vel.y * anim.vsync.timestamp;
          
          if (tr.x < 0 - dim.zoomed.x || tr.x > dim.zoomed.x) {
            anim.vel.x += (0 - anim.vel.x) * _clamp(0, 1, 0.12 * anim.vsync.timestamp);
            tr.x += (_clamp(0 - dim.zoomed.x, dim.zoomed.x, tr.x) - tr.x) * _clamp(0, 1, 0.15 * anim.vsync.timestamp);
            
            if (!(tr.x < 0 - dim.zoomed.x - 0.1 || tr.x > dim.zoomed.x + 0.1) && anim.vel.x == 0) {
              tr.x = _clamp(0 - dim.zoomed.x, dim.zoomed.x, tr.x);
            }
          }
          if (tr.y < 0 - dim.zoomed.y || tr.y > dim.zoomed.y) {
            anim.vel.y += (0 - anim.vel.y) * _clamp(0, 1, 0.12 * anim.vsync.timestamp);
            tr.y += (_clamp(0 - dim.zoomed.y, dim.zoomed.y, tr.y) - tr.y) * _clamp(0, 1, 0.15 * anim.vsync.timestamp);
            
            if (!(tr.y < 0 - dim.zoomed.y - 0.1 || tr.y > dim.zoomed.y + 0.1) && anim.vel.y == 0) {
              tr.y = _clamp(0 - dim.zoomed.y, dim.zoomed.y, tr.y);
            }
          }
        }
        anim.vel.x += (0 - anim.vel.x) * _clamp(0, 1, opt.motionDeceleration * anim.vsync.timestamp);
        anim.vel.y += (0 - anim.vel.y) * _clamp(0, 1, opt.motionDeceleration * anim.vsync.timestamp);
      }
      
      ta.style.transform = `translate(${tr.x}px, ${tr.y}px) scale(${tr.scale})`;
      
      init.translation.x = tr.x;
      init.translation.y = tr.y;
      init.translation.scale = tr.scale;
      
      init.dimension.width = dim.zoomed.x * 2;
      init.dimension.height = dim.zoomed.y * 2;
      
      init._execEvent("raf");
      if (tr.x + tr.y + tr.scale != init.ev.moving.x + init.ev.moving.y + init.ev.moving.scale) {
        init.ev.end.e = false;
        init._execEvent("transform.move");
      }
      else {
        if (init.ev.end.e == false && gesture.d == false) {
          init._execEvent("transform.end");
          init.ev.end.e = true;
        }
      }
           
      init.ev.moving.x = tr.x;
      init.ev.moving.y = tr.y;
      init.ev.moving.scale = tr.scale;
      
      if (init.isAnimate) {
        window.requestAnimationFrame(animLoop);
      }
    }
    _resize();
  }
  else {
    error.notSupported = `Element not supported: ${ta.tagName}`;
    console.error(JAVASCRIPT_NAME, error.notSupported);
    throw TypeError(error.notSupported);
  }
  
  Object.defineProperties(init, {
    x: {
      get: function() { return tr.x },
      set: function(v) { tr.x = _clamp(0 - dim.zoomed.x, dim.zoomed.x, v) },
      enumerable: true,
      configurable: true
    },
    y: {
      get: function() { return tr.y },
      set: function(v) { tr.y = _clamp(0 - dim.zoomed.y, dim.zoomed.y, v) },
      enumerable: true,
      configurable: true
    },
    scale: {
      get: function() { return tr.scale },
      set: function(v) { tr.scale = _clamp(1, dim.maxZoomed.scale, v) },
      enumerable: true,
      configurable: true
    },
    velocityX: {
      get: function() { return anim.vel.x * anim.vsync.timestamp },
      set: function(v) { anim.vel.x = v },
      enumerable: true,
      configurable: true
    },
    velocityY: {
      get: function() { return anim.vel.y * anim.vsync.timestamp },
      set: function(v) { anim.vel.y = v },
      enumerable: true,
      configurable: true
    },
  });
  
  init.setTranslation = (x, y, scale, duration, easing) => {
    duration = duration ? duration : 0;
    if (duration != 0) {
      _animate(easing, x, y, scale, duration);
    }
    else {
      ix = _clamp(0, Infinity, (dim.w * _clamp(1, dim.maxZoomed.scale, scale)) - el.clientWidth) / 2;
      iy = _clamp(0, Infinity, (dim.h * _clamp(1, dim.maxZoomed.scale, scale)) - el.clientHeight) / 2;
      anim.a.finish = true;
      tr.scale = _clamp(1, dim.maxZoomed.scale, scale);
      tr.x = _clamp(0 - ix, ix, x);
      tr.y = _clamp(0 - iy, iy, y);
    }
    gesture.d = false;
    gesture.m = false;
  }
  init.byTranslation = (x, y, scale, duration, easing) => {
    duration = duration ? duration : 0;
    if (duration != 0) {
      _animate(easing, tr.x + x, tr.y + y, tr.scale + scale, duration);
    }
    else {
      ix = _clamp(0, Infinity, (dim.w * _clamp(1, dim.maxZoomed.scale, tr.scale + scale)) - el.clientWidth) / 2;
      iy = _clamp(0, Infinity, (dim.h * _clamp(1, dim.maxZoomed.scale, tr.scale + scale)) - el.clientHeight) / 2;
      anim.a.finish = true;
      tr.scale = _clamp(1, dim.maxZoomed.scale, tr.scale + scale);
      tr.x = _clamp(0 - ix, ix, tr.x + x);
      tr.y = _clamp(0 - iy, iy, tr.y + y);
    }
    gesture.d = false;
    gesture.m = false;
  }
  init.reset = () => {
    _resize();
  }
  init.updateOptions = (o) => {
    opt.initialX = o.initialX ? o.initialX : opt.initialX;
    opt.initialY = o.initialY ? o.initialY : opt.initialY;
    opt.initialScale = o.initialScale ? o.initialScale : opt.initialScale;
    opt.maxScale = o.maxScale ? o.maxScale : opt.maxScale;
    opt.motionDeceleration = _clamp(0.01, 0.25, o.deceleration ? o.deceleration : opt.motionDeceleration);
    opt.motionStop = _clamp(0.01, 4, o.stopMotion ? o.stopMotion : opt.motionStop);
    opt.easeZoom = o.easeZoom ? o.easeZoom : opt.easeZoom;
    opt.easeZoomDuration = _clamp(100, 750, o.easeZoomDuration ? o.easeZoomDuration : opt.easeZoomDuration);
    _resize();
  }
  init.updateChild = (index) => {
    ta = el.querySelectorAll("*")[index && typeof index == "number" ? index : 0];
    init.el.content = ta;
    if (!animLoop) {
      animLoop();
    }
    _resize();
  }
  init.startAnimation = () => {
    if (!init.isAnimate) {
      init.isAnimate = true;
      animLoop();
    }
  }
  init.stopAnimation = () => {
    if (init.isAnimate) {
      init.isAnimate = false;
    }
  }
  if (!el.hasAttribute("start-manually")) {
    init.startAnimation();
  }
}

//Inside Function
HTMLElement.prototype.ElementPanZoom = function(func) {
  this.main = new ElementPanZoom(this);
  this.func = func;
  if (this.func != null && typeof this.func == "function") {
    this.func();
  }
  else {
    if (typeof this.func != "function") {
      let errorFunc = `(Type: ${typeof this.func}) => ${this.func} is not a function.`;
      console.error(JAVASCRIPT_NAME, errorFunc);
      throw TypeError(errorFunc);
    }
  }
}
