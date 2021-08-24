HTMLElement.prototype.ElementPanZoom = function() {
  let el = this;
  let ta = el.querySelector("*");
  let _bezier = (easingType, x) => {
    let eType = easingType.toLowerCase();
    
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
      return x;
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
  let error = {}
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
    motionStop: _clamp(0.01, 4, Number(el.getAttribute("stopMotion") || 0.125)),
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
    duration = duration ? duration : 0;
    anim.a.finish = false;
    anim.a.timestart = performance.now();
    anim.a.easeName = easing;
    anim.a.s.x = tr.x;
    anim.a.s.y = tr.y;
    anim.a.s.scale = tr.scale;
    anim.a.e.x = _clamp(0 - dim.maxZoomed.x, dim.maxZoomed.x, x);
    anim.a.e.y = _clamp(0 - dim.maxZoomed.y, dim.maxZoomed.y, y);
    anim.a.e.scale = _clamp(1, dim.maxZoomed.scale, scale);
    anim.a.duration = duration;
  }
  
  listeners("touchstart mousedown", (e) => {
    anim.a.finish = true;
    if (gesture.d != true && anim.a.finish == true) {
      gesture.length = e.touches ? e.touches.length : 0;
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
      if (tr.scale != 1) {
        e.stopPropagation();
      }
    }
  });
  listeners("touchmove mousemove", (e) => {
    if (e.touches && anim.a.finish == true) { gesture.d = true }
    if (gesture.d == true && anim.a.finish == true) {
      gesture.length = e.touches ? e.touches.length : 0;
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
    }
  });
  listeners("touchend mouseleave mouseup", (e) => {
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
      if (tr.scale != 1) {
        e.stopPropagation();
      }
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
        anim.vel.x += (0 - anim.vel.x) * _clamp(0, 1, opt.motionDeceleration * anim.vsync.timestamp);
        anim.vel.y += (0 - anim.vel.y) * _clamp(0, 1, opt.motionDeceleration * anim.vsync.timestamp);
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
      }
      
      ta.style.transform = `translate(${tr.x}px, ${tr.y}px) scale(${tr.scale})`;
      window.requestAnimationFrame(animLoop);
    }
    animLoop();
    _resize();
  }
  else {
    error.notSupported = "Element not supported: " + ta.tagName;
    console.error(error.notSupported);
    throw TypeError(error.notSupported);
  }
}
