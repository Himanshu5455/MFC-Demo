// src/utils/utils.js

export const extractNameAndPhone = (input) => {
  if (!input) return { name: "", phone: "" };
  const phoneMatch = String(input).match(/(\+?\d[\d\s\-]{6,}\d)/);
  const phone = phoneMatch ? phoneMatch[1].replace(/\s|\-/g, "") : "";
  const namePart = String(input)
    .replace(phoneMatch ? phoneMatch[1] : "", "")
    .replace(/[,;\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { name: namePart, phone };
};

export const computeAge = (dobStr) => {
  if (!dobStr) return null;
  let d;
  if (typeof dobStr === "string" && dobStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [dd, mm, yyyy] = dobStr.split("/");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else {
    d = new Date(dobStr);
  }
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

export const categorizeReason = (text) => {
  const tags = [];
  const t = (text || "").toLowerCase();
  const map = [
    ["Infertility Evaluation or Multiple Losses", ["infertility", "multiple loss", "miscarriage"]],
    ["Future family planning", ["egg preservation", "genetic", "preconception"]],
    ["Need use of donor embrios / egg / sperm", ["donor", "embryo", "sperm", "egg donor"]],
    ["Preservation for medical need", ["medical preservation"]],
    ["IVF", ["ivf"]],
    ["Transfer care from another clinic / Second opinion", ["transfer care", "second opinion"]],
    ["Returning patient", ["returning", "follow up"]],
    ["Cancer", ["cancer", "oncology"]],
    ["Immune Service", ["immune"]],
    ["General Surgery", ["surgery"]],
    ["Ginecology", ["ginec", "gyne", "gynecology"]],
    ["Already Preagnant", ["pregnant", "pregnancy"]],
  ];
  map.forEach(([label, keys]) => {
    if (keys.some((k) => t.includes(k))) tags.push(label);
  });
  return Array.from(new Set(tags));
};