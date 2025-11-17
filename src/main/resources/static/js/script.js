const SERVER_URL = 'http://localhost:8080/api/v1';

async function insertLanguageSelector() {
  try {
    const response = await fetch('languages.html');
    if (!response.ok) {
      console.error('Kunne ikke hente languages.html', response.status);
      return;
    }

    const text = await response.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const template = tempDiv.querySelector('#language-selector-template');
    if (!template) {
      console.error('language-selector-template ikke fundet i languages.html');
      return;
    }

    const languageSelectorContainers = document.querySelectorAll('.language-selector-container');

    languageSelectorContainers.forEach(container => {
      const clonedSelector = template.content.cloneNode(true);
      const select = clonedSelector.querySelector('.language-selector');

      // Find den form containeren ligger i og giv select et id
      const form = container.closest('form');
      if (form && form.id === 'form-translate') {
        select.id = 'tr-to';
      } else if (form && form.id === 'form-analyze') {
        select.id = 'az-to';
      }

      container.appendChild(clonedSelector);
    });

  } catch (e) {
    console.error('Fejl ved hentning af languages.html', e);
  }
}

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

async function detectLang(e) {
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
    out.innerText = res.answer;
  } catch (err) {
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function translateText(e) {
  e.preventDefault();
  const text = document.getElementById('tr-text').value.trim();
  const toEl = document.getElementById('tr-to');
  const spinner = document.getElementById('spinner-tr');
  const out = document.getElementById('result-tr');
  out.style.color = '';
  out.innerText = '';

  const to = toEl ? toEl.value.trim() : '';

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/translate?text=${encodeURIComponent(text)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url).then(handleHttpErrors);
    out.innerText = res.answer;
  } catch (err) {
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function detectSentiment(e) {
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
    out.innerText = res.answer;
  } catch (err) {
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function analyzeAll(e) {
  e.preventDefault();
  const text = document.getElementById('az-text').value.trim();
  const toEl = document.getElementById('az-to');
  const spinner = document.getElementById('spinner-az');
  const out = document.getElementById('result-az');
  out.style.color = '';
  out.innerText = '';

  const to = toEl ? toEl.value.trim() : '';

  if (!text || !to) {
    out.style.color = 'red';
    out.innerText = 'Request failed';
    return;
  }

  try {
    spinner.style.display = 'block';
    const url = `${SERVER_URL}/nlp/analyze?text=${encodeURIComponent(text)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url).then(handleHttpErrors);
    out.innerText = res.answer;
  } catch (err) {
    out.style.color = 'red';
    out.innerText = err.message;
  } finally {
    spinner.style.display = 'none';
  }
}

async function handleHttpErrors(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

// Formular events
document.getElementById('form-lang').addEventListener('submit', detectLang);
document.getElementById('form-translate').addEventListener('submit', translateText);
document.getElementById('form-sentiment').addEventListener('submit', detectSentiment);
document.getElementById('form-analyze').addEventListener('submit', analyzeAll);

// Chips
document.querySelectorAll('.chip[data-fill-target]').forEach(chip => {
  chip.addEventListener('click', () => {
    const fillTarget = chip.dataset.fillTarget;
    const fillText = chip.dataset.fillText || '';

    if (fillTarget) {
      fill(fillTarget, fillText);
    }

    const setTarget = chip.dataset.setvalTarget;
    const setValue = chip.dataset.setvalValue;

    if (setTarget !== undefined && setValue !== undefined) {
      setVal(setTarget, setValue);
    }
  });
});

// Hent og indsæt sprog-komponenten
insertLanguageSelector();
