///=========GAMEPAD TRANLATER=========
//%%%%%%%%%%% STATE %%%%%%%%%%%

let gp = null;
let waiting = null;

const SAVE_KEY = "gp_mapping_v1";

let mapping = {
  Jump: null,
  Sprint: null,
  Crouch: null,
  Attack: null,
  Use: null,
  PickBlock: null,
  ScrollUp: null,
  ScrollDown: null,
  Inventory: null,
  Escape: null,
  Chat: null,
  F3: null,
  F5: null
};

let held = {};
let keyState = {};

//%%%%%%%% MOUSE PRIORITY %%%%%%%%%

let mouseButtons = {
  0:false,
  1:false,
  2:false
};

let lastRealMouseActivity = 0;
let syntheticMouseEvent = false;

const MOUSE_PRIORITY_TIME = 250;

function realMouseActivity(){

  if(syntheticMouseEvent) return;

  lastRealMouseActivity = performance.now();

}

function mouseIsActive(){

  return performance.now() - lastRealMouseActivity < MOUSE_PRIORITY_TIME;

}

function realMouseButtonDown(button){

  return mouseButtons[button] === true;

}

//%%%%%%%% LOAD / SAVE %%%%%%%%

function saveMapping(){

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(mapping)
  );

}

function loadMapping(){

  try{

    const m = JSON.parse(
      localStorage.getItem(SAVE_KEY)
    );

    if(m) mapping = m;

  }catch(e){}

}

//%%%%%%%% DRAW CANVAS %%%%%%%%%

function getCanvas(){

  const list = document.querySelectorAll("canvas");

  for(const c of list){

    if(c.width < 400 || c.height < 300) continue;

    const r = c.getBoundingClientRect();

    if(r.width < 400 || r.height < 300) continue;

    return c;

  }

  return null;

}

//%%%%%% GAMEPAD DETECTION %%%%%%

function getPad(){

  const pads =
    navigator.getGamepads?.() || [];

  for(const p of pads){

    if(p && p.connected) return p;

  }

  return null;

}

//%%%%%%%% REAL MOUSE DETECTION %%%%%%%%

function setupMouseDetection(){

  document.addEventListener("mousedown",e=>{

    if(syntheticMouseEvent) return;

    mouseButtons[e.button] = true;

    realMouseActivity();

  },true);

  document.addEventListener("mouseup",e=>{

    if(syntheticMouseEvent) return;

    mouseButtons[e.button] = false;

    realMouseActivity();

  },true);

  document.addEventListener("mousemove",e=>{

    if(syntheticMouseEvent) return;

    realMouseActivity();

  },true);

  document.addEventListener("wheel",e=>{

    if(syntheticMouseEvent) return;

    realMouseActivity();

  },true);

  window.addEventListener("blur",()=>{

    mouseButtons[0] = false;
    mouseButtons[1] = false;
    mouseButtons[2] = false;

  });

}

//%%%%%%%%%%%% KEYS %%%%%%%%%%%%%

function setKey(code, pressed){

  if(keyState[code] === pressed) return;

  keyState[code] = pressed;

  const keyMap = {

    KeyW:{key:"w",keyCode:87},
    KeyA:{key:"a",keyCode:65},
    KeyS:{key:"s",keyCode:83},
    KeyD:{key:"d",keyCode:68},

    Space:{key:" ",keyCode:32},
    ShiftLeft:{key:"Shift",keyCode:16},
    ControlLeft:{key:"Control",keyCode:17},

    KeyE:{key:"e",keyCode:69},
    Escape:{key:"Escape",keyCode:27},
    KeyT:{key:"t",keyCode:84},

    F3:{key:"F3",keyCode:114},
    F5:{key:"F5",keyCode:116}

  };

  const k = keyMap[code];

  if(!k) return;

  document.dispatchEvent(

    new KeyboardEvent(

      pressed ? "keydown" : "keyup",

      {
        key:k.key,
        code:code,
        keyCode:k.keyCode,
        which:k.keyCode,
        bubbles:true
      }

    )

  );

}

//%%%%%%%%%%%% MOUSE %%%%%%%%%%%%

function mouseDown(button){

  if(realMouseButtonDown(button)) return;

  const c = getCanvas();

  if(!c) return;

  syntheticMouseEvent = true;

  c.dispatchEvent(

    new MouseEvent(

      "mousedown",

      {
        button:button,
        bubbles:true
      }

    )

  );

  syntheticMouseEvent = false;

}

