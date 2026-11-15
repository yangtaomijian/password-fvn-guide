(()=>{const root=document.getElementById('pw-home-scene');if(!root)return;const english=document.documentElement.lang.startsWith('en');root.classList.add('js-ready');try{
function syncSceneWidth(){
 const viewport=document.documentElement.clientWidth;
 const width=viewport;
 const current=root.getBoundingClientRect();
 const oldMargin=parseFloat(getComputedStyle(root).marginLeft)||0;
 const origin=current.left-oldMargin;
 const offset=(viewport-width)/2-origin;
 if(root.style.getPropertyValue('--home-stage-width')!==width+'px')root.style.setProperty('--home-stage-width',width+'px');
 if(root.style.getPropertyValue('--home-stage-offset')!==offset+'px')root.style.setProperty('--home-stage-offset',offset+'px');
}
syncSceneWidth();
'use strict';
const tabs = [...root.querySelectorAll('[role="tab"]')];
const labels = ['01 / ROUTES','02 / PASSWORDS','03 / COLLECTIONS'];
let activeIndex = 0;
let turningSheet = null;
let turnTimeout = null;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function clearTurn() {
  root.querySelector('.right-page')?.classList.remove('is-turning-mobile');
  if (turnTimeout !== null) window.clearTimeout(turnTimeout);
  turnTimeout = null;
  if (turningSheet) turningSheet.remove();
  turningSheet = null;
}
function cleanClone(source, extraClass) {
  const clone = source.cloneNode(true);
  clone.classList.add('sheet-face', extraClass);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  clone.querySelectorAll('[aria-labelledby], [aria-controls]').forEach(n => {n.removeAttribute('aria-labelledby'); n.removeAttribute('aria-controls');});
  clone.querySelectorAll('a,button,input,select,[tabindex]').forEach(n => n.setAttribute('tabindex','-1'));
  return clone;
}
function turnPage() {
  clearTurn();
  if (motionPreference.matches) return;
  const page = root.querySelector('.right-page');
  const book = root.querySelector('.scene');
  if (!page || !book || page.offsetWidth === 0) return;
  const sheet = document.createElement('div');
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  sheet.className = 'turning-sheet' + (mobile ? ' mobile-turn' : '');
  sheet.setAttribute('aria-hidden','true');
  sheet.inert = true;
  Object.assign(sheet.style, {left: page.offsetLeft+'px', top: page.offsetTop+'px', width: page.offsetWidth+'px', height: page.offsetHeight+'px'});
  sheet.append(cleanClone(page,'sheet-front'));
  if(!mobile) sheet.append(cleanClone(root.querySelector('.left-page'),'sheet-back'));
  book.append(sheet);
  turningSheet = sheet;
  sheet.addEventListener('animationend', event => { if (event.target === sheet && turningSheet === sheet) clearTurn(); });
  turnTimeout = window.setTimeout(() => { if(turningSheet === sheet) clearTurn(); }, 800);
}
function completeTurn() {
  if(!turningSheet) return;
  if(turningSheet.classList.contains('mobile-turn')) {
    const livePage = root.querySelector('.right-page');
    turningSheet.append(cleanClone(livePage,'sheet-incoming'));
    livePage.classList.add('is-turning-mobile');
  }
}
motionPreference.addEventListener('change', () => { if(motionPreference.matches) clearTurn(); });
function stabilizeMobileHeight() {
  const page = root.querySelector('.right-page');
  page.style.minHeight = '';
  if(!window.matchMedia('(max-width: 760px)').matches) return;
  const panels = [...page.querySelectorAll('.panel')];
  const prior = panels.map(panel => panel.hidden);
  let height = 0;
  panels.forEach((panel,index) => {
    panels.forEach((p,i) => {p.hidden=i!==index;});
    height = Math.max(height,page.offsetHeight);
  });
  panels.forEach((panel,index)=>{panel.hidden=prior[index];});
  page.style.minHeight = height+'px';
}
window.addEventListener('resize', () => {syncSceneWidth();clearTurn();stabilizeMobileHeight();});

// Keep only the selected tab in this browser-history entry. No persistent storage,
// URL change, extra history entry, scroll restoration or media preference is added.
const historyKey='pwNotebookTabV1';
function rememberTab(){
  try {
    const state=window.history.state;
    if(state!==null&&(typeof state!=='object'||Array.isArray(state)))return;
    window.history.replaceState({...state,[historyKey]:{path:window.location.pathname,key:tabs[activeIndex].dataset.key}},'');
  } catch(_) { /* Navigation must remain usable when history updates are unavailable. */ }
}
function restoreTab(){
  const saved=window.history.state?.[historyKey];
  if(!saved||saved.path!==window.location.pathname)return;
  const index=tabs.findIndex(tab=>tab.dataset.key===saved.key);
  if(index<0)return;
  clearTurn();activate(index,false,false,false);
}
function activate(index, focus=false, userInitiated=false, animate=true) {
  if (index !== activeIndex && animate) {turnPage();if(userInitiated) playPageSound();}
  activeIndex = index;
  tabs.forEach((tab,i)=>{
    const selected=i===index;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
  });
  document.getElementById('section-label').textContent=labels[index];
  document.getElementById('page-number').textContent=String(index+1).padStart(2,'0');
  completeTurn();
  if(focus) tabs[index].focus({preventScroll:true});
  if(userInitiated) rememberTab();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(index,false,true));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=tabs.length-1;
    if(next!==undefined){event.preventDefault();activate(next,true,true);}
  });
});
document.getElementById('reveal').addEventListener('click',event=>{
  event.currentTarget.setAttribute('aria-expanded','true');
  document.getElementById('collection-links').hidden=false;
  event.currentTarget.hidden=true;
  stabilizeMobileHeight();
  root.querySelector('#collection-links a').focus({preventScroll:true});
});

