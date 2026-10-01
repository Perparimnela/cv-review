/* ====================================================================
   LAB · BUG-017 — VËZHGUES I KONTEKSTIT (vetëm te kopja eksperimentale cv-review/lab/, me të dhëna fiktive)

   VETËM VËZHGON. Nuk ndryshon pamjen dhe as funksionimin e asnjë dizajni: asnjë stil, asnjë element i ri
   në faqe, asnjë preventDefault, dëgjuesit janë pasivë. Pronari e vendosi kështu më 2026-10-01
   ("nuk dua që të ndryshohet asnjë gjë nga ana vizuale dhe funksionale e Designit").

   Plotëson CVFrame (i cili mat prodhimin e kuadrove) me dy gjëra që ai nuk i ka:
     1. REGJISTRI I TËRHEQJEVE — për çdo tërheqje: dizajni, elementi, kohëzgjatja. Pa këtë nuk dihet
        emëruesi: sa tërheqje / sa sekonda në secilin dizajn kaluan PA nxirje.
     2. KONTEKSTI I RASTIT — te Shift×3 (i njëjti shënim si CVFrame): ndërtimi, dizajni, tërheqja aktive
        dhe e fundit, numri i elementeve me hije dhe shuma e turbullimit (matja e ADR-033), DPR, dritarja,
        ekrani, dukshmëria, ora, dhe rasti i fundit i CVFrame.
   Hijet numërohen 1,5 s PAS shënimit, që matja të mos bjerë brenda dritares 8-sekondëshe të CVFrame.

   Ruajtja: localStorage 'cv_lab_bug017_drags' (deri 500) dhe 'cv_lab_bug017_context' (deri 20).
   Leximi: lab/report.html, ose në console CVLab.entries().
   ==================================================================== */
(function(){
  var DRAGS='cv_lab_bug017_drags', CTX='cv_lab_bug017_context', MAX_DRAGS=500, MAX_CTX=20;
  var LAB='bug017-lab-1';
  var down=null, last=null, shifts=[], seen=typeof WeakSet==='function' ? new WeakSet() : null;

  function read(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]')||[]; }catch(_){ return []; } }
  function push(k, v, cap){ try{ var a=read(k); a.push(v); if(a.length>cap) a=a.slice(-cap); localStorage.setItem(k, JSON.stringify(a)); }catch(_){} }
  function design(){
    try{ var s=window.cvApp&&cvApp.getTerminal('personal').module.appState.getState(); return String(s&&s.template||'default'); }
    catch(_){ return '?'; }
  }
  function desc(el){
    try{
      var out=[], x=el;
      for(var i=0; x&&x.nodeType===1&&i<4; i++, x=x.parentElement){
        out.push(x.tagName.toLowerCase()+(x.id?'#'+x.id:'')+(x.classList&&x.classList.length?'.'+[].slice.call(x.classList,0,3).join('.'):''));
      }
      return out.join(' < ');
    }catch(_){ return '?'; }
  }
  function onDown(e, where){
    down={ t:performance.now(), iso:new Date().toISOString(), where:where, target:desc(e.target),
           x:Math.round(e.clientX), y:Math.round(e.clientY), pointer:e.pointerType, design:design() };
  }
  function onUp(e){
    if(!down) return;
    var d=Object.assign({}, down, { durMs:Math.round(performance.now()-down.t), dy:Math.round(e.clientY-down.y) });
    delete d.t; last=d; down=null;
    if(d.durMs>=300) push(DRAGS, d, MAX_DRAGS);   /* vetëm tërheqje, jo klikime */
  }
  function census(doc){
    var n=0, layers=0, blur=0;
    try{
      var w=doc.defaultView, all=doc.querySelectorAll('*');
      for(var i=0;i<all.length;i++){
        var cs=w.getComputedStyle(all[i]);
        if(cs.display==='none'||cs.visibility==='hidden') continue;
        var bs=cs.boxShadow; if(!bs||bs==='none') continue;
        n++;
        bs.split(/,(?![^(]*\))/).forEach(function(p){
          layers++;
          var nums=p.replace(/rgba?\([^)]*\)/g,'').match(/-?\d+(\.\d+)?px/g)||[];
          if(nums.length>=3) blur+=Math.abs(parseFloat(nums[2]));
        });
      }
    }catch(_){}
    return { elements:n, layers:layers, blurSum:Math.round(blur) };
  }
  function frameDocs(){
    var docs=[];
    try{ [].forEach.call(document.querySelectorAll('iframe'), function(f){ try{ if(f.contentDocument) docs.push(f.contentDocument); }catch(_){} }); }catch(_){}
    return docs;
  }
  function cvframeLast(){
    try{
      var o=JSON.parse(localStorage.getItem('cv_bug017_frames')||'null'); if(!o||!o.episodes||!o.episodes.length) return null;
      var ep=o.episodes[o.episodes.length-1];
      return { count:o.episodes.length, saved:o.saved, origin:ep.origin, verdict:ep.verdict };
    }catch(_){ return null; }
  }
  function snapshot(trigger){
    var markIso=new Date().toISOString(), active=down?Object.assign({}, down, { heldMs:Math.round(performance.now()-down.t) }):null;
    if(active) delete active.t;
    var lastDrag=last;
    setTimeout(function(){
      var frames=frameDocs().map(census);
      push(CTX, {
        lab:LAB, trigger:trigger, markIso:markIso, build:(window.CV&&CV.build)||'?', design:design(),
        activeDrag:active, lastDrag:lastDrag,
        shadows:{ page:census(document), frames:frames },
        dpr:window.devicePixelRatio, viewport:innerWidth+'x'+innerHeight, screen:screen.width+'x'+screen.height,
        visibility:document.visibilityState, ua:navigator.userAgent, cvframe:cvframeLast()
      }, MAX_CTX);
    }, 1500);
  }
  function onKey(e){
    if(e.key!=='Shift'||e.repeat) return;
    var now=performance.now(); shifts.push(now); shifts=shifts.filter(function(t){ return now-t<=800; });
    if(shifts.length>=3){ shifts=[]; snapshot('shift3'); }
  }
  function attach(w, where){
    try{
      if(!w||(seen&&seen.has(w))) return; if(seen) seen.add(w);
      w.addEventListener('pointerdown', function(e){ onDown(e, where); }, { capture:true, passive:true });
      w.addEventListener('pointerup', onUp, { capture:true, passive:true });
      w.addEventListener('pointercancel', onUp, { capture:true, passive:true });
      w.addEventListener('keydown', onKey, { capture:true, passive:true });
    }catch(_){}
  }
  attach(window, 'page');
  function attachFrames(){ try{ [].forEach.call(document.querySelectorAll('iframe'), function(f){ attach(f.contentWindow, 'frame'); f.addEventListener('load', function(){ attach(f.contentWindow, 'frame'); }); }); }catch(_){} }
  if(document.readyState==='complete') attachFrames(); else addEventListener('load', attachFrames);

  window.CVLab={
    entries:function(){ return { drags:read(DRAGS), contexts:read(CTX) }; },
    snapshot:function(){ snapshot('console'); return 'context recorded in 1.5 s'; }
  };
})();
