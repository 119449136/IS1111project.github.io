import { h, clear, cardRow } from './dom.js';
import { icon } from './icons.js';
import { POSITIONS, preflopQuestion, oddsQuestion, LESSONS, targetedLessons, savedSpots,
  recordAttempt, trainingSummary, RANGE_SCENARIOS, RANGE_HERO, RANGE_STREETS,
  rangeDistribution, distributionScore, sampleRangeHand } from '../training.js';

const button = (text, onClick, primary = false) => h('button', { class: `btn ${primary ? 'primary' : 'ghost'}`, text, onClick });
const para = text => h('p', { text });

export function trainingProgress(profile) {
  const summary = trainingSummary(profile);
  const panel = h('div', { class: 'card-panel training' }, h('h2', { text: 'Training progress' }));
  if (!summary.some(s=>s.count)) panel.append(para('Complete a drill in Practice to start tracking your skills.'));
  else for (const row of summary.filter(s=>s.count)) panel.append(h('div', {class:'skill-meter'},
    h('div',{},h('span',{text:({preflop:'Pre-flop',ranges:'Range Detective',theory:'Theory',odds:'Pot odds',review:'Hand review'})[row.mode]}),h('b',{text:`${row.score}%`})),
    h('progress',{max:100,value:row.score,'aria-label':row.mode+' average score'}),
    h('small',{text:`${row.count} answers · average score`})));
  panel.append(h('p', { class: 'sub', text: 'Practice scores measure agreement with the exercise. They do not predict winnings. Saved on this device; most recent 500 answers.' }));
  return panel;
}

