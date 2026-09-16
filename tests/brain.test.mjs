import test from 'node:test';
import assert from 'node:assert/strict';
import {SpikingBrain} from '../dist/brain/model.mjs';
const graph=(weight=200)=>({n:3,ptr:new Uint32Array([0,1,2,2]),targets:new Uint32Array([1,2]),weights:new Int16Array([weight,weight])});
test('no spontaneous spikes without input',()=>{const b=new SpikingBrain(graph(),[0],2,7);b.run(100,0);assert.equal(b.totalSpikes,0);});
test('excitatory input travels through delayed connections, inhibitory input does not',()=>{
 const a=new SpikingBrain(graph(200),[0],2,7),b=new SpikingBrain(graph(-200),[0],2,7);
 a.run(100,100);b.run(100,100);assert.ok(a.counts[2]>0);assert.equal(b.counts[2],0);
});
test('zero input and motor silencing prevent feeding spikes',()=>{
 const a=new SpikingBrain(graph(),[0],2,7);a.silenceMotor=true;a.run(100,150);assert.ok(a.counts[0]>0);assert.equal(a.counts[2],0);
});
test('seeded input is reproducible',()=>{const a=new SpikingBrain(graph(),[0],2,42),b=new SpikingBrain(graph(),[0],2,42);a.run(200,100);b.run(200,100);assert.deepEqual(a.counts,b.counts);assert.deepEqual(a.v,b.v);});
test('delay prevents instantaneous downstream activation',()=>{const b=new SpikingBrain(graph(),[0],2,42);b.run(1,10000);assert.ok(b.counts[0]>0);assert.equal(b.counts[1],0);});
test('sparse active integration agrees with dense reference',()=>{
 const a=new SpikingBrain(graph(),[0],2,19),b=new SpikingBrain(graph(),[0],2,19,{dense:true});a.run(400,80);b.run(400,80);assert.deepEqual(a.counts,b.counts);for(let i=0;i<3;i++)assert.ok(Math.abs(a.v[i]-b.v[i])<1e-5);
});
test('non-sensory neurons cannot spike during their refractory interval',()=>{
 const b=new SpikingBrain(graph(),[0],2,42);b.v[1]=8;b.wake(1);b.step(0);assert.equal(b.counts[1],1);
 b.v[1]=8;b.wake(1);for(let i=0;i<21;i++)b.step(0);assert.equal(b.counts[1],1);
 b.step(0);assert.equal(b.counts[1],2);
});
