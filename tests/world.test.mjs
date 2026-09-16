import test from 'node:test';
import assert from 'node:assert/strict';
import {FlyWorld} from '../dist/brain/world.mjs';
test('food contact supplies sugar input but cannot bypass neural motor output',()=>{
 const w=new FlyWorld();w.foods=[{id:1,x:w.x,z:w.z,amount:1}];
 assert.equal(w.sense(),100);w.step(.02,0);assert.equal(w.fed,0);assert.equal(w.proboscis,0);
 w.sense();w.step(.02,80);assert.ok(w.fed>0);assert.ok(w.proboscis>0);
});
test('remote sugar stimulation extends mouth without creating food',()=>{
 const w=new FlyWorld();w.foods=[];w.pulse();assert.equal(w.sense(),150);w.step(.02,80);
 assert.ok(w.proboscis>0);assert.equal(w.fed,0);w.blind=true;assert.equal(w.sense(),0);
});
test('sensory pulse expires in model time',()=>{const w=new FlyWorld();w.foods=[];w.pulse();w.time=2.01;assert.equal(w.sense(),0);});
test('reset immediately clears previous contact and feeding state',()=>{const w=new FlyWorld();w.foods=[{id:2,x:w.x,z:w.z,amount:1}];w.sense();w.step(.02,80);w.reset();assert.equal(w.snapshot().contact,false);assert.equal(w.fed,0);assert.equal(w.time,0);assert.equal(w.proboscis,0);});