restoreTab();
window.addEventListener('pageshow',restoreTab);
window.addEventListener('popstate',restoreTab);

// Quarto owns theme persistence and controls.
function syncTheme(){root.dataset.theme=document.body.classList.contains('quarto-dark')?'dark':'light';syncSceneWidth();}
let observedParentWidth=-1;
new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-observedParentWidth)<.5)return;observedParentWidth=width;window.requestAnimationFrame(()=>{syncSceneWidth();stabilizeMobileHeight();scheduleJourney();});}).observe(root.parentElement);
syncTheme();new MutationObserver(syncTheme).observe(document.body,{attributes:true,attributeFilter:['class']});

stabilizeMobileHeight();

// 2.5D from ordinary document scroll: no wheel/touch interception.
const journey=document.getElementById('journey');
const cameraBook=document.getElementById('notebook');
const skipJourney=document.getElementById('skip-journey');
const normalView=document.getElementById('normal-view');
const compactJourney=window.matchMedia('(max-width: 900px), (max-height: 600px)');
// display:contents outside compact motion retains the desktop containing block.
const compactTrack=document.createElement('div'),compactViewport=document.createElement('div');
compactTrack.className='compact-track';compactViewport.className='compact-viewport';
const travelStage=journey.querySelector('.travel-stage'),bookCarrier=journey.querySelector('.book-carrier');
travelStage.insertBefore(compactTrack,travelStage.firstChild);compactTrack.append(compactViewport);
for(const element of [...travelStage.children]){if(element===compactTrack)continue;if(element===bookCarrier)break;compactViewport.append(element);}

