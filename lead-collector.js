(function (window) {
  var LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR1y1_YI40s2w0cqBGKSiCEtaE3BtF9Afr8eKrHc_RUYKkzbNRk-LBypotE-x2laJw/exec';

  function toSafeText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  function readLeadData() {
    if (typeof window.getLeadData === 'function') {
      var leadData = window.getLeadData() || {};
      return {
        nome: toSafeText(leadData.NOME),
        email: toSafeText(leadData.EMAIL),
        telefone: toSafeText(leadData.TELEFONE)
      };
    }

    var nameInput = document.getElementById('popup-name');
    var emailInput = document.getElementById('popup-email');
    var phoneInput = document.getElementById('popup-phone');

    return {
      nome: toSafeText(nameInput && nameInput.value),
      email: toSafeText(emailInput && emailInput.value),
      telefone: toSafeText(phoneInput && phoneInput.value)
    };
  }

  function readLeadOrigin() {
    if (typeof window.getLeadOrigin === 'function') {
      return toSafeText(window.getLeadOrigin()) || 'CTA';
    }

    var originInput = document.getElementById('popup-lead-origin');
    return toSafeText(originInput && originInput.value) || 'CTA';
  }

  function resolveOffer(decision, payload) {
    if (payload && payload.oferta) {
      return toSafeText(payload.oferta);
    }

    return decision === 'Recusa' ? 'recusado' : '12_horas_gratis';
  }

  function buildLeadPayload(decision, payload) {
    var input = payload || {};
    var data = readLeadData();

    return {
      nome: toSafeText(input.nome || data.nome),
      telefone: toSafeText(input.telefone || data.telefone),
      email: toSafeText(input.email || data.email),
      origem: toSafeText(input.origem || readLeadOrigin()),
      oferta: resolveOffer(decision, input),
      url: toSafeText(input.url || window.location.href),
      pagamento: 'Não pago'
    };
  }

  async function sendLeadToSheets(payload) {
    var body = JSON.stringify(payload);

    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: body
    });

    return payload;
  }

  window.buildLeadPayload = buildLeadPayload;
  window.sendLeadToSheets = sendLeadToSheets;
  window.captureLeadData = async function (decision, payload) {
    var leadPayload = buildLeadPayload(decision, payload);
    return sendLeadToSheets(leadPayload);
  };
})(window);
