// In-page navigation keeps the URL used to open this document unchanged.
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||!link.hash)return;
  const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if(!target)return;
  event.preventDefault();
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  if(event.detail===0){if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}
});
// One document retains the scroll scene while its resume is read in a dialog.
const isResume=document.body.classList.contains('resume-page');
if(isResume){
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-brand-target]');
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(parent!==window){
      event.preventDefault();
      parent.postMessage({type:'jay-resume-navigate',target:link.dataset.brandTarget},location.origin);
    }
  });
}else{
  const dialog=document.createElement('dialog');
  dialog.className='resume-modal';dialog.setAttribute('aria-label','최효재 Resume');
  dialog.innerHTML='<div class="resume-modal-bar"><span>Resume</span><button type="button" aria-label="이력서 닫기">닫기 ×</button></div><iframe title="최효재 이력서" loading="lazy"></iframe>';
  document.body.append(dialog);
  const frame=dialog.querySelector('iframe'),closeButton=dialog.querySelector('button');
  let opener=null;
  function close(restoreFocus=true){
    dialog.close();document.body.classList.remove('reading-resume');
    if(restoreFocus)opener?.focus({preventScroll:true});
    else{const main=document.querySelector('main');main.tabIndex=-1;main.focus({preventScroll:true});}
  }
  closeButton.addEventListener('click',()=>close());
  dialog.addEventListener('cancel',()=>{document.body.classList.remove('reading-resume');});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="resume.html"]');
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();opener=link;
    if(!frame.hasAttribute('src'))frame.src='resume.html?overlay=1';
    dialog.showModal();document.body.classList.add('reading-resume');closeButton.focus();
  });
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='jay-resume-navigate')return;
    const target=event.data.target;
    if(!['top','yigo','project-overview'].includes(target))return;
    close(false);window.dispatchEvent(new CustomEvent('resume-navigate',{detail:target}));
  });
}
