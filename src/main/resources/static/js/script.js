const SERVER_URL = 'http://localhost:8080/api/v1';

// --- Små hjælpefunktioner til UI ---

function fill(selector, text) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = text;
  el.focus();
}

function setVal(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.value = value;
}

// --- Form-handlers ---

async function detectLang(e){
  e.preventDefault();
  const text = document.getElementById('lang-text').value.trim();
  const spinner = document.getElementById('spinner-lang');
  const out = document.getElementById('result-lang');
  out.style.color = '';
  out.innerText = '';

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/lang?text=${encodeURIComponent(text)}`;
    const res = await fetch(url).then(handleHttpErrors);
    out.innerText = res.answer; // ISO-kode (fx 'es')
  } catch (err){
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function translateText(e){
  e.preventDefault();
  const text = document.getElementById('tr-text').value.trim();
  const to   = document.getElementById('tr-to').value.trim(); // fx 'da' | 'en'
  const spinner = document.getElementById('spinner-tr');
  const out = document.getElementById('result-tr');
  out.style.color = '';
  out.innerText = '';

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/translate?text=${encodeURIComponent(text)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url).then(handleHttpErrors);
    out.innerText = res.answer; // oversættelsen
  } catch (err){
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function detectSentiment(e){
  e.preventDefault();
  const text = document.getElementById('sent-text').value.trim();
  const spinner = document.getElementById('spinner-sent');
  const out = document.getElementById('result-sent');
  out.style.color = '';
  out.innerText = '';

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/sentiment?text=${encodeURIComponent(text)}`;
    const res = await fetch(url).then(handleHttpErrors);
    out.innerText = res.answer; // 'positive' | 'neutral' | 'negative'
  } catch (err){
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function analyzeAll(e){
  e.preventDefault();
  const text = document.getElementById('az-text').value.trim();
  const to   = document.getElementById('az-to').value.trim();
  const spinner = document.getElementById('spinner-az');
  const out = document.getElementById('result-az');
  out.style.color = '';
  out.innerText = '';

  // Mangler input? → vis fejl og lav ikke request
  if (!text || !to) {
    out.style.color = 'red';
    out.innerText = 'Request failed';
    return;
  }

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/analyze?text=${encodeURIComponent(text)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url).then(handleHttpErrors);
    // Svarer i tre linjer: lang:<code>\nsentiment:<word>\ntranslation:<text>
    out.innerText = res.answer;
  } catch (err){
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

// --- HTTP helper ---

async function handleHttpErrors(res){
  if(!res.ok){
    const err = await res.json().catch(()=>({message:'Unknown error'}));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

// --- Event listeners til forms ---

document.getElementById('form-lang').addEventListener('submit', detectLang);
document.getElementById('form-translate').addEventListener('submit', translateText);
document.getElementById('form-sentiment').addEventListener('submit', detectSentiment);
document.getElementById('form-analyze').addEventListener('submit', analyzeAll);

// --- Event listeners til chips (data-attributes) ---

// Chips der udfylder tekstfelt (og evt. et ekstra felt)
document.querySelectorAll('.chip[data-fill-target]').forEach(chip => {
  chip.addEventListener('click', () => {
    const fillTarget = chip.dataset.fillTarget;
    const fillText   = chip.dataset.fillText || '';

    if (fillTarget) {
      fill(fillTarget, fillText);
    }

    const setTarget = chip.dataset.setvalTarget;
    const setValue  = chip.dataset.setvalValue;

    if (setTarget !== undefined && setValue !== undefined) {
      setVal(setTarget, setValue);
    }
  });
});
