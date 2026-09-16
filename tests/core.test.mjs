import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Brain, Arena, rng} from '../dist/core.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../dist/data/flyvis.json',import.meta.url)));
test('public graph drives finite bounded activity and responds to sensory input',()=>{
 const b=new Brain(data); b.calibrate();
 const a=b.decide(.7); b.reset(); const c=b.decide(-.7);
 assert.ok(a>.1 && c<-.1, `${a}, ${c}`);
 assert.ok([...b.state].every(Number.isFinite));
 assert.equal(b.n,65); assert.equal(b.edges.length,605);
});
test('shuffled control preserves weights and number of connections',()=>{
 const a=new Brain(data), b=new Brain(data,true);
 assert.deepEqual(a.edges.map(e=>e.w),b.edges.map(e=>e.w));
 assert.ok(a.edges.some((e,i)=>e.to!==b.edges[i].to));
});
test('cutting both sensory channels removes directional output',()=>{
 const b=new Brain(data);b.calibrate();b.reset();
 for(let i=0;i<50;i++)assert.equal(b.decide(0),0);
});
test('seeded games repeat and all paddles remain in arena',()=>{
 const a=new Arena(42),b=new Arena(42);
 for(let i=0;i<3000;i++){a.step(1/120,Math.sin(i),1);b.step(1/120,Math.sin(i),1);}
 assert.equal(JSON.stringify(a),JSON.stringify(b)); assert.ok(a.paddle>=.09 && a.paddle<=.91);
 assert.ok(a.hits+a.misses>0);
});
test('calibrated controller beats matched seeded random policy in demo task',()=>{
 const brain=new Brain(data); brain.calibrate();
 let scores=[];
 for(const mode of ['brain','random']){const a=new Arena(71),r=rng(71);let action=0;
 for(let i=0;i<24000;i++){if(i%4===0) action=mode==='brain'?brain.decide((a.y-a.paddle)*2):r()*2-1;a.step(1/120,action,1);}
 scores.push(a.hits/(a.hits+a.misses));}
 console.log('hit rates',scores);assert.ok(scores[0]>scores[1]+.15);
});