function mouseUp(button){

  const c = getCanvas();

  if(!c) return;

  syntheticMouseEvent = true;

  c.dispatchEvent(

    new MouseEvent(

      "mouseup",

      {
        button:button,
        bubbles:true
      }

    )

  );

  syntheticMouseEvent = false;

}

function mouseMove(x,y){

  if(mouseIsActive()) return;

  const c = getCanvas();

  if(!c) return;

  syntheticMouseEvent = true;

  c.dispatchEvent(

    new MouseEvent(

      "mousemove",

      {
        movementX:x,
        movementY:y,
        bubbles:true
      }

    )

  );

  syntheticMouseEvent = false;

}

function scroll(v){

  if(mouseIsActive()) return;

  const c = getCanvas();

  if(!c) return;

  syntheticMouseEvent = true;

  c.dispatchEvent(

    new WheelEvent(

      "wheel",

      {
        deltaY:v,
        bubbles:true
      }

    )

  );

  syntheticMouseEvent = false;

}

//%%%%%%%%%% ACTIONS %%%%%%%%%%

function tapKey(code){

  setKey(code,true);

  setTimeout(
    ()=>setKey(code,false),
    30
  );

}

function runAction(a, down){

  switch(a){

    case "Jump":

      setKey("Space",down);

      break;

    case "Sprint":

      setKey("ControlLeft",down);

      break;

    case "Crouch":

      setKey("ShiftLeft",down);

      break;

    case "Inventory":

      if(down && !held.inv){

        tapKey("KeyE");

        held.inv = true;

      }

      if(!down){

        held.inv = false;

      }

      break;

    case "Escape":

      if(down && !held.esc){

        tapKey("Escape");

        held.esc = true;

      }

      if(!down){

        held.esc = false;

      }

      break;

    case "Chat":

      if(down && !held.chat){

        tapKey("KeyT");

        held.chat = true;

      }

      if(!down){

        held.chat = false;

      }

      break;

    case "F3":

      if(down && !held.f3){

        tapKey("F3");

        held.f3 = true;

      }

      if(!down){

        held.f3 = false;

      }

      break;

    case "F5":

      if(down && !held.f5){

        tapKey("F5");

        held.f5 = true;

      }

      if(!down){

        held.f5 = false;

      }

      break;

    case "Attack":

      if(realMouseButtonDown(0)){

        if(held.attack){

          mouseUp(0);

          held.attack = false;

        }

        break;

      }

      if(down && !held.attack){

        mouseDown(0);

        held.attack = true;

      }

      if(!down && held.attack){

        mouseUp(0);

        held.attack = false;

      }

      break;

    case "Use":

      if(realMouseButtonDown(2)){

        if(held.use){

          mouseUp(2);

          held.use = false;

        }

        break;

      }

      if(down && !held.use){

        mouseDown(2);

        held.use = true;

      }

      if(!down && held.use){

        mouseUp(2);

        held.use = false;

      }

      break;

    case "PickBlock":

      if(realMouseButtonDown(1)){

        if(held.pick){

          mouseUp(1);

          held.pick = false;

        }

        break;

      }

      if(down && !held.pick){

        mouseDown(1);

        held.pick = true;

      }

      if(!down && held.pick){

        mouseUp(1);

        held.pick = false;

      }

      break;

    case "ScrollUp":

      if(down && !held.scrollUp){

        if(!mouseIsActive()){

          scroll(-120);

          held.scrollUp = true;

        }

      }

      if(!down){

        held.scrollUp = false;

      }

      break;

    case "ScrollDown":

      if(down && !held.scrollDown){

        if(!mouseIsActive()){

          scroll(120);

          held.scrollDown = true;

        }

      }

      if(!down){

        held.scrollDown = false;

      }

      break;

  }

}

//%%%%%%%%%%%%%% UI %%%%%%%%%%%%%%

