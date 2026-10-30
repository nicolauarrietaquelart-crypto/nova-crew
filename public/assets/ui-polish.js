/* NOVA Crew · mobile top-menu accessibility and polished navigation */
(()=>{
 'use strict';
 const menu=document.getElementById('mobileMenu');
 const panel=document.getElementById('sidebar');
 const close=document.getElementById('mobileClose');
 if(!menu||!panel)return;
 const sync=()=>{const opened=panel.classList.contains('open');menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Cerrar menú':'Abrir menú');};
 const observer=new MutationObserver(sync);
 observer.observe(panel,{attributes:true,attributeFilter:['class']});
 close?.addEventListener('click',sync);
 document.addEventListener('pointerdown',event=>{
  if(!panel.classList.contains('open'))return;
  if(panel.contains(event.target)||menu.contains(event.target))return;
  panel.classList.remove('open');sync();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&panel.classList.contains('open')){
   panel.classList.remove('open');sync();menu.focus();
  }
 });
 document.querySelectorAll('#mainNav .nav-btn').forEach(b=>b.addEventListener('click',()=>{panel.classList.remove('open');sync();}));
 window.addEventListener('resize',()=>{if(window.innerWidth>900&&panel.classList.contains('open')){panel.classList.remove('open');sync();}});
 sync();
})();