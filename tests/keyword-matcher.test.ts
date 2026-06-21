/**
 * tests/keyword-matcher.test.ts
 *
 * Pure matcher tests (no API calls). Run with: npm test
 * Uses Node's built-in test runner via tsx.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { matchModules, looksClinical } from "../lib/claude/keyword-matcher";
import { getEligibleModulesForTier } from "../lib/claude/prompt-loader";

// All keyword modules are eligible under the paid tier.
const paid = getEligibleModulesForTier("paid").conditional;

function match(message: string): string[] {
  return matchModules(message, paid);
}

test('"as picas do bebé" loads M-VACINAÇÃO and M-PEDIATRIA', () => {
  const got = match("as picas do bebé");
  assert.ok(got.includes("M-VACINAÇÃO"), `esperava M-VACINAÇÃO, obtive ${got}`);
  assert.ok(got.includes("M-PEDIATRIA"), `esperava M-PEDIATRIA, obtive ${got}`);
});

test('"ando em baixo, sem vontade de nada" loads M-CLINICA', () => {
  const got = match("ando em baixo, sem vontade de nada");
  assert.ok(got.includes("M-CLINICA"), `esperava M-CLINICA, obtive ${got}`);
});

test('"o meu pai já não me conhece" loads M-CUIDADOR', () => {
  const got = match("o meu pai já não me conhece");
  assert.ok(got.includes("M-CUIDADOR"), `esperava M-CUIDADOR, obtive ${got}`);
});

test('"o meu tio está com tosse" does NOT load M-AÇORES', () => {
  const got = match("o meu tio está com tosse");
  assert.ok(!got.includes("M-AÇORES"), `não esperava M-AÇORES, obtive ${got}`);
});

test('"boa tarde" loads no keyword module and is not clinical', () => {
  const got = match("boa tarde");
  assert.deepEqual(got, []);
  assert.equal(looksClinical("boa tarde"), false);
});

// Word-boundary guard: "tio" must not match inside "António".
test('word boundary: "o António tem febre" does NOT load M-AÇORES', () => {
  const got = match("o António tem febre");
  assert.ok(!got.includes("M-AÇORES"), `não esperava M-AÇORES, obtive ${got}`);
});