let manualNormal=false, journeyFrame=null;
function clamp01(value){return Math.min(1,Math.max(0,value));}
function easeCamera(t){return t*t*(3-2*t);}
function isNormalJourney(){return manualNormal||motionPreference.matches||compactJourney.matches;}
function updateJourney(){
 journeyFrame=null;const normal=isNormalJourney(),compact=compactJourney.matches;
 const lightMotion=compact&&!manualNormal&&!motionPreference.matches;
 journey.classList.toggle('normal-reading',normal);
 journey.classList.toggle('light-motion',lightMotion);
 normalView.setAttribute('aria-pressed',String(manualNormal||motionPreference.matches));
 normalView.textContent=compact?(lightMotion?(english?'Reduce motion':'减少动态'):(english?'Enable motion':'启用动态')):(normal?(english?'Camera view':'镜头模式'):(english?'Read without motion':'正常浏览'));
 normalView.hidden=motionPreference.matches;
 if(normal){
  cameraBook.inert=false;
  if(lightMotion){
   // Crop only the existing vault image. Reading content stays in ordinary flow.
   const range=160;
   // Short sticky hold keeps the vault visible while the notebook approaches.
   const p=clamp01(window.scrollY/Math.max(1,range));
   const approach=1-Math.pow(1-p,2);
   journey.style.setProperty('--compact-scale',1+approach*.38);
   journey.style.setProperty('--compact-x',(-approach*24)+'px');
   journey.style.setProperty('--compact-y',(approach*14)+'px');
  }
  return;
 }
 const rect=journey.getBoundingClientRect(),distance=journey.offsetHeight-window.innerHeight;
 const p=clamp01(-rect.top/Math.max(1,distance)),approach=easeCamera(clamp01(p/.55)),lift=easeCamera(clamp01((p-.18)/.82));
 journey.style.setProperty('--journey-progress',p);journey.style.setProperty('--intro-opacity',1-clamp01(p/.26));
 journey.style.setProperty('--back-scale',1+approach*.28+lift*.06);journey.style.setProperty('--back-x',(-approach*3)+'%');journey.style.setProperty('--back-y',(-approach*2+lift*3)+'%');
 journey.style.setProperty('--post-x',(approach*130)+'px');journey.style.setProperty('--post-scale',1+approach*.65);
 journey.style.setProperty('--book-y',((1-lift)*118)+'vh');journey.style.setProperty('--book-angle',((1-lift)*58)+'deg');const fit=Math.min(1,(window.innerHeight-112)/Math.max(1,cameraBook.offsetHeight));journey.style.setProperty('--book-scale',(.58+lift*.42)*fit);// Visibility, not the camera's nearly-complete progress, governs interaction.
 const visible=cameraBook.getBoundingClientRect().top<window.innerHeight-24;
 if(!visible&&cameraBook.contains(document.activeElement))skipJourney.focus({preventScroll:true});
 cameraBook.inert=!visible;
}
function scheduleJourney(){if(journeyFrame===null)journeyFrame=window.requestAnimationFrame(updateJourney);}
window.addEventListener('scroll',scheduleJourney,{passive:true});window.addEventListener('resize',scheduleJourney);compactJourney.addEventListener('change',scheduleJourney);motionPreference.addEventListener('change',scheduleJourney);
function jumpToBook(event){if(event){event.preventDefault();event.stopPropagation();}const top=window.scrollY+journey.getBoundingClientRect().top,end=top+journey.offsetHeight-window.innerHeight;window.scrollTo({top:isNormalJourney()?window.scrollY+cameraBook.getBoundingClientRect().top-44:end+2,behavior:'instant'});updateJourney();cameraBook.focus({preventScroll:true});}
let keyboardNavigation=false;
document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboardNavigation=true;},true);
document.addEventListener('pointerdown',()=>{keyboardNavigation=false;},true);
cameraBook.addEventListener('focusin',()=>{
 if(keyboardNavigation&&!isNormalJourney()){
  const p=Number(journey.style.getPropertyValue('--journey-progress'));
  if(p<.995){
   const target=document.activeElement;
   jumpToBook();
   target.focus({preventScroll:true});
  }
 }
});
skipJourney.addEventListener('click',jumpToBook);
root.querySelector('.home-skip').addEventListener('click',jumpToBook);
normalView.addEventListener('click',()=>{manualNormal=!manualNormal;updateJourney();if(compactJourney.matches)return;if(manualNormal){cameraBook.scrollIntoView({behavior:'instant',block:'start'});cameraBook.focus({preventScroll:true});}else{journey.scrollIntoView({behavior:'instant',block:'start'});updateJourney();}});
updateJourney();


// Opt-in page recording by StarNinjas, CC0. Only the user's sound preference is saved locally.
// One media element: rapid turns restart rather than overlap.
const soundToggle=document.getElementById('page-sound');
const pageSound=new Audio('assets/home-scene/page-turn.mp3');
pageSound.preload='none';pageSound.volume=.42;
const soundPreferenceKey='pw.home.pageSound.v1';
let soundEnabled=false,lastSoundAt=-Infinity;
try{soundEnabled=window.localStorage.getItem(soundPreferenceKey)==='on';}catch(_){}
function syncSoundControl(){
 soundToggle.setAttribute('aria-pressed',String(soundEnabled));
 soundToggle.textContent=soundEnabled?(english?'Page sound: on':'翻页声：开'):(english?'Page sound: off':'翻页声：关');
}
syncSoundControl();
// Restoring the preference may load our local asset, never play it.
if(soundEnabled){pageSound.preload='auto';pageSound.load();}
function stopPageSound(){pageSound.pause();pageSound.currentTime=0;}
function playPageSound(){
 if(!soundEnabled||document.hidden)return;
 const now=performance.now();if(now-lastSoundAt<100)return;
 lastSoundAt=now;stopPageSound();
 const playback=pageSound.play();
 if(playback)playback.catch(()=>{soundEnabled=false;stopPageSound();soundToggle.setAttribute('aria-pressed','false');soundToggle.textContent=english?'Page sound: off':'翻页声：关';});
}
soundToggle.addEventListener('click',()=>{
 soundEnabled=!soundEnabled;
 syncSoundControl();
 try{window.localStorage.setItem(soundPreferenceKey,soundEnabled?'on':'off');}catch(_){}
 if(soundEnabled){pageSound.preload='auto';pageSound.load();}else stopPageSound();
});
window.addEventListener('pageshow',()=>{
 try{soundEnabled=window.localStorage.getItem(soundPreferenceKey)==='on';}catch(_){}
 syncSoundControl();
 if(!soundEnabled)stopPageSound();
});
window.addEventListener('storage',event=>{
 if(event.key!==soundPreferenceKey&&event.key!==null)return;
 soundEnabled=event.key===soundPreferenceKey&&event.newValue==='on';
 syncSoundControl();
 if(!soundEnabled)stopPageSound();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPageSound();});

}catch(error){root.classList.remove('js-ready');root.querySelectorAll('[inert]').forEach(node=>{node.inert=false;});console.error('Homepage scene unavailable; showing guide links.',error);}
})();