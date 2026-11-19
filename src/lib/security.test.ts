import { describe, expect, test } from "bun:test";
import { buildRules, emailOk, LIMITS, nameOk, phoneOk, suspiciousReason } from "./security";

const pessoa = { name: "Maria Souza", email: "maria.souza@gmail.com", phone: "85988776655" };

describe("dados de pessoa de verdade passam", () => {
  test("cliente comum", () => {
    expect(suspiciousReason(pessoa, { fillMs: 45_000 })).toBeNull();
  });
  test("aba antiga sem tempo nem isca", () => {
    expect(suspiciousReason(pessoa, {})).toBeNull();
  });
  test("nomes com acento, apóstrofo e hífen", () => {
    for (const n of ["José D'Ávila", "Ana-Clara Pêssoa", "João", "Maria da Conceição"]) {
      expect(nameOk(n)).toBe(true);
    }
  });
  test("fixo e celular de vários DDDs", () => {
    for (const p of ["(11) 98765-4329", "21987651234", "8532451234", "(69) 99231-5566"]) {
      expect(phoneOk(p)).toBe(true);
    }
  });
  test("e-mails comuns", () => {
    for (const e of ["a@gmail.com", "x.y@hotmail.com.br", "loja@empresa.com.br"]) {
      expect(emailOk(e)).toBe(true);
    }
  });
});

describe("robô e dados falsos são barrados", () => {
  test("campo escondido preenchido", () => {
    expect(suspiciousReason(pessoa, { hp: "http://spam" })).toBe("robo");
  });
  test("checkout preenchido rápido demais", () => {
    expect(suspiciousReason(pessoa, { fillMs: 800 })).toBe("robo");
  });
  test("nomes impossíveis", () => {
    for (const n of ["Maria123", "aaaaaa bbbb", "www.site.com", "x@y", "12"]) {
      expect(nameOk(n)).toBe(false);
    }
  });
  test("celulares impossíveis", () => {
    for (const p of [
      "00999999999",
      "11999999999",
      "1187654321",
      "20987654321",
      "11912345678",
      "123",
    ]) {
      expect(phoneOk(p)).toBe(false);
    }
  });
  test("e-mails descartáveis", () => {
    for (const e of ["a@mailinator.com", "b@YOPMAIL.com", "c@teste.com", "semarroba", "a@b"]) {
      expect(emailOk(e)).toBe(false);
    }
  });
});

describe("regras de limite", () => {
  test("Pix: IP + CPF + celular + e-mail, cada um com as janelas", () => {
    const rules = buildRules("loja", "pix", { ip: "i", cpf: "c", phone: "p", email: "e" });
    expect(rules).toHaveLength(LIMITS.pix.ip.length + 3 * LIMITS.pix.pessoa.length);
    expect(rules[0]).toEqual({ b: "loja:pix:ip", k: "i", ...LIMITS.pix.ip[0] });
    expect(rules.some((r) => r.b === "loja:pix:cpf" && r.k === "c")).toBe(true);
  });
  test("sem IP conhecido só conta a pessoa", () => {
    const rules = buildRules("loja", "card", { ip: null, cpf: "c", phone: "p", email: "e" });
    expect(rules.every((r) => !r.b.endsWith(":ip"))).toBe(true);
  });
  test("comprovante: só por IP", () => {
    expect(buildRules("loja", "comprovante", { ip: "i" })).toHaveLength(1);
  });
  test("lojas no mesmo banco não somam tentativas", () => {
    const a = buildRules("banguela-shop", "pix", { ip: "i" });
    const b = buildRules("pede-ai", "pix", { ip: "i" });
    expect(a[0]!.b).not.toBe(b[0]!.b);
  });
});
