import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGrade4MathSystemInstruction,
  getTopicStarterPrompts,
  validateTutorRequest,
} from './mathTutorPrompt';

test('validateTutorRequest accepts valid Grade 4 math conversation and sanitizes history', () => {
  const res = validateTutorRequest({
    activeTopic: 'shapes',
    messages: [
      { role: 'assistant', text: 'Xin chào em!' },
      { role: 'user', text: '  Tính chu vi hình thoi cạnh 6 cm  ' },
    ],
  });

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.activeTopic, 'shapes');
    assert.equal(res.data.messages.length, 2);
    assert.equal(res.data.messages[1].text, 'Tính chu vi hình thoi cạnh 6 cm');
  }
});

test('validateTutorRequest rejects empty payloads and unknown trailing roles', () => {
  const emptyRes = validateTutorRequest({ messages: [] });
  assert.equal(emptyRes.ok, false);

  const blankRes = validateTutorRequest({
    messages: [{ role: 'user', text: '    ' }],
  });
  assert.equal(blankRes.ok, false);

  const assistantLast = validateTutorRequest({
    messages: [{ role: 'assistant', text: 'Hello' }],
  });
  assert.equal(assistantLast.ok, false);
});

test('buildGrade4MathSystemInstruction enforces Grade 4 Vietnam primary math rules', () => {
  const instruction = buildGrade4MathSystemInstruction('shapes');
  assert.ok(instruction.includes('song song với'));
  assert.ok(instruction.includes('vuông góc với'));
  assert.ok(instruction.includes('CHU VI'));
  assert.ok(instruction.includes('P = (a + b) × 2'));
  assert.ok(instruction.includes('P = a × 4'));
});

test('getTopicStarterPrompts returns 4 clean prompts per topic without forbidden symbols', () => {
  for (const topic of ['angles', 'perpendicular', 'parallel', 'shapes'] as const) {
    const prompts = getTopicStarterPrompts(topic);
    assert.equal(prompts.length, 4);
    for (const p of prompts) {
      assert.ok(p.length > 10);
      assert.ok(!p.includes('//'));
      assert.ok(!p.includes('⊥'));
      assert.ok(!p.toLowerCase().includes('diện tích'));
    }
  }
});