export function trainingHub(app) {
  const host = h('div', { class: 'training' });
  const state = { position: 'Mixed' };
  const persist = (mode, q, score, started) => {
    recordAttempt(app.profile, mode, q, score, (Date.now()-started)/1000);
    app.persist();
  };
  function home() {
    clear(host);
    host.append(h('div',{class:'training-intro'},h('div',{class:'eyebrow',text:'A FEW MINUTES. A SHARPER GAME.'}),h('h2', { text: 'Build the instinct.' }), para('Choose a skill. Find your rhythm.'),
      h('span',{class:'training-count',text:'05 TRAINING MODES'})),
      h('div', { class: 'training-menu' },
        menu('Pre-flop flash trainer', '10 opening decisions. See how the same cards play from each seat.', ()=>quiz('preflop')),
        menu('Range Detective', 'Allocate probabilities, then update them across four streets.', rangePicker),
        menu('Theory practice', 'Learn one concept and apply it immediately.', ()=>quiz('theory')),
        menu('Pot-odds sprint', '10 river prices. Work out the break-even equity.', ()=>quiz('odds')),
        menu('Review my decisions', 'Retry saved spots, with theory selected from your recurring leaks.', reviewPicker)),
      trainingProgress(app.profile),
      h('details', { class: 'card-panel' }, h('summary', { text: 'My mental checklist' }),
        h('ol', {}, ['Position and players left to act.', 'What range fits the action and observed behaviour?', 'What worse hands call, or better hands fold?', 'What is the price, stack depth and plan for the next street?', 'Choose deliberately. Review the decision separately from the result.'].map(t=>h('li',{text:t})))));
  }
  function menu(title, detail, action) {
    const type = ({'Pre-flop flash trainer':'cards','Range Detective':'practice','Theory practice':'theory','Pot-odds sprint':'odds','Review my decisions':'history'})[title]??'practice';
    return h('button', { class: 'training-tile', onClick: action, data:{kind:type} },
      h('img',{class:'training-photo',src:type==='history'?'assets/poker-room.webp':'assets/poker-study.webp',alt:'',loading:'lazy'}),
      h('div',{class:'tile-icon'},icon(type)),
      h('div',{class:'tile-copy'},h('strong',{text:title}), h('span',{text:detail})),
      h('div',{class:'tile-action'},h('span',{text:'Start practice'}),icon('arrow')));
  }
  function reviewPicker() {
    clear(host);
    const spots = savedSpots(app.profile);
    host.append(button('← Training',home), h('h2',{text:'Review my decisions'}),
      para(spots.length ? `${spots.length} saved decisions are ready. Your answer is compared with the coach’s teaching baseline.` : 'Older hands did not save the decision context. Play a new hand with this version to unlock retries; targeted theory is ready now.'),
      para('Retries show only the board and information available when you acted. Post-flop estimates are discussion prompts, not solver answers.'));
    if(spots.length) host.append(button('Retry saved decisions',()=>quiz('review',spots),true));
    host.append(button('Practise my recurring leaks',()=>quiz('theory',targetedLessons(app.profile)),true));
  }
  function quiz(mode, supplied) {
    let index=0, scores=[], started, q, answered=false;
    const queue = supplied ?? (mode === 'theory' ? [...LESSONS].sort(()=>Math.random()-0.5) : null);
    const limit = Math.min(10,queue?.length ?? 10);
    function draw() {
      clear(host); answered=false;
      q = queue ? queue[index] : mode === 'preflop' ? preflopQuestion(state.position) : oddsQuestion();
      host.append(button('← Training',home), h('div',{class:'training-meta',text:`${index+1} / ${limit} · ${scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'% so far' : 'Take your time first'}`}));
      host.append(h('progress',{class:'session-progress',max:limit,value:index,'aria-label':'Session progress'}));
      if(mode === 'preflop' && index === 0 && !scores.length) {
        const select = h('select', { id:'drill-position', onChange:e=>{state.position=e.target.value;draw();} },
          ['Mixed',...POSITIONS].map(p=>h('option',{value:p,selected:p===state.position,text:p})));
        host.append(h('label',{for:'drill-position',text:'Practise position'}),select);
      }
      host.append(h('h2',{text:q.title}));
      if(q.lesson) host.append(h('div',{class:'training-lesson'},para(q.lesson)));
      if(q.setup) host.append(para(q.setup));
      if(q.cards?.length) host.append(cardRow(q.cards));
      if(q.board?.length) host.append(para('Board at the decision'),cardRow(q.board,{size:'mini'}));
      host.append(h('h3',{text:q.prompt}));
      const feedback=h('div',{'aria-live':'polite',class:'training-feedback'});
      const actions=h('div',{class:'training-choices'});
      for(const choice of q.choices) actions.append(button(choice,()=>{
        if(answered)return; answered=true;
        for(const b of actions.children)b.disabled=true;
        const score=choice===q.answer ? 100 : 0; scores.push(score); persist(mode,q,score,started);
        feedback.dataset.result = score ? 'correct' : 'review';
        for(const b of actions.children) { if(b.textContent===q.answer)b.classList.add('answer-correct'); else if(b.textContent===choice)b.classList.add('answer-review'); }
        feedback.append(h('h3',{text:score ? 'Matches the baseline' : `Baseline answer: ${q.answer}`}),para(q.explanation));
        if(q.comparisons)feedback.append(para(q.comparisons));
        if(q.original)feedback.append(para(`Your original action: ${q.original}. This is a review exercise, not a new simulation of the hand.`));
        feedback.append(button(index+1===limit?'See session results':'Next decision',()=>{index++;index===limit?finish():draw();},true));
      }));
      host.append(actions,feedback); started=Date.now();
    }
    function finish() {
      clear(host);
      host.append(h('h2',{text:'Session complete'}),h('div',{class:'training-score',text:`${Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)}%`}),
        para(`${scores.filter(s=>s===100).length} of ${scores.length} answers matched the baseline.`),
        para('Aim for clear reasoning before speed. Try another position or revisit the concepts you missed.'),button('Back to training',home,true));
    }
    draw();
  }
  function rangePicker() {
    clear(host);host.append(button('← Training',home),h('h2',{text:'Range Detective'}),
      para('Choose an observed betting style. This exercise uses a deliberately limited starting range and authored action frequencies, not a solver or a prediction of a real person.'));
    for(const s of RANGE_SCENARIOS)host.append(menu(s.title,s.note,()=>rangeRound(s)));
  }
  function rangeRound(scenario) {
    let street=0, scores=[], previous=null;
    function draw() {
      clear(host); const step=RANGE_STREETS[street], groups=rangeDistribution(scenario,street);
      const started=Date.now();let answered=false;
      host.append(button('← Scenarios',rangePicker),h('div',{class:'training-meta',text:`${scenario.title} · ${step.name} · ${street+1}/4`}),
        h('progress',{class:'session-progress',max:4,value:street,'aria-label':'Streets completed'}),
        para(scenario.note),cardRow(RANGE_HERO),para(step.action));
      if(step.board.length)host.append(cardRow(step.board,{size:'mini'}));
      host.append(h('h3',{text:'Allocate 100% across the possible hands'}),para(street===0?'Start with combination counts, removing your cards. Each available combo starts equally likely within this teaching range.':'How does this action change the weights? Less likely does not mean impossible.'));
      const total=h('p',{'aria-live':'polite'}),feedback=h('div',{'aria-live':'polite',class:'training-feedback'});
      const inputs=groups.map((g,i)=>{
        const input=h('input',{type:'number',min:0,max:100,step:1,value:previous?.[i]??20,id:`range-weight-${i}`,inputmode:'numeric',onInput:update});
        host.append(h('div',{class:'training-weight'},h('label',{for:`range-weight-${i}`,text:g.label}),input,h('span',{text:'%'})));
        return input;
      });
      const submit=button('Check my range',()=>{
        if(answered)return;
        const values=inputs.map(i=>Number(i.value));
        const score=distributionScore(values,groups.map(g=>g.probability));
        if(score===null){total.textContent='Use numbers from 0 to 100 that total 100%.';return;}
        answered=true;submit.disabled=true;inputs.forEach(i=>i.disabled=true);scores.push(score);previous=values;
        persist('ranges',{id:`${scenario.id}-${street}`,topic:'ranges'},score,started);
        feedback.append(h('h3',{text:`${score}% agreement with the teaching model`}),para('Score = 100 minus the percentage points that need moving between groups. A single revealed hand does not determine the score.'));
        for(let i=0;i<groups.length;i++){
          const g=groups[i];feedback.append(h('div',{class:'training-comparison'},h('strong',{text:g.label}),h('span',{text:`You ${values[i]}% · Model ${(g.probability*100).toFixed(1)}%`}),
            h('div',{class:'training-bar'},h('div',{style:{width:`${g.probability*100}%`}})),
            h('small',{text:`${g.combos.length} available combos${street ? ` × ${(g.likelihood*100).toFixed(2)}% cumulative action likelihood` : ''}`})));
        }
        feedback.append(para('The model multiplies available combinations by the chance of this betting line, then normalises the weights. These likelihoods are assumptions for learning.'));
        if(street===3){
          feedback.append(para(`Round average: ${Math.round(scores.reduce((a,b)=>a+b,0)/4)}%. One possible hand sampled from the final model:`),cardRow(sampleRangeHand(groups)),
            para('An unlikely hand can still appear. A good range leaves room for it.'),button('Choose another scenario',rangePicker,true));
        }else feedback.append(button('Reveal next street',()=>{street++;draw();},true));
      },true);
      function update(){const sum=inputs.reduce((s,i)=>s+Number(i.value),0);total.textContent=`Total: ${sum}% · ${100-sum}% left to allocate`;}
      host.append(total,submit,feedback);update();
    }
    draw();
  }
  home();return host;
}
