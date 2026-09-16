import {rng,clamp} from '../core.mjs';
export class FlyWorld{
 constructor(seed=42){this.random=rng(seed);this.reset();}
 reset(){this.time=0;this.contact=null;this.x=-1.15;this.z=.25;this.heading=0;this.speed=0;this.foods=[{id:1,x:.25,z:.1,amount:1}];this.nextId=2;this.path=[];this.fed=0;this.proboscis=0;this.stimulus=0;this.signal=0;this.blind=false;this.silenced=false;this.pulseUntil=0;this.paused=false;this.totalDistance=0;this.foodReached=false;}
 addFood(x,z){if(this.foods.length>=6)this.foods.shift();this.foods.push({id:this.nextId++,x:clamp(x,-2.3,2.3),z:clamp(z,-1.55,1.55),amount:1});}
 pulse(){this.pulseUntil=this.time+2;}
 sense(){const f=this.foods.find(f=>f.amount>0&&Math.hypot(this.x-f.x,this.z-f.z)<.27);this.contact=f||null;this.stimulus=this.blind?0:this.time<this.pulseUntil?150:f?100:0;return this.stimulus;}
 step(dt,motorHz){this.time+=dt;this.signal=motorHz;this.proboscis+=(clamp(motorHz/70,0,1)-this.proboscis)*Math.min(1,dt*9);const nearest=this.foods.filter(f=>f.amount>0).sort((a,b)=>Math.hypot(a.x-this.x,a.z-this.z)-Math.hypot(b.x-this.x,b.z-this.z))[0];
  // Explicitly engineered approach/locomotion; only feeding is connected to MN9.
  let target=nearest?Math.atan2(nearest.z-this.z,nearest.x-this.x):this.heading+Math.sin(this.time*.7)*.4;
  if(Math.abs(this.x)>2.4||Math.abs(this.z)>1.65)target=Math.atan2(-this.z,-this.x);
  const delta=Math.atan2(Math.sin(target-this.heading),Math.cos(target-this.heading));this.heading+=clamp(delta,-dt*1.8,dt*1.8);const feeding=this.contact&&motorHz>10;const desired=feeding?.008:.22;this.speed+=(desired-this.speed)*Math.min(1,dt*5);const distance=this.speed*dt;this.x=clamp(this.x+Math.cos(this.heading)*distance,-2.55,2.55);this.z=clamp(this.z+Math.sin(this.heading)*distance,-1.8,1.8);this.totalDistance+=distance;
  if(feeding){const consumed=Math.min(this.contact.amount,dt*.09*this.proboscis);this.contact.amount-=consumed;this.fed+=consumed;this.foodReached=true;}
  if(Math.floor(this.time*5)!==Math.floor((this.time-dt)*5)){this.path.push([this.x,this.z]);if(this.path.length>800)this.path.shift();}
 }
 snapshot(){return {time:this.time,x:this.x,z:this.z,heading:this.heading,speed:this.speed,foods:this.foods.map(f=>({...f})),fed:this.fed,proboscis:this.proboscis,stimulus:this.stimulus,signal:this.signal,distance:this.totalDistance,contact:!!this.contact,blind:this.blind,silenced:this.silenced,pulse:this.time<this.pulseUntil};}
}