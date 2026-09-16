import {rng} from '../core.mjs';
export function parseGraph(buffer){const header=new Uint32Array(buffer,0,4);if(header[0]!==0x464c5931||header[3]!==1)throw new Error('Unsupported graph format');const n=header[1],m=header[2],offset=16+(n+1)*4;if(buffer.byteLength!==offset+m*6)throw new Error('Truncated connectome');return {n,m,ptr:new Uint32Array(buffer,16,n+1),targets:new Uint32Array(buffer,offset,m),weights:new Int16Array(buffer,offset+m*4,m)};}
// Port of Shiu et al. default point-neuron equations, in milliseconds/millivolts.
// v is displacement from -52 mV. Threshold is >7 mV; g is the decaying input.
// Same fixed grid as Brian2 default clock (0.1 ms), exact linear subthreshold update.
// Sparse mode only drops tails smaller than 1e-9 mV; dense mode is the reference.
export class SpikingBrain{
 constructor(graph,sugar,motor,seed=42,{dense=false}={}){Object.assign(this,graph);this.sugar=sugar;this.motor=motor;this.seed=seed;this.dense=dense;this.silenceMotor=false;this.reset();}
 reset(){this.v=new Float64Array(this.n);this.g=new Float64Array(this.n);this.refractory=new Uint32Array(this.n);this.counts=new Uint32Array(this.n);this.present=new Uint8Array(this.n);this.active=new Uint32Array(this.n);this.activeCount=0;this.tick=0;this.totalSpikes=0;this.random=rng(this.seed);this.queue=Array.from({length:20},()=>[]);this.sensory=new Uint8Array(this.n);for(const i of this.sugar)this.sensory[i]=1;if(this.dense)for(let i=0;i<this.n;i++)this.wake(i);}
 wake(i){if(!this.present[i]){this.present[i]=1;this.active[this.activeCount++]=i;}}
 step(rate){const tick=this.tick,em=.9950124791926823,es=.9801986733067553,c=(em-es)/3;let j=0;
  while(j<this.activeCount){const i=this.active[j];if(i===this.motor&&this.silenceMotor){this.v[i]=0;this.g[i]=0;}else if(tick>=this.refractory[i]){const g=this.g[i];this.v[i]=this.v[i]*em+g*c;this.g[i]=g*es;if(this.v[i]>7){this.v[i]=0;this.g[i]=0;this.refractory[i]=tick+(this.sensory[i]?0:22);this.counts[i]++;this.totalSpikes++;this.queue[(tick+18)%20].push(i);}}
   if(!this.dense&&Math.abs(this.v[i])<1e-9&&Math.abs(this.g[i])<1e-9){this.v[i]=this.g[i]=0;this.present[i]=0;this.active[j]=this.active[--this.activeCount];}else j++;
  }
  const due=this.queue[tick%20];for(let k=0;k<due.length;k++){const i=due[k];if(i===this.motor&&this.silenceMotor)continue;for(let edge=this.ptr[i];edge<this.ptr[i+1];edge++){const to=this.targets[edge];if(to===this.motor&&this.silenceMotor)continue;const w=this.weights[edge];if(w){this.g[to]+=w*.275;this.wake(to);}}}due.length=0;
  const chance=Math.min(1,Math.max(0,rate)*.0001);for(const i of this.sugar)if(this.random()<chance){this.v[i]+=68.75;this.wake(i);}this.tick++;
 }
 run(ms,rate){const start=this.counts[this.motor],before=this.totalSpikes,steps=Math.round(ms*10);for(let i=0;i<steps;i++)this.step(rate);return {mn9Spikes:this.counts[this.motor]-start,spikes:this.totalSpikes-before,active:this.activeCount,simMs:steps/10};}
}
