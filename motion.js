import { h, qs, chips } from './dom.js';

export function motionSnapshot(table) {
  return { hand:table.handNumber, board:table.board.length, complete:table.handComplete,
    bets:table.players.map(p=>p.bet), committed:table.players.map(p=>p.committed),
    folded:table.players.map(p=>p.folded), history:table.history.length };
}
export function motionEvents(before, after) {
  const fresh = !before || before.hand !== after.hand;
  return { deal:fresh, revealFrom:fresh?0:before.board,
    board:after.board>(fresh?0:before.board),
    bets:fresh?[]:after.committed.flatMap((v,i)=>v>(before.committed[i]??0)?[i]:[]),
    collect:!fresh && after.board>before.board,
    payout:after.complete && (fresh || !before.complete) };
}

/** Visual effects only. No card choice, betting state or game RNG is changed. */
export class TableMotion {
  constructor(settings) { this.settings=settings; this.last=null; this.running=new Set(); }
  stop() {
    for(const a of this.running)a.cancel();
    this.running.clear();
    qs('#table-effects')?.replaceChildren();
  }
  animate(node,frames,options,onDone) {
    if(!node?.animate)return;
    const a=node.animate(frames,{duration:500,easing:'cubic-bezier(.2,.7,.2,1)',...options});
    this.running.add(a);
    a.finished.then(()=>{this.running.delete(a);onDone?.();}).catch(()=>{this.running.delete(a);onDone?.();});
  }
  travel(from,to,amount,delay=0) {
    const layer=qs('#table-effects');
    if(!layer)return;
    const chip=h('div',{class:'flying-chips','aria-hidden':'true'},h('i',{class:'disc'}),h('i',{class:'disc'}),h('i',{class:'disc'}),h('span',{text:chips(amount)}));
    layer.append(chip);
    this.animate(chip,[
      {left:from.x+'%',top:from.y+'%',transform:'translate(-50%,-50%) scale(.85)',opacity:0},
      {offset:.15,opacity:1},
      {left:to.x+'%',top:to.y+'%',transform:'translate(-50%,-50%) scale(1)',opacity:1},
    ],{duration:620,delay,fill:'both'},()=>chip.remove());
  }
  update(table) {
    const next=motionSnapshot(table), before=this.last, events=motionEvents(before,next);
    this.last=next;
    if(!this.settings().animations || matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) { this.stop(); return; }
    const seats=[...document.querySelectorAll('#seats .seat')];
    const position=i=>({x:parseFloat(seats[i]?.style.getPropertyValue('--x')||50),y:parseFloat(seats[i]?.style.getPropertyValue('--y')||50)});
    const centre={x:50,y:47};
    if(events.deal) {
      this.stop();
      const bounds=qs('.felt-wrap').getBoundingClientRect();
      seats.forEach((seat,i)=>seat.querySelectorAll('.pcard').forEach((card,j)=>{
        const rect=card.getBoundingClientRect();
        const dx=bounds.left+bounds.width*.5-rect.left-rect.width/2;
        const dy=bounds.top+bounds.height*.43-rect.top-rect.height/2;
        const end=getComputedStyle(card).transform;
        this.animate(card,[{transform:`translate(${dx}px,${dy}px) rotate(-18deg) scale(.65)`,opacity:0},{transform:end==='none'?'none':end,opacity:1}],
          {duration:460,delay:i*32+j*180,fill:'backwards'});
      }));
    }
    if(events.board) {
      [...document.querySelectorAll('#board .pcard')].slice(events.revealFrom).forEach((card,i)=>{
        this.animate(card,[{transform:'perspective(600px) rotateY(-90deg) translateY(-12px)',opacity:.1},{transform:'perspective(600px) rotateY(0deg) translateY(0)',opacity:1}],
          {duration:430,delay:i*125,fill:'backwards'});
      });
    }
    if(events.collect) {
      before.bets.forEach((amount,i)=>{
        const collected=amount+Math.max(0,next.committed[i]-before.committed[i]);
        if(collected>0)this.travel(position(i),centre,collected,i*25);
      });
    } else for(const i of events.bets) {
      const p=position(i);this.travel(p,{x:50+(p.x-50)*.65,y:47+(p.y-47)*.65},next.committed[i]-before.committed[i]);
    }
    if(events.payout) {
      for(const [i,win] of (table.results?.payouts??[]).entries()) {
        if(win.amount<=0)continue;
        this.travel(centre,position(win.seat),win.amount,(events.collect?750:220)+i*90);
        const plate=seats[win.seat]?.querySelector('.plate');
        this.animate(plate,[{boxShadow:'0 0 0 0 #dfc58f00'},{offset:.45,boxShadow:'0 0 30px 5px #dfc58f88'},{boxShadow:'0 0 16px 0 #dfc58f33'}],{duration:1100});
      }
    }
  }
}