function createUI(){

  if(document.getElementById("gp_btn")) return;

  if(!document.body){

    setTimeout(createUI,100);

    return;

  }

  const btn = document.createElement("button");

  btn.id = "gp_btn";
  btn.innerText = "🛠";

  Object.assign(btn.style,{

    position:"fixed",
    bottom:"20px",
    right:"20px",
    zIndex:"2147483647",
    padding:"10px",
    background:"#030126",
    color:"#ebecfa",
    fontFamily:"monospace",
    border:"2px solid #4d4b70",
    cursor:"pointer",
    display:"block",
    pointerEvents:"auto"

  });

  const panel = document.createElement("div");

  panel.id = "gp_panel";

  Object.assign(panel.style,{

    position:"fixed",
    top:"50%",
    left:"50%",
    transform:"translate(-50%,-50%)",
    width:"340px",
    maxHeight:"70vh",
    overflowY:"auto",
    background:"#02011c",
    color:"#e1e3f7",
    padding:"12px",
    display:"none",
    zIndex:"2147483647",
    fontFamily:"monospace",
    border:"1px solid #555",
    boxShadow:"0 0 20px rgba(0,0,0,0.7)",
    pointerEvents:"auto"

  });

  btn.onclick = ()=>{

    panel.style.display =
      panel.style.display === "block"
      ? "none"
      : "block";

  };

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  renderUI();

}

function renderUI(){

  const panel =
    document.getElementById("gp_panel");

  if(!panel) return;

  panel.innerHTML =
    "<h3 style='margin-top:0'>Gamepad Remapper</h3>";

  Object.keys(mapping).forEach(k=>{

    const row =
      document.createElement("div");

    row.style.marginBottom = "6px";

    const label =
      document.createElement("span");

    label.innerText = k;

    Object.assign(label.style,{

      display:"inline-block",
      width:"150px",
      color:"#aab0ff"

    });

    const b =
      document.createElement("button");

    b.innerText =
      mapping[k] ?? "SET";

    Object.assign(b.style,{

      padding:"3px 6px",
      background:"#222",
      color:"#fff",
      border:"1px solid #555",
      cursor:"pointer",
      pointerEvents:"auto"

    });

    b.onclick = ()=>{

      waiting = k;

      b.innerText = "Press...";

    };

    row.appendChild(label);
    row.appendChild(b);

    panel.appendChild(row);

  });

}

//%%%%%%%%%%%% REMAP %%%%%%%%%%%%

function handleRemap(gp){

  if(!waiting) return;

  gp.buttons.forEach((b,i)=>{

    if(b.pressed){

      mapping[waiting] = i;

      waiting = null;

      saveMapping();

      renderUI();

    }

  });

}

function movement(gp){

  const lx = gp.axes[0];
  const ly = gp.axes[1];

  const dz = 0.25;

  setKey(
    "KeyW",
    ly < -dz
  );

  setKey(
    "KeyS",
    ly > dz
  );

  setKey(
    "KeyA",
    lx < -dz
  );

  setKey(
    "KeyD",
    lx > dz
  );

}

function camera(gp){

  if(mouseIsActive()) return;

  let rx = gp.axes[2];
  let ry = gp.axes[3];

  const dz = 0.12;

  if(Math.abs(rx) < dz) rx = 0;
  if(Math.abs(ry) < dz) ry = 0;

  rx =
    Math.sign(rx) *
    rx *
    rx;

  ry =
    Math.sign(ry) *
    ry *
    ry;

  mouseMove(
    rx * 12,
    ry * 12
  );

}

//%%%%%%%%%%% LOOP %%%%%%%%%%%

function loop(){

  gp = getPad();

  if(gp){

    handleRemap(gp);

    movement(gp);

    camera(gp);

    for(const a in mapping){

      const id = mapping[a];

      if(id == null) continue;

      const btn = gp.buttons[id];

      if(!btn) continue;

      runAction(
        a,
        btn.pressed
      );

    }

  }

  requestAnimationFrame(loop);

}

//%%%%%%%%%%% START %%%%%%%%%%%

function startGamepad(){

  loadMapping();

  setupMouseDetection();

  // Wait for Eaglercraft's loading UI to finish refreshing
  setTimeout(()=>{

    createUI();

  },3000);

  requestAnimationFrame(loop);

}

//%%%%%%%%%%% LOAD %%%%%%%%%%%

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    startGamepad
  );

}else{

  startGamepad();

}  

//%%%%%%%%%%% WAIT FOR PAGE %%%%%%%%%%%

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    startGamepad
  );

}else{

  startGamepad();

}
