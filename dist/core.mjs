export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function rng(seed=1){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// Population-level reduction of flyvis. Offset counts are summed; geometry is not retained.
// Two independent copies receive an engineered up/down error encoding.
export class Brain{
 constructor(data,shuffled=false){
  this.n=data.nodes.length;this.names=data.nodes.map(x=>x.name);const r=rng(91);
  this.edges=data.edges.map(e=>({from:this.names.indexOf(e.src),to:this.names.indexOf(e.tar),w:e.alpha*e.offsets.reduce((s,x)=>s+x[1],0)}));
  if(shuffled){const dest=this.edges.map(e=>e.to);for(let i=dest.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[dest[i],dest[j]]=[dest[j],dest[i]];}this.edges.forEach((e,i)=>e.to=dest[i]);}
  this.norm=new Float64Array(this.n);for(const e of this.edges)this.norm[e.to]+=Math.abs(e.w);
  this.state=new Float64Array(this.n*2);this.weights=new Float64Array(this.n);this.reset();
 }
 reset(){this.state.fill(0);}
 advance(error){const next=new Float64Array(this.n*2);
  for(let c=0;c<2;c++){const offset=c*this.n;
   for(const e of this.edges)next[offset+e.to]+=.85*e.w/(this.norm[e.to]||1)*this.state[offset+e.from];
   for(let i=0;i<this.n;i++){const input=i<8?(.35+(c===0?error:-error)*.8):0;next[offset+i]=this.state[offset+i]*.45+.55*Math.tanh(next[offset+i]+input);}
  }this.state=next;
 }
 features(){const f=new Float64Array(this.n);for(let i=8;i<this.n;i++)f[i]=this.state[i]-this.state[this.n+i];return f;}
 calibrate(){const r=rng(123);for(let k=0;k<2200;k++){const e=r()*2-1;this.reset();for(let j=0;j<10;j++)this.advance(e);const f=this.features();let y=0,n=.01;for(let i=8;i<this.n;i++){y+=this.weights[i]*f[i];n+=f[i]*f[i];}const residual=clamp(e*3,-1,1)-y;for(let i=8;i<this.n;i++)this.weights[i]+=.16*residual*f[i]/n;}this.reset();}
 decide(error){for(let j=0;j<3;j++)this.advance(clamp(error,-1,1));const f=this.features();return clamp(f.reduce((s,v,i)=>s+v*this.weights[i],0),-1,1);}
}
export class Arena{
 constructor(seed=42){this.seed=seed;this.random=rng(seed);this.paddle=.5;this.other=.5;this.hits=0;this.misses=0;this.rally=0;this.best=0;this.elapsed=0;this.event='';this.trail=[];this.serve();}
 serve(){this.x=.52;this.y=.2+this.random()*.6;this.vx=-.40;this.vy=(this.random()-.5)*.6;this.trail=[];}
 step(dt,action,difficulty=1){this.elapsed+=dt;this.event='';this.paddle=clamp(this.paddle+clamp(action,-1,1)*.67*dt,.09,.91);this.other+=clamp(this.y-this.other,-dt*.8,dt*.8);this.other=clamp(this.other,.09,.91);
  this.x+=this.vx*dt*difficulty;this.y+=this.vy*dt*difficulty;
  if(this.y<.018){this.y=.036-this.y;this.vy=Math.abs(this.vy);}if(this.y>.982){this.y=1.964-this.y;this.vy=-Math.abs(this.vy);}
  if(this.vx<0&&this.x<.055){if(Math.abs(this.y-this.paddle)<.108){this.x=.055;this.vx=Math.min(.65,Math.abs(this.vx)*1.025);this.vy+=(this.y-this.paddle)*1.9;this.vy=clamp(this.vy,-.65,.65);this.hits++;this.rally++;this.best=Math.max(this.best,this.rally);this.event='hit';}else{this.misses++;this.rally=0;this.event='miss';this.serve();}}
  if(this.vx>0&&this.x>.945){this.x=.945;this.vx=-Math.abs(this.vx);this.vy+=(this.random()-.5)*.24;this.vy=clamp(this.vy,-.65,.65);}
 }
}
