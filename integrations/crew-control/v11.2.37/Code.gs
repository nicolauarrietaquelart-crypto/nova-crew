const DESTINATION_FOLDER_ID = '1f0eCC7l0lrgoNsoULKYhMR6B023TJiYe';
const DATABASE_PROPERTY = 'PW_APP_DATABASE_ID';
const DATABASE_NAME = 'PENNY WISE - APP DATABASE';
const DATABASE_SCHEMA_VERSION = '11.2.33';
const DATABASE_SCHEMA_PROPERTY = 'PW_DB_SCHEMA_VERSION';

const SHEET_SERVICES = 'SERVICES';
const SHEET_SCENARIOS = 'SCENARIOS';
const SHEET_TEAMS = 'TEAMS';
const SHEET_WORKERS = 'WORKERS';
const SHEET_INCIDENTS = 'INCIDENTS';
const SHEET_AUDIT = 'AUDIT';
const SHEET_REQUIREMENTS = 'REQUIREMENTS';
const NO_TEAMS_REQUIREMENT_TEAM_ID = '__NO_TEAMS__';

const PENNY_LOGO_URL = 'https://servicios.penny-wise.es/proyectos/area-empleado/BCN/ver-logo-neg';

const SERVICE_HEADERS = [
  'CODE', 'SERVICE_NAME', 'SERVICE_DATE', 'VENUE', 'PDF_NAME',
  'WORK_ORDER_JSON', 'HIDDEN_WORK_TYPES_JSON',
  'CREATED_AT', 'UPDATED_AT',
  'CLOSED', 'CLOSED_AT', 'FINAL_PDF_ID', 'FINAL_PDF_URL'
];

const SCENARIO_HEADERS = [
  'CODE', 'SCENARIO_ID', 'NAME', 'SORT_ORDER'
];

const TEAM_HEADERS = [
  'CODE', 'TEAM_ID', 'SCENARIO_ID', 'NAME',
  'COLOR_NAME', 'COLOR_HEX', 'NO_VEST', 'SORT_ORDER'
];

const WORKER_HEADERS = [
  'CODE', 'WORKER_ID', 'SERVICE_DATE',
  'BLOCK_ID', 'BLOCK_LABEL', 'TRABAJO', 'IS_RESERVE',
  'PERSONAL', 'ESPECIALIDAD',
  'H_LLAM', 'INICIO', 'FIN',
  'PAUSA', 'N_DIETA', 'IS_COORDINATOR',
  'ACTUAL_INICIO', 'ACTUAL_FIN',
  'ACTUAL_PAUSA', 'ACTUAL_N_DIETA',
  'MOVIL',
  'SCENARIO_ID', 'TEAM_ID',
  'STATUS', 'ARRIVAL_AT', 'NOTES',
  'RATING_UNIFORMIDAD', 'RATING_ACTITUD', 'RATING_PUNTUALIDAD',
  'INCLUDED', 'PAGE', 'PDF_ROW', 'SORT_ORDER'
];

const INCIDENT_HEADERS = [
  'CODE', 'INCIDENT_ID', 'WORKER_ID', 'PERSONAL',
  'SERVICE_DATE', 'TRABAJO',
  'CREATED_AT', 'CATEGORY', 'SEVERITY',
  'OLD_CATEGORY', 'NEW_CATEGORY',
  'DESCRIPTION', 'ACTION_TAKEN', 'STATUS'
];

const AUDIT_HEADERS = [
  'CODE', 'EVENT_ID', 'CREATED_AT', 'ACTOR',
  'EVENT_TYPE', 'WORKER_ID', 'DETAILS'
];

const REQUIREMENT_HEADERS = [
  'CODE', 'SERVICE_DATE', 'TRABAJO',
  'TEAM_ID', 'REQUIRED_COUNT', 'UPDATED_AT'
];

const DEFAULT_SCENARIO = {
  id: 'S_MAIN',
  name: 'ESCENARIO PRINCIPAL'
};

const DEFAULT_CORE_TEAMS = [
  { key: 'CREW_HEAD', name: 'CREW HEAD', colorName: '', colorHex: '#BDBDBD', noVest: true },
  { key: 'FORKLIFTER', name: 'FORKLIFTER', colorName: '', colorHex: '#BDBDBD', noVest: true }
];

const DEFAULT_STAGE_TEAMS = [
  { key: 'GENERAL', name: 'GENERAL', colorName: 'NARANJA', colorHex: '#F58220', noVest: false },
  { key: 'LIGHTS', name: 'LUCES', colorName: 'VERDE', colorHex: '#43A047', noVest: false },
  { key: 'AUDIO', name: 'AUDIO', colorName: 'AMARILLO', colorHex: '#FDD835', noVest: false },
  { key: 'VIDEO', name: 'VIDEO', colorName: 'ROSA', colorHex: '#D81B60', noVest: false },
  { key: 'RESERVE', name: 'RESERVA', colorName: 'GRIS', colorHex: '#6B7280', noVest: false }
];

function doGet() {
  getOrCreateDatabase_();

  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Crew Control v11.2.37 | Gestor de servicios')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* =========================================================
   API PÚBLICA
   ========================================================= */

function generateNewService() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    const servicesSheet = db.getSheetByName(SHEET_SERVICES);

    const existing = new Set(
      getDataObjects_(servicesSheet).map(r => String(r.CODE || ''))
    );

    let code = '';
    for (let i = 0; i < 300; i++) {
      const candidate = String(Math.floor(100000 + Math.random() * 900000));
      if (!existing.has(candidate)) {
        code = candidate;
        break;
      }
    }

    if (!code) throw new Error('No se ha podido generar un código único.');

    const now = new Date();

    appendObjects_(servicesSheet, SERVICE_HEADERS, [{
      CODE: code,
      SERVICE_NAME: '',
      SERVICE_DATE: '',
      VENUE: '',
      PDF_NAME: '',
      CREATED_AT: now,
      UPDATED_AT: now,
      CLOSED: false,
      CLOSED_AT: '',
      FINAL_PDF_ID: '',
      FINAL_PDF_URL: ''
    }]);

    createDefaultScenario_(db, code);

    return loadService_(db, code);

  } finally {
    lock.releaseLock();
  }
}

function loadService(code) {
  code = normalizeCode_(code);
  return loadService_(getOrCreateDatabase_(), code);
}


/**
 * v11 Firebase bridge
 * Firestore is the operational source of truth in the browser.
 * This function mirrors one complete service snapshot back to the legacy
 * Google Sheets database only when a legacy operation (PDF/import/history)
 * needs it. It is intentionally NOT used for normal UI reads.
 */
function syncServiceSnapshotToSheets(service) {
  service = service || {};
  const code = normalizeCode_(service.code);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);

    const now = new Date();

    // SERVICE
    const servicesSheet = db.getSheetByName(SHEET_SERVICES);
    const serviceFound = findObjectRow_(servicesSheet, 'CODE', code);
    if (!serviceFound) throw new Error('No existe el servicio ' + code + '.');

    const serviceObj = serviceFound.object;
    serviceObj.SERVICE_NAME = String(service.serviceName || '');
    serviceObj.SERVICE_DATE = normalizeDate_(service.serviceDate);
    serviceObj.VENUE = String(service.venue || '');
    serviceObj.PDF_NAME = String(service.pdfName || '');
    serviceObj.WORK_ORDER_JSON = JSON.stringify(
      Array.isArray(service.workOrder) ? service.workOrder : []
    );
    serviceObj.HIDDEN_WORK_TYPES_JSON = JSON.stringify(
      Array.isArray(service.hiddenWorkTypes) ? service.hiddenWorkTypes : []
    );
    serviceObj.CLOSED = Boolean(service.closed);
    serviceObj.CLOSED_AT = service.closedAt ? new Date(service.closedAt) : '';
    serviceObj.FINAL_PDF_ID = String(service.finalPdfId || '');
    serviceObj.FINAL_PDF_URL = String(service.finalPdfUrl || '');
    serviceObj.UPDATED_AT = now;
    writeObjectRow_(servicesSheet, serviceFound.row, serviceObj);

    // SCENARIOS
    const scenarios = Array.isArray(service.scenarios) ? service.scenarios : [];
    const scenarioSheet = db.getSheetByName(SHEET_SCENARIOS);
    deleteRowsByField_(scenarioSheet, 'CODE', code);
    appendObjects_(scenarioSheet, SCENARIO_HEADERS, scenarios.map((s, i) => ({
      CODE: code,
      SCENARIO_ID: String(s.id || ''),
      NAME: String(s.name || ''),
      SORT_ORDER: Number(s.sortOrder || i + 1)
    })).filter(s => s.SCENARIO_ID && s.NAME));

    // TEAMS
    const teams = Array.isArray(service.teams) ? service.teams : [];
    const teamSheet = db.getSheetByName(SHEET_TEAMS);
    deleteRowsByField_(teamSheet, 'CODE', code);
    appendObjects_(teamSheet, TEAM_HEADERS, teams.map((t, i) => ({
      CODE: code,
      TEAM_ID: String(t.id || ''),
      SCENARIO_ID: String(t.scenarioId || ''),
      NAME: String(t.name || ''),
      COLOR_NAME: String(t.colorName || ''),
      COLOR_HEX: normalizeHex_(t.colorHex),
      NO_VEST: Boolean(t.noVest),
      SORT_ORDER: Number(t.sortOrder || i + 1)
    })).filter(t => t.TEAM_ID && t.NAME));

    // Keep previously soft-deleted workers that are no longer present in the
    // browser snapshot so a later PDF re-import does not resurrect them.
    const workerSheet = db.getSheetByName(SHEET_WORKERS);
    const existingExcluded = getDataObjects_(workerSheet)
      .filter(r =>
        String(r.CODE || '') === code &&
        !asBoolean_(r.INCLUDED, true)
      );

    deleteRowsByField_(workerSheet, 'CODE', code);

    const workers = Array.isArray(service.workers) ? service.workers : [];
    const incomingIds = new Set(workers.map(w => String(w.id || '')));

    const workerRows = workers.map((w, i) => ({
      CODE: code,
      WORKER_ID: String(w.id || ''),
      SERVICE_DATE: normalizeDate_(w.serviceDate),
      BLOCK_ID: String(w.blockId || ''),
      BLOCK_LABEL: String(w.blockLabel || ''),
      TRABAJO: normalizeBaseWorkType_(w.trabajo),
      IS_RESERVE: Boolean(w.isReserve),
      PERSONAL: String(w.personal || ''),
      ESPECIALIDAD: String(w.especialidad || ''),
      H_LLAM: normalizeTime_(w.hLlam),
      INICIO: normalizeTime_(w.inicio),
      FIN: normalizeTime_(w.fin),
      PAUSA: normalizePause_(w.pausa || '00:00'),
      N_DIETA: normalizeDietCount_(w.nDieta || 0),
      IS_COORDINATOR: Boolean(w.isCoordinator),
      ACTUAL_INICIO: normalizeTime_(w.actualStart),
      ACTUAL_FIN: normalizeTime_(w.actualEnd),
      ACTUAL_PAUSA: w.actualPause === null || w.actualPause === ''
        ? ''
        : normalizePause_(w.actualPause),
      ACTUAL_N_DIETA: w.actualDiet === null || w.actualDiet === ''
        ? ''
        : normalizeDietCount_(w.actualDiet),
      MOVIL: normalizeMobile_(w.movil),
      SCENARIO_ID: String(w.scenarioId || ''),
      TEAM_ID: String(w.teamId || ''),
      STATUS: normalizeStatus_(w.status),
      ARRIVAL_AT: normalizeTime_(w.arrivalAt),
      NOTES: String(w.notes || ''),
      RATING_UNIFORMIDAD: normalizeRating_(w.ratingUniformidad),
      RATING_ACTITUD: normalizeRating_(w.ratingActitud),
      RATING_PUNTUALIDAD: normalizeRating_(w.ratingPuntualidad),
      INCLUDED: w.included !== false,
      PAGE: Number(w.page || 0),
      PDF_ROW: Number(w.pdfRow || 0),
      SORT_ORDER: Number(w.sortOrder || i + 1)
    })).filter(w => w.WORKER_ID && w.PERSONAL);

    existingExcluded.forEach(r => {
      const id = String(r.WORKER_ID || '');
      if (id && !incomingIds.has(id)) workerRows.push(r);
    });

    appendObjects_(workerSheet, WORKER_HEADERS, workerRows);

    // INCIDENTS
    const incidentSheet = db.getSheetByName(SHEET_INCIDENTS);
    deleteRowsByField_(incidentSheet, 'CODE', code);
    const incidents = Array.isArray(service.incidents) ? service.incidents : [];
    appendObjects_(incidentSheet, INCIDENT_HEADERS, incidents.map(i => ({
      CODE: code,
      INCIDENT_ID: String(i.id || ''),
      WORKER_ID: String(i.workerId || ''),
      PERSONAL: String(i.personal || 'GENERAL'),
      SERVICE_DATE: normalizeDate_(i.serviceDate),
      TRABAJO: String(i.trabajo || 'GENERAL'),
      CREATED_AT: i.createdAt ? new Date(i.createdAt) : now,
      CATEGORY: normalizeIncidentCategory_(i.category),
      SEVERITY: normalizeIncidentSeverity_(i.severity),
      OLD_CATEGORY: String(i.oldCategory || ''),
      NEW_CATEGORY: String(i.newCategory || ''),
      DESCRIPTION: String(i.description || ''),
      ACTION_TAKEN: String(i.actionTaken || ''),
      STATUS: normalizeIncidentStatus_(i.status)
    })).filter(i => i.INCIDENT_ID && i.DESCRIPTION));

    // REQUIREMENTS
    const requirementSheet = db.getSheetByName(SHEET_REQUIREMENTS);
    deleteRowsByField_(requirementSheet, 'CODE', code);
    const requirements = Array.isArray(service.requirements) ? service.requirements : [];
    appendObjects_(requirementSheet, REQUIREMENT_HEADERS, requirements.map(r => ({
      CODE: code,
      SERVICE_DATE: normalizeDate_(r.serviceDate),
      TRABAJO: normalizeBaseWorkType_(r.trabajo),
      TEAM_ID: String(r.teamId || ''),
      REQUIRED_COUNT: Math.max(0, Math.floor(Number(r.requiredCount || 0))),
      UPDATED_AT: r.updatedAt ? new Date(r.updatedAt) : now
    })).filter(r => r.SERVICE_DATE && r.TRABAJO && r.TEAM_ID));

    return { ok: true };

  } finally {
    lock.releaseLock();
  }
}




function duplicateServiceSetup(sourceCode) {
  sourceCode = normalizeCode_(sourceCode);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, sourceCode);

    const sourceService = loadService_(db, sourceCode);
    const servicesSheet = db.getSheetByName(SHEET_SERVICES);

    const existing = new Set(
      getDataObjects_(servicesSheet).map(r => String(r.CODE || ''))
    );

    let newCode = '';
    for (let i = 0; i < 300; i++) {
      const candidate = String(Math.floor(100000 + Math.random() * 900000));
      if (!existing.has(candidate)) {
        newCode = candidate;
        break;
      }
    }

    if (!newCode) throw new Error('No se ha podido generar un código nuevo.');

    const now = new Date();

    appendObjects_(servicesSheet, SERVICE_HEADERS, [{
      CODE: newCode,
      SERVICE_NAME: sourceService.serviceName
        ? sourceService.serviceName + ' · COPIA'
        : '',
      SERVICE_DATE: '',
      VENUE: sourceService.venue || '',
      PDF_NAME: '',
      CREATED_AT: now,
      UPDATED_AT: now,
      CLOSED: false,
      CLOSED_AT: '',
      FINAL_PDF_ID: '',
      FINAL_PDF_URL: ''
    }]);

    const scenarioMap = {};
    const scenarioRows = sourceService.scenarios.map((s, index) => {
      const newScenarioId = index === 0
        ? DEFAULT_SCENARIO.id
        : uniqueId_('S');

      scenarioMap[s.id] = newScenarioId;

      return {
        CODE: newCode,
        SCENARIO_ID: newScenarioId,
        NAME: s.name,
        SORT_ORDER: index + 1
      };
    });

    if (!scenarioRows.length) {
      scenarioRows.push({
        CODE: newCode,
        SCENARIO_ID: DEFAULT_SCENARIO.id,
        NAME: DEFAULT_SCENARIO.name,
        SORT_ORDER: 1
      });
      scenarioMap[DEFAULT_SCENARIO.id] = DEFAULT_SCENARIO.id;
    }

    appendObjects_(
      db.getSheetByName(SHEET_SCENARIOS),
      SCENARIO_HEADERS,
      scenarioRows
    );

    const teamRows = sourceService.teams.map((t, index) => ({
      CODE: newCode,
      TEAM_ID: uniqueId_('T'),
      SCENARIO_ID: scenarioMap[t.scenarioId] || DEFAULT_SCENARIO.id,
      NAME: t.name,
      COLOR_NAME: t.colorName,
      COLOR_HEX: t.colorHex,
      NO_VEST: Boolean(t.noVest),
      SORT_ORDER: index + 1
    }));

    if (teamRows.length) {
      appendObjects_(db.getSheetByName(SHEET_TEAMS), TEAM_HEADERS, teamRows);
    } else {
      createDefaultTeamsForScenario_(db, newCode, DEFAULT_SCENARIO.id);
    }

    ensureCoreTeams_(db, newCode);
    ensureReserveTeam_(db, newCode);

    logAudit_(db, newCode, 'SERVICE_SETUP_DUPLICATED', '', {
      sourceCode: sourceCode
    });

    return loadService_(db, newCode);

  } finally {
    lock.releaseLock();
  }
}

function saveServiceMeta(code, meta) {
  code = normalizeCode_(code);
  meta = meta || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceOpen_(db, code);
    const sheet = db.getSheetByName(SHEET_SERVICES);
    const found = findObjectRow_(sheet, 'CODE', code);

    if (!found) throw new Error('No existe el servicio ' + code + '.');

    const values = found.object;

    values.SERVICE_NAME = String(meta.serviceName || '').trim();
    values.SERVICE_DATE = String(meta.serviceDate || '').trim();
    values.VENUE = String(meta.venue || '').trim();
    values.PDF_NAME = String(meta.pdfName || values.PDF_NAME || '').trim();
    if (Array.isArray(meta.workOrder)) {
      values.WORK_ORDER_JSON = JSON.stringify(meta.workOrder.map(String));
    }
    if (Array.isArray(meta.hiddenWorkTypes)) {
      values.HIDDEN_WORK_TYPES_JSON = JSON.stringify(meta.hiddenWorkTypes.map(String));
    }
    values.UPDATED_AT = new Date();

    writeObjectRow_(sheet, found.row, values);

    return { ok: true };

  } finally {
    lock.releaseLock();
  }
}

function addScenario(code, name) {
  code = normalizeCode_(code);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);
    assertServiceOpen_(db, code);

    const scenarios = readScenarios_(db, code);
    const seq = scenarios.length + 1;
    const id = uniqueId_('S');

    const scenario = {
      id: id,
      name: String(name || ('ESCENARIO ' + seq)).trim() || ('ESCENARIO ' + seq),
      sortOrder: seq
    };

    appendObjects_(db.getSheetByName(SHEET_SCENARIOS), SCENARIO_HEADERS, [{
      CODE: code,
      SCENARIO_ID: scenario.id,
      NAME: scenario.name,
      SORT_ORDER: scenario.sortOrder
    }]);

    createDefaultTeamsForScenario_(db, code, scenario.id);

    touchService_(db, code);

    return loadService_(db, code);

  } finally {
    lock.releaseLock();
  }
}

function saveScenariosAndTeams(code, scenarios, teams) {
  code = normalizeCode_(code);
  scenarios = Array.isArray(scenarios) ? scenarios : [];
  teams = Array.isArray(teams) ? teams : [];

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);
    assertServiceOpen_(db, code);

    const scenarioSheet = db.getSheetByName(SHEET_SCENARIOS);
    const teamSheet = db.getSheetByName(SHEET_TEAMS);

    deleteRowsByField_(scenarioSheet, 'CODE', code);
    deleteRowsByField_(teamSheet, 'CODE', code);

    const cleanScenarios = scenarios
      .map((s, i) => ({
        id: sanitizeId_(s.id || uniqueId_('S')),
        name: String(s.name || '').trim(),
        sortOrder: i + 1
      }))
      .filter(s => s.name);

    if (!cleanScenarios.length) {
      cleanScenarios.push({
        id: DEFAULT_SCENARIO.id,
        name: DEFAULT_SCENARIO.name,
        sortOrder: 1
      });
    }

    appendObjects_(
      scenarioSheet,
      SCENARIO_HEADERS,
      cleanScenarios.map(s => ({
        CODE: code,
        SCENARIO_ID: s.id,
        NAME: s.name,
        SORT_ORDER: s.sortOrder
      }))
    );

    const validScenarioIds = new Set(cleanScenarios.map(s => s.id));

    const cleanTeams = teams
      .map((t, i) => ({
        id: sanitizeId_(t.id || uniqueId_('T')),
        scenarioId: String(t.scenarioId || '').trim(),
        name: String(t.name || '').trim(),
        colorName: String(t.colorName || '').trim(),
        colorHex: normalizeHex_(t.colorHex),
        noVest: Boolean(t.noVest),
        sortOrder: Number(t.sortOrder || (i + 1))
      }))
      .filter(t => t.name && validScenarioIds.has(t.scenarioId));

    appendObjects_(
      teamSheet,
      TEAM_HEADERS,
      cleanTeams.map(t => ({
        CODE: code,
        TEAM_ID: t.id,
        SCENARIO_ID: t.scenarioId,
        NAME: t.name,
        COLOR_NAME: t.colorName,
        COLOR_HEX: t.colorHex,
        NO_VEST: t.noVest,
        SORT_ORDER: t.sortOrder
      }))
    );

    // Limpia asignaciones huérfanas.
    const validTeamIds = new Set(cleanTeams.map(t => t.id));
    const workerSheet = db.getSheetByName(SHEET_WORKERS);
    const workerObjects = getDataObjects_(workerSheet);
    let changed = false;

    workerObjects.forEach(item => {
      if (String(item.CODE) !== code) return;

      if (item.TEAM_ID && !validTeamIds.has(String(item.TEAM_ID))) {
        item.TEAM_ID = '';
        item.SCENARIO_ID = '';
        changed = true;
      } else if (item.TEAM_ID) {
        const team = cleanTeams.find(t => t.id === String(item.TEAM_ID));
        if (team) item.SCENARIO_ID = team.scenarioId;
      }
    });

    if (changed) rewriteObjects_(workerSheet, WORKER_HEADERS, workerObjects);

    // Si se elimina un equipo, también quitamos objetivos de dotación
    // que apuntaban a ese equipo para evitar resúmenes obsoletos.
    const requirementSheet = db.getSheetByName(SHEET_REQUIREMENTS);
    const allRequirements = getDataObjects_(requirementSheet);
    const cleanRequirements = allRequirements.filter(r =>
      String(r.CODE || '') !== code || validTeamIds.has(String(r.TEAM_ID || ''))
    );
    if (cleanRequirements.length !== allRequirements.length) {
      rewriteObjects_(requirementSheet, REQUIREMENT_HEADERS, cleanRequirements);
    }

    touchService_(db, code);

    return loadService_(db, code);

  } finally {
    lock.releaseLock();
  }
}

function replaceWorkersFromPdf(code, payload) {
  code = normalizeCode_(code);
  payload = payload || {};
  const incomingWorkers = Array.isArray(payload.workers) ? payload.workers : [];
  const meta = payload.meta || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);
    assertServiceOpen_(db, code);
    const coreTeams = ensureCoreTeams_(db, code);
    ensureReserveTeam_(db, code);

    // Metadatos generales del PDF.
    const serviceSheet = db.getSheetByName(SHEET_SERVICES);
    const found = findObjectRow_(serviceSheet, 'CODE', code);
    const serviceObj = found.object;

    if (String(meta.reference || '').trim()) serviceObj.SERVICE_NAME = String(meta.reference).trim();
    if (String(meta.serviceDate || '').trim()) serviceObj.SERVICE_DATE = normalizeDate_(meta.serviceDate);
    if (String(meta.venue || '').trim()) serviceObj.VENUE = String(meta.venue).trim();
    if (String(meta.pdfName || '').trim()) serviceObj.PDF_NAME = String(meta.pdfName).trim();
    serviceObj.UPDATED_AT = new Date();
    writeObjectRow_(serviceSheet, found.row, serviceObj);

    const workerSheet = db.getSheetByName(SHEET_WORKERS);
    const oldAll = getDataObjects_(workerSheet);
    const oldForService = oldAll.filter(r => String(r.CODE) === code);
    const usedOldIndexes = new Set();
    const reserveTeam = ensureReserveTeam_(db, code);

    const summary = {
      added: 0,
      removed: 0,
      matched: 0,
      scheduleChanged: 0,
      pauseChanged: 0,
      dietChanged: 0,
      coordinatorChanged: 0,
      movedToReserve: 0,
      changedNames: []
    };

    const rows = incomingWorkers.map((incoming, index) => {
      const normalizedIncoming = {
        serviceDate: normalizeDate_(incoming.serviceDate || meta.serviceDate || ''),
        trabajo: normalizeBaseWorkType_(incoming.trabajo || ''),
        isReserve: asBoolean_(incoming.isReserve, false),
        personal: String(incoming.personal || '').trim(),
        especialidad: String(incoming.especialidad || '').trim(),
        hLlam: normalizeTime_(incoming.hLlam),
        inicio: normalizeTime_(incoming.inicio),
        fin: normalizeTime_(incoming.fin),
        pausa: normalizePause_(incoming.pausa),
        nDieta: normalizeDietCount_(incoming.nDieta),
        isCoordinator: asBoolean_(incoming.isCoordinator, false),
        movil: normalizeMobile_(incoming.movil)
      };

      const oldIndex = findBestWorkerMatch_(oldForService, usedOldIndexes, normalizedIncoming);
      const old = oldIndex >= 0 ? oldForService[oldIndex] : null;

      if (old) {
        usedOldIndexes.add(oldIndex);
        summary.matched++;
      } else {
        summary.added++;
      }

      const oldInicio = old ? normalizeTime_(old.INICIO) : '';
      const oldFin = old ? normalizeTime_(old.FIN) : '';
      const oldHLlam = old ? normalizeTime_(old.H_LLAM) : '';

      if (old && (oldInicio !== normalizedIncoming.inicio || oldFin !== normalizedIncoming.fin || oldHLlam !== normalizedIncoming.hLlam)) {
        summary.scheduleChanged++;
        if (summary.changedNames.length < 12) summary.changedNames.push(normalizedIncoming.personal);
      }

      if (old && normalizePause_(old.PAUSA) !== normalizedIncoming.pausa) {
        summary.pauseChanged++;
      }
      if (old && normalizeDietCount_(old.N_DIETA) !== normalizedIncoming.nDieta) {
        summary.dietChanged++;
      }
      if (old && asBoolean_(old.IS_COORDINATOR, false) !== normalizedIncoming.isCoordinator) {
        summary.coordinatorChanged++;
      }

      const oldWasReserve = old ? asBoolean_(old.IS_RESERVE, false) : false;
      let teamId = old ? String(old.TEAM_ID || '') : '';
      let scenarioId = old ? String(old.SCENARIO_ID || '') : '';

      if (normalizedIncoming.isReserve && reserveTeam) {
        if (!oldWasReserve || teamId !== reserveTeam.id) summary.movedToReserve++;
        teamId = reserveTeam.id;
        scenarioId = reserveTeam.scenarioId;
      } else if (oldWasReserve && reserveTeam && teamId === reserveTeam.id) {
        // Si deja de ser reserva, no conservamos la asignación automática RESERVA.
        teamId = '';
        scenarioId = '';
      }

      // CREW HEAD y FORKLIFTER se autoasignan únicamente cuando
      // no existe una asignación manual/conservada.
      if (!teamId) {
        const role = normalize_(normalizedIncoming.especialidad);
        if (role.includes('CREW HEAD') && coreTeams.CREW_HEAD) {
          teamId = coreTeams.CREW_HEAD.id;
          scenarioId = coreTeams.CREW_HEAD.scenarioId;
        } else if (role.includes('FORKLIFTER') && coreTeams.FORKLIFTER) {
          teamId = coreTeams.FORKLIFTER.id;
          scenarioId = coreTeams.FORKLIFTER.scenarioId;
        }
      }

      return {
        CODE: code,
        WORKER_ID: old ? String(old.WORKER_ID || uniqueId_('W')) : uniqueId_('W'),
        SERVICE_DATE: normalizedIncoming.serviceDate,
        BLOCK_ID: String(incoming.blockId || '').trim(),
        BLOCK_LABEL: String(incoming.blockLabel || normalizedIncoming.trabajo).trim(),
        TRABAJO: normalizedIncoming.trabajo,
        IS_RESERVE: normalizedIncoming.isReserve,
        PERSONAL: normalizedIncoming.personal,
        ESPECIALIDAD: normalizedIncoming.especialidad,
        H_LLAM: normalizedIncoming.hLlam,
        INICIO: normalizedIncoming.inicio,
        FIN: normalizedIncoming.fin,
        PAUSA: normalizedIncoming.pausa,
        N_DIETA: normalizedIncoming.nDieta,
        IS_COORDINATOR: normalizedIncoming.isCoordinator,
        // Los datos reales/manuales pertenecen a la gestión del bolo, no al PDF.
        ACTUAL_INICIO: old ? normalizeTime_(old.ACTUAL_INICIO) : '',
        ACTUAL_FIN: old ? normalizeTime_(old.ACTUAL_FIN) : '',
        ACTUAL_PAUSA: old ? normalizeOptionalPause_(old.ACTUAL_PAUSA) : '',
        ACTUAL_N_DIETA: old ? normalizeOptionalDiet_(old.ACTUAL_N_DIETA) : '',
        MOVIL: normalizedIncoming.movil,
        SCENARIO_ID: scenarioId,
        TEAM_ID: teamId,
        STATUS: old ? normalizeStatus_(old.STATUS) : 'PENDIENTE',
        ARRIVAL_AT: old ? normalizeTime_(old.ARRIVAL_AT) : '',
        NOTES: old ? String(old.NOTES || '') : '',
        RATING_UNIFORMIDAD: old ? normalizeRating_(old.RATING_UNIFORMIDAD) : 0,
        RATING_ACTITUD: old ? normalizeRating_(old.RATING_ACTITUD) : 0,
        RATING_PUNTUALIDAD: old ? normalizeRating_(old.RATING_PUNTUALIDAD) : 0,
        INCLUDED: old ? asBoolean_(old.INCLUDED, true) : true,
        PAGE: Number(incoming.page || 0),
        PDF_ROW: Number(incoming.pdfRow || 0),
        SORT_ORDER: index + 1
      };
    });

    // Los trabajadores añadidos manualmente deben sobrevivir a una reimportación
    // posterior del PDF, siempre que no hayan sido eliminados.
    const preservedManualRows = [];

    oldForService.forEach((old, oldIndex) => {
      if (usedOldIndexes.has(oldIndex)) return;

      const isManual = String(old.BLOCK_ID || '').startsWith('MANUAL_');
      const included = asBoolean_(old.INCLUDED, true);

      if (!isManual || !included) return;

      usedOldIndexes.add(oldIndex);

      preservedManualRows.push({
        ...old,
        SORT_ORDER: rows.length + preservedManualRows.length + 1
      });
    });

    if (preservedManualRows.length) {
      rows.push(...preservedManualRows);
    }

    summary.removed = oldForService.length - usedOldIndexes.size;

    // Sustituimos únicamente las filas de este servicio: las personas que ya no
    // aparecen desaparecen, las nuevas se añaden y las coincidentes conservan gestión.
    deleteRowsByField_(workerSheet, 'CODE', code);
    appendObjects_(workerSheet, WORKER_HEADERS, rows);
    touchService_(db, code);
    logAudit_(db, code, 'PDF_REIMPORT', '', summary);

    return {
      service: loadService_(db, code),
      summary: summary
    };

  } finally {
    lock.releaseLock();
  }
}

function findBestWorkerMatch_(oldRows, usedIndexes, incoming) {
  const targetName = normalize_(incoming.personal);
  const targetDate = normalizeDate_(incoming.serviceDate);
  const targetWork = normalize_(normalizeBaseWorkType_(incoming.trabajo));
  const targetSpeciality = normalize_(incoming.especialidad);
  const targetPhone = phoneDigits_(incoming.movil);

  let bestIndex = -1;
  let bestScore = -1;

  oldRows.forEach((old, index) => {
    if (usedIndexes.has(index)) return;
    if (normalize_(old.PERSONAL) !== targetName) return;
    if (normalizeDate_(old.SERVICE_DATE) !== targetDate) return;
    if (normalize_(normalizeBaseWorkType_(old.TRABAJO)) !== targetWork) return;

    let score = 100;
    const oldSpeciality = normalize_(old.ESPECIALIDAD);
    const oldPhone = phoneDigits_(old.MOVIL);

    if (oldSpeciality && targetSpeciality && oldSpeciality === targetSpeciality) score += 25;
    if (oldPhone && targetPhone && oldPhone === targetPhone) score += 25;
    if (normalizeTime_(old.INICIO) === incoming.inicio) score += 12;
    if (normalizeTime_(old.FIN) === incoming.fin) score += 12;
    if (asBoolean_(old.IS_RESERVE, false) === Boolean(incoming.isReserve)) score += 6;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function phoneDigits_(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeBaseWorkType_(value) {
  return String(value || '')
    .replace(/\+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function saveWorkerChanges(code, updates) {
  code = normalizeCode_(code);
  updates = Array.isArray(updates) ? updates : [];
  if (!updates.length) return { ok: true };

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);
    assertServiceOpen_(db, code);

    const sheet = db.getSheetByName(SHEET_WORKERS);
    if (sheet.getLastRow() <= 1) return { ok: true, updated: 0 };

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const headerIndex = {};
    headers.forEach((h, i) => headerIndex[String(h || '').trim()] = i);

    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();
    const updateMap = {};
    updates.forEach(u => {
      if (u && u.workerId) updateMap[String(u.workerId)] = u;
    });

    const needsTeamLookup = updates.some(u =>
      u && Object.prototype.hasOwnProperty.call(u, 'teamId')
    );

    const teamMap = {};

    if (needsTeamLookup) {
      readTeams_(db, code).forEach(t => teamMap[t.id] = t);
    }

    let minIndex = Infinity;
    let maxIndex = -1;
    let count = 0;

    values.forEach((row, index) => {
      const rowCode = String(row[headerIndex.CODE] || '');
      if (rowCode !== code) return;

      const workerId = String(row[headerIndex.WORKER_ID] || '');
      const update = updateMap[workerId];
      if (!update) return;

      if (Object.prototype.hasOwnProperty.call(update, 'teamId')) {
        const teamId = String(update.teamId || '');
        row[headerIndex.TEAM_ID] = teamId;
        row[headerIndex.SCENARIO_ID] = teamId && teamMap[teamId] ? teamMap[teamId].scenarioId : '';
      }
      if (Object.prototype.hasOwnProperty.call(update, 'status')) {
        const previousStatus = normalizeStatus_(row[headerIndex.STATUS]);
        const normalizedStatus = normalizeStatus_(update.status);
        row[headerIndex.STATUS] = normalizedStatus;

        // El primer cambio real a PRESENTE registra la hora de llegada.
        // NO modifica ACTUAL_INICIO: el horario real sigue siendo un dato manual.
        if (
          normalizedStatus === 'PRESENTE' &&
          previousStatus !== 'PRESENTE' &&
          headerIndex.ARRIVAL_AT !== undefined &&
          !normalizeTime_(row[headerIndex.ARRIVAL_AT])
        ) {
          row[headerIndex.ARRIVAL_AT] =
            Utilities.formatDate(new Date(), getAppTimeZone_(), 'HH:mm');
        }
      }
      if (Object.prototype.hasOwnProperty.call(update, 'notes')) {
        row[headerIndex.NOTES] = String(update.notes || '');
      }
      if (Object.prototype.hasOwnProperty.call(update, 'included')) {
        row[headerIndex.INCLUDED] = Boolean(update.included);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'isReserve')) {
        row[headerIndex.IS_RESERVE] = Boolean(update.isReserve);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'especialidad')) {
        row[headerIndex.ESPECIALIDAD] = String(update.especialidad || '').trim();
      }
      if (Object.prototype.hasOwnProperty.call(update, 'actualStart')) {
        row[headerIndex.ACTUAL_INICIO] = normalizeTime_(update.actualStart);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'actualEnd')) {
        row[headerIndex.ACTUAL_FIN] = normalizeTime_(update.actualEnd);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'actualPause')) {
        row[headerIndex.ACTUAL_PAUSA] = update.actualPause === null || update.actualPause === ''
          ? ''
          : normalizePause_(update.actualPause);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'actualDiet')) {
        row[headerIndex.ACTUAL_N_DIETA] = update.actualDiet === null || update.actualDiet === ''
          ? ''
          : normalizeDietCount_(update.actualDiet);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'ratingUniformidad')) {
        row[headerIndex.RATING_UNIFORMIDAD] = normalizeRating_(update.ratingUniformidad);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'ratingActitud')) {
        row[headerIndex.RATING_ACTITUD] = normalizeRating_(update.ratingActitud);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'ratingPuntualidad')) {
        row[headerIndex.RATING_PUNTUALIDAD] = normalizeRating_(update.ratingPuntualidad);
      }

      minIndex = Math.min(minIndex, index);
      maxIndex = Math.max(maxIndex, index);
      count++;
    });

    // Una sola escritura para el tramo afectado.
    if (count && minIndex <= maxIndex) {
      sheet.getRange(minIndex + 2, 1, maxIndex - minIndex + 1, lastCol)
        .setValues(values.slice(minIndex, maxIndex + 1));

      const changedFields = new Set();
      updates.forEach(u => {
        Object.keys(u || {}).forEach(k => {
          if (k !== 'workerId') changedFields.add(k);
        });
      });

      // Marcar PRESENTE/CONTACTADO/NO PRESENTADO es una operación muy frecuente.
      // No hacemos dos escrituras adicionales de auditoría/UPDATED_AT en esos clics.
      const lightweight =
        changedFields.size === 1 &&
        changedFields.has('status');

      if (!lightweight) {
        touchService_(db, code);
        logAudit_(db, code, 'WORKER_UPDATE', '', {
          updatedWorkers: count,
          fields: [...changedFields]
        });
      }
    }

    return { ok: true, updated: count };

  } finally {
    lock.releaseLock();
  }
}




function addManualWorker(code, data) {
  code = normalizeCode_(code);
  data = data || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceOpen_(db, code);

    const personal = String(data.personal || '').trim();
    const serviceDate = normalizeDate_(data.serviceDate);
    const trabajo = normalizeBaseWorkType_(data.trabajo);

    if (!personal) throw new Error('Indica el nombre del trabajador.');
    if (!serviceDate) throw new Error('No se ha podido determinar la fecha del servicio.');
    if (!trabajo) throw new Error('No se ha podido determinar el tipo de servicio.');

    const teamId = String(data.teamId || '').trim();
    const team = teamId
      ? readTeams_(db, code).find(t => t.id === teamId)
      : null;

    const existingWorkers = readWorkers_(db, code);
    const nextSort = existingWorkers.length
      ? Math.max(...existingWorkers.map(w => Number(w.sortOrder || 0))) + 1
      : 1;

    const id = uniqueId_('W');

    appendObjects_(db.getSheetByName(SHEET_WORKERS), WORKER_HEADERS, [{
      CODE: code,
      WORKER_ID: id,
      SERVICE_DATE: serviceDate,
      BLOCK_ID: 'MANUAL_' + id,
      BLOCK_LABEL: trabajo + ' · MANUAL',
      TRABAJO: trabajo,
      IS_RESERVE: Boolean(data.isReserve),
      PERSONAL: personal,
      ESPECIALIDAD: String(data.especialidad || '').trim(),
      H_LLAM: normalizeTime_(data.hLlam || data.inicio || ''),
      INICIO: normalizeTime_(data.inicio),
      FIN: normalizeTime_(data.fin),
      PAUSA: normalizePause_(data.pausa || '00:00'),
      N_DIETA: normalizeDietCount_(data.nDieta || 0),
      IS_COORDINATOR: Boolean(data.isCoordinator),
      ACTUAL_INICIO: '',
      ACTUAL_FIN: '',
      ACTUAL_PAUSA: '',
      ACTUAL_N_DIETA: '',
      MOVIL: normalizeMobile_(data.movil),
      SCENARIO_ID: team ? team.scenarioId : '',
      TEAM_ID: team ? team.id : '',
      STATUS: 'PENDIENTE',
      ARRIVAL_AT: '',
      NOTES: 'Añadido manualmente',
      RATING_UNIFORMIDAD: 0,
      RATING_ACTITUD: 0,
      RATING_PUNTUALIDAD: 0,
      INCLUDED: true,
      PAGE: 0,
      PDF_ROW: 0,
      SORT_ORDER: nextSort
    }]);

    touchService_(db, code);
    logAudit_(db, code, 'WORKER_MANUAL_ADD', id, {
      personal,
      serviceDate,
      trabajo
    });

    return readWorkers_(db, code).find(w => w.id === id);

  } finally {
    lock.releaseLock();
  }
}


/* =========================================================
   PLANIFICACIÓN DE DOTACIÓN POR DÍA / TIPO DE SERVICIO
   ========================================================= */

function saveTeamRequirements(code, serviceDate, trabajo, requirements, noTeams) {
  code = normalizeCode_(code);
  serviceDate = normalizeDate_(serviceDate);
  trabajo = normalizeBaseWorkType_(trabajo);
  requirements = Array.isArray(requirements) ? requirements : [];
  noTeams = Boolean(noTeams);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceOpen_(db, code);

    const sheet = db.getSheetByName(SHEET_REQUIREMENTS);
    const all = getDataObjects_(sheet);

    const kept = all.filter(r => !(
      String(r.CODE || '') === code &&
      normalizeDate_(r.SERVICE_DATE) === serviceDate &&
      normalize_(normalizeBaseWorkType_(r.TRABAJO)) === normalize_(trabajo)
    ));

    const now = new Date();
    const savedForThisWork = [];

    if (noTeams) {
      const markerRow = {
        CODE: code,
        SERVICE_DATE: serviceDate,
        TRABAJO: trabajo,
        TEAM_ID: NO_TEAMS_REQUIREMENT_TEAM_ID,
        REQUIRED_COUNT: 0,
        UPDATED_AT: now
      };

      kept.push(markerRow);
      savedForThisWork.push({
        serviceDate,
        trabajo,
        teamId: NO_TEAMS_REQUIREMENT_TEAM_ID,
        requiredCount: 0,
        updatedAt: dateToIso_(now)
      });

    } else {
      requirements.forEach(r => {
        const teamId = String(r.teamId || '').trim();
        const count = Math.max(0, Math.floor(Number(r.requiredCount || 0)));

        if (!teamId || teamId === NO_TEAMS_REQUIREMENT_TEAM_ID || !count) return;

        const row = {
          CODE: code,
          SERVICE_DATE: serviceDate,
          TRABAJO: trabajo,
          TEAM_ID: teamId,
          REQUIRED_COUNT: count,
          UPDATED_AT: now
        };

        kept.push(row);
        savedForThisWork.push({
          serviceDate,
          trabajo,
          teamId,
          requiredCount: count,
          updatedAt: dateToIso_(now)
        });
      });
    }

    rewriteObjects_(sheet, REQUIREMENT_HEADERS, kept);

    return {
      ok: true,
      saved: savedForThisWork,
      noTeams: noTeams
    };

  } finally {
    lock.releaseLock();
  }
}

function readRequirements_(db, code) {
  return getDataObjects_(db.getSheetByName(SHEET_REQUIREMENTS))
    .filter(r => String(r.CODE || '') === code)
    .map(r => ({
      serviceDate: normalizeDate_(r.SERVICE_DATE),
      trabajo: normalizeBaseWorkType_(r.TRABAJO),
      teamId: String(r.TEAM_ID || ''),
      requiredCount: Math.max(0, Math.floor(Number(r.REQUIRED_COUNT || 0))),
      updatedAt: dateToIso_(r.UPDATED_AT)
    }));
}

/* =========================================================
   INCIDENCIAS, HISTORIAL Y CIERRE
   ========================================================= */

function saveIncident(code, incident) {
  code = normalizeCode_(code);
  incident = incident || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();

    // assertServiceOpen_ ya comprueba también que el servicio exista.
    assertServiceOpen_(db, code);

    const incidentSheet = db.getSheetByName(SHEET_INCIDENTS);
    const workerSheet = db.getSheetByName(SHEET_WORKERS);

    const incidentId = String(incident.incidentId || '').trim() || uniqueId_('INC');
    const existing = findObjectRow_(incidentSheet, 'INCIDENT_ID', incidentId);

    const workerId = String(incident.workerId || '').trim();
    let workerFound = null;
    let worker = null;

    if (workerId) {
      workerFound = findObjectRow_(workerSheet, 'WORKER_ID', workerId);

      if (
        !workerFound ||
        String(workerFound.object.CODE || '') !== code
      ) {
        throw new Error('No se ha encontrado el trabajador de la incidencia.');
      }

      worker = workerFound.object;
    }

    const serviceDate = worker
      ? normalizeDate_(worker.SERVICE_DATE)
      : normalizeDate_(incident.serviceDate);

    if (!serviceDate) {
      throw new Error('No se ha podido determinar la fecha de la incidencia.');
    }

    const trabajo = worker
      ? normalizeBaseWorkType_(worker.TRABAJO)
      : (normalizeBaseWorkType_(incident.trabajo) || 'GENERAL');

    const category = normalizeIncidentCategory_(incident.category);
    let oldCategory = '';
    let newCategory = '';

    if (category === 'CAMBIO CATEGORIA') {
      if (!worker || !workerFound) {
        throw new Error('El cambio de categoría debe vincularse a un trabajador.');
      }

      newCategory = String(incident.newCategory || '').trim();
      if (!newCategory) throw new Error('Indica la nueva categoría del trabajador.');

      oldCategory = existing && String(existing.object.OLD_CATEGORY || '').trim()
        ? String(existing.object.OLD_CATEGORY || '').trim()
        : String(worker.ESPECIALIDAD || '').trim();

      // Actualizamos la especialidad en la propia ficha del trabajador.
      if (normalize_(worker.ESPECIALIDAD) !== normalize_(newCategory)) {
        worker.ESPECIALIDAD = newCategory;
        writeObjectRow_(workerSheet, workerFound.row, worker);
      }
    }

    const obj = {
      CODE: code,
      INCIDENT_ID: incidentId,
      WORKER_ID: worker ? String(worker.WORKER_ID || '') : '',
      PERSONAL: worker ? String(worker.PERSONAL || '') : 'GENERAL',
      SERVICE_DATE: serviceDate,
      TRABAJO: trabajo,
      CREATED_AT: existing ? existing.object.CREATED_AT : new Date(),
      CATEGORY: category,
      SEVERITY: normalizeIncidentSeverity_(incident.severity),
      OLD_CATEGORY: oldCategory,
      NEW_CATEGORY: newCategory,
      DESCRIPTION: String(incident.description || '').trim(),
      ACTION_TAKEN: String(incident.actionTaken || '').trim(),
      STATUS: normalizeIncidentStatus_(incident.status)
    };

    if (!obj.DESCRIPTION) throw new Error('Describe la incidencia.');

    if (existing && String(existing.object.CODE || '') === code) {
      writeObjectRow_(incidentSheet, existing.row, obj);
    } else {
      appendObjects_(incidentSheet, INCIDENT_HEADERS, [obj]);
    }

    // Rendimiento:
    // no tocamos SERVICES, no escribimos AUDIT y no releemos toda la hoja
    // de incidencias. La propia incidencia ya actúa como registro.
    return {
      ok: true,
      incident: mapIncident_(obj),
      worker: worker ? {
        id: String(worker.WORKER_ID || ''),
        especialidad: category === 'CAMBIO CATEGORIA'
          ? newCategory
          : String(worker.ESPECIALIDAD || '')
      } : null
    };

  } finally {
    lock.releaseLock();
  }
}

function deleteIncident(code, incidentId) {
  code = normalizeCode_(code);
  incidentId = String(incidentId || '').trim();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceOpen_(db, code);

    const sheet = db.getSheetByName(SHEET_INCIDENTS);
    const found = findObjectRow_(sheet, 'INCIDENT_ID', incidentId);

    if (!found || String(found.object.CODE || '') !== code) {
      throw new Error('No se ha encontrado la incidencia.');
    }

    // Eliminación directa. No tocamos SERVICES, AUDIT ni releemos toda
    // la hoja: la interfaz ya elimina la tarjeta de forma optimista.
    sheet.deleteRow(found.row);

    return { ok: true, incidentId: incidentId };

  } finally {
    lock.releaseLock();
  }
}

function getServiceAudit(code) {
  code = normalizeCode_(code);
  const db = getOrCreateDatabase_();
  assertServiceExists_(db, code);
  return readAudit_(db, code, 80);
}

function getWorkerHistory(code, workerId) {
  code = normalizeCode_(code);
  workerId = String(workerId || '').trim();

  const db = getOrCreateDatabase_();
  assertServiceExists_(db, code);

  const current = readWorkers_(db, code).find(w => w.id === workerId);
  if (!current) throw new Error('Trabajador no encontrado.');

  const all = getDataObjects_(db.getSheetByName(SHEET_WORKERS));
  const phone = phoneDigits_(current.movil);
  const name = normalize_(current.personal);

  const matches = all
    .filter(r => {
      const samePhone = phone && phoneDigits_(r.MOVIL) === phone;
      const sameName = normalize_(r.PERSONAL) === name;
      return samePhone || (!phone && sameName);
    })
    .map(r => ({
      code: String(r.CODE || ''),
      date: normalizeDate_(r.SERVICE_DATE),
      trabajo: normalizeBaseWorkType_(r.TRABAJO),
      status: normalizeStatus_(r.STATUS),
      arrivalAt: normalizeTime_(r.ARRIVAL_AT),
      ratingUniformidad: normalizeRating_(r.RATING_UNIFORMIDAD),
      ratingActitud: normalizeRating_(r.RATING_ACTITUD),
      ratingPuntualidad: normalizeRating_(r.RATING_PUNTUALIDAD),
      actualStart: normalizeTime_(r.ACTUAL_INICIO),
      actualEnd: normalizeTime_(r.ACTUAL_FIN),
      inicio: normalizeTime_(r.INICIO),
      fin: normalizeTime_(r.FIN),
      actualPause: normalizeOptionalPause_(r.ACTUAL_PAUSA),
      pausa: normalizePause_(r.PAUSA)
    }));

  const incidents = getDataObjects_(db.getSheetByName(SHEET_INCIDENTS))
    .filter(r => {
      const workerMatches = String(r.WORKER_ID || '') === workerId && String(r.CODE || '') === code;
      const nameMatches = normalize_(r.PERSONAL) === name;
      return workerMatches || nameMatches;
    });

  const ratings = [];
  matches.forEach(m => {
    [m.ratingUniformidad, m.ratingActitud, m.ratingPuntualidad]
      .filter(v => Number(v) > 0)
      .forEach(v => ratings.push(Number(v)));
  });

  const serviceCodes = [...new Set(matches.map(m => m.code).filter(Boolean))];

  return {
    personal: current.personal,
    movil: current.movil,
    services: serviceCodes.length,
    assignments: matches.length,
    present: matches.filter(m => m.status === 'PRESENTE').length,
    noShow: matches.filter(m => m.status === 'NO PRESENTADO').length,
    incidents: incidents.length,
    averageRating: ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0,
    totalActualMinutes: matches.reduce((sum, m) => sum + workedMinutesFromRaw_(m), 0),
    recent: matches
      .sort((a, b) => dateKey_(b.date) - dateKey_(a.date))
      .slice(0, 12)
  };
}

function closeService(code) {
  code = normalizeCode_(code);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);

    const sheet = db.getSheetByName(SHEET_SERVICES);
    const found = findObjectRow_(sheet, 'CODE', code);
    const serviceObj = found.object;

    if (asBoolean_(serviceObj.CLOSED, false)) {
      return {
        ok: true,
        alreadyClosed: true,
        closedAt: dateToIso_(serviceObj.CLOSED_AT),
        pdfUrl: String(serviceObj.FINAL_PDF_URL || '')
      };
    }

    // El cierre ya no espera a que termine el PDF.
    serviceObj.CLOSED = true;
    serviceObj.CLOSED_AT = new Date();
    serviceObj.FINAL_PDF_ID = '';
    serviceObj.FINAL_PDF_URL = '';
    serviceObj.UPDATED_AT = new Date();

    writeObjectRow_(sheet, found.row, serviceObj);

    return {
      ok: true,
      closedAt: dateToIso_(serviceObj.CLOSED_AT),
      pdfUrl: ''
    };

  } finally {
    lock.releaseLock();
  }
}

function generateClosedServicePdf(code) {
  code = normalizeCode_(code);

  const db = getOrCreateDatabase_();
  assertServiceExists_(db, code);

  const sheet = db.getSheetByName(SHEET_SERVICES);
  const found = findObjectRow_(sheet, 'CODE', code);
  const serviceObj = found.object;

  if (!asBoolean_(serviceObj.CLOSED, false)) {
    throw new Error('El servicio debe estar cerrado para generar el PDF final.');
  }

  // Si ya existe, no lo regeneramos.
  if (String(serviceObj.FINAL_PDF_URL || '').trim()) {
    return {
      ok: true,
      pdfId: String(serviceObj.FINAL_PDF_ID || ''),
      pdfUrl: String(serviceObj.FINAL_PDF_URL || '')
    };
  }

  // Generar el PDF fuera de un lock largo mantiene el resto de la app ágil.
  const pdf = generateFinalServicePdf_(db, code);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const refreshed = findObjectRow_(sheet, 'CODE', code);
    if (!refreshed) throw new Error('Servicio no encontrado.');

    // Si el usuario lo reabrió mientras se generaba, no bloqueamos ni cambiamos
    // su estado: solo guardamos el PDF producido.
    refreshed.object.FINAL_PDF_ID = pdf.fileId;
    refreshed.object.FINAL_PDF_URL = pdf.url;
    refreshed.object.UPDATED_AT = new Date();
    writeObjectRow_(sheet, refreshed.row, refreshed.object);

    logAudit_(db, code, 'SERVICE_CLOSE', '', {
      pdfId: pdf.fileId,
      pdfUrl: pdf.url
    });

    return {
      ok: true,
      pdfId: pdf.fileId,
      pdfUrl: pdf.url
    };

  } finally {
    lock.releaseLock();
  }
}

function reopenService(code) {
  code = normalizeCode_(code);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = getOrCreateDatabase_();
    assertServiceExists_(db, code);

    const sheet = db.getSheetByName(SHEET_SERVICES);
    const found = findObjectRow_(sheet, 'CODE', code);
    const obj = found.object;

    obj.CLOSED = false;
    obj.CLOSED_AT = '';
    obj.UPDATED_AT = new Date();
    writeObjectRow_(sheet, found.row, obj);

    logAudit_(db, code, 'SERVICE_REOPEN', '', {});
    return { ok: true, service: loadService_(db, code) };

  } finally {
    lock.releaseLock();
  }
}

/* =========================================================
   LECTURA DEL SERVICIO
   ========================================================= */

function parseStringArrayJson_(value) {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed)
      ? parsed.map(v => String(v || '').trim()).filter(Boolean)
      : [];
  } catch (err) {
    return [];
  }
}

function loadService_(db, code) {
  assertServiceExists_(db, code);

  ensureServiceDefaults_(db, code);

  const services = db.getSheetByName(SHEET_SERVICES);
  const found = findObjectRow_(services, 'CODE', code);
  const s = found.object;

  return {
    code: String(s.CODE),
    serviceName: String(s.SERVICE_NAME || ''),
    serviceDate: normalizeDate_(s.SERVICE_DATE),
    venue: String(s.VENUE || ''),
    pdfName: String(s.PDF_NAME || ''),
    workOrder: parseStringArrayJson_(s.WORK_ORDER_JSON),
    hiddenWorkTypes: parseStringArrayJson_(s.HIDDEN_WORK_TYPES_JSON),
    createdAt: dateToIso_(s.CREATED_AT),
    updatedAt: dateToIso_(s.UPDATED_AT),
    closed: asBoolean_(s.CLOSED, false),
    closedAt: dateToIso_(s.CLOSED_AT),
    finalPdfId: String(s.FINAL_PDF_ID || ''),
    finalPdfUrl: String(s.FINAL_PDF_URL || ''),
    scenarios: readScenarios_(db, code),
    teams: readTeams_(db, code),
    workers: readWorkers_(db, code),
    incidents: readIncidents_(db, code),
    requirements: readRequirements_(db, code),
    audit: readAudit_(db, code, 40)
  };
}

function readScenarios_(db, code) {
  return getDataObjects_(db.getSheetByName(SHEET_SCENARIOS))
    .filter(r => String(r.CODE) === code)
    .map(r => ({
      id: String(r.SCENARIO_ID || ''),
      name: String(r.NAME || ''),
      sortOrder: Number(r.SORT_ORDER || 0)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function readTeams_(db, code) {
  return getDataObjects_(db.getSheetByName(SHEET_TEAMS))
    .filter(r => String(r.CODE) === code)
    .map(r => ({
      id: String(r.TEAM_ID || ''),
      scenarioId: String(r.SCENARIO_ID || ''),
      name: String(r.NAME || ''),
      colorName: String(r.COLOR_NAME || ''),
      colorHex: String(r.COLOR_HEX || '#BDBDBD'),
      noVest: asBoolean_(r.NO_VEST, false),
      sortOrder: Number(r.SORT_ORDER || 0)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function readWorkers_(db, code) {
  return getDataObjects_(db.getSheetByName(SHEET_WORKERS))
    .filter(r => String(r.CODE) === code)
    .map(r => ({
      id: String(r.WORKER_ID || ''),
      serviceDate: normalizeDate_(r.SERVICE_DATE),
      blockId: String(r.BLOCK_ID || ''),
      blockLabel: String(r.BLOCK_LABEL || ''),
      trabajo: normalizeBaseWorkType_(r.TRABAJO),
      isReserve: asBoolean_(r.IS_RESERVE, false),
      personal: String(r.PERSONAL || ''),
      especialidad: String(r.ESPECIALIDAD || ''),
      hLlam: normalizeTime_(r.H_LLAM),
      inicio: normalizeTime_(r.INICIO),
      fin: normalizeTime_(r.FIN),
      pausa: normalizePause_(r.PAUSA),
      nDieta: normalizeDietCount_(r.N_DIETA),
      isCoordinator: asBoolean_(r.IS_COORDINATOR, false),
      actualStart: normalizeTime_(r.ACTUAL_INICIO),
      actualEnd: normalizeTime_(r.ACTUAL_FIN),
      actualPause: normalizeOptionalPause_(r.ACTUAL_PAUSA),
      actualDiet: normalizeOptionalDiet_(r.ACTUAL_N_DIETA),
      movil: normalizeMobile_(r.MOVIL),
      scenarioId: String(r.SCENARIO_ID || ''),
      teamId: String(r.TEAM_ID || ''),
      status: normalizeStatus_(r.STATUS),
      arrivalAt: normalizeTime_(r.ARRIVAL_AT),
      notes: String(r.NOTES || ''),
      ratingUniformidad: normalizeRating_(r.RATING_UNIFORMIDAD),
      ratingActitud: normalizeRating_(r.RATING_ACTITUD),
      ratingPuntualidad: normalizeRating_(r.RATING_PUNTUALIDAD),
      included: asBoolean_(r.INCLUDED, true),
      plannedMinutes: calculateWorkedMinutes_(
        normalizeTime_(r.INICIO),
        normalizeTime_(r.FIN),
        normalizePause_(r.PAUSA)
      ),
      actualMinutes: calculateWorkedMinutes_(
        normalizeTime_(r.ACTUAL_INICIO) || normalizeTime_(r.INICIO),
        normalizeTime_(r.ACTUAL_FIN) || normalizeTime_(r.FIN),
        normalizeOptionalPause_(r.ACTUAL_PAUSA) || normalizePause_(r.PAUSA)
      ),
      overtimeMinutes: calculateWorkedMinutes_(
        normalizeTime_(r.ACTUAL_INICIO) || normalizeTime_(r.INICIO),
        normalizeTime_(r.ACTUAL_FIN) || normalizeTime_(r.FIN),
        normalizeOptionalPause_(r.ACTUAL_PAUSA) || normalizePause_(r.PAUSA)
      ) - calculateWorkedMinutes_(
        normalizeTime_(r.INICIO),
        normalizeTime_(r.FIN),
        normalizePause_(r.PAUSA)
      ),
      page: Number(r.PAGE || 0),
      pdfRow: Number(r.PDF_ROW || 0),
      sortOrder: Number(r.SORT_ORDER || 0)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* =========================================================
   BASE DE DATOS + MIGRACIÓN V3 -> V4
   ========================================================= */

function getOrCreateDatabase_() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty(DATABASE_PROPERTY);

  let ss = null;
  let created = false;

  if (existingId) {
    try {
      ss = SpreadsheetApp.openById(existingId);
    } catch (err) {
      props.deleteProperty(DATABASE_PROPERTY);
      props.deleteProperty(DATABASE_SCHEMA_PROPERTY);
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create(DATABASE_NAME);
    created = true;

    try {
      DriveApp.getFileById(ss.getId()).moveTo(
        DriveApp.getFolderById(DESTINATION_FOLDER_ID)
      );
    } catch (err) {}

    props.setProperty(DATABASE_PROPERTY, ss.getId());
  }

  // Antes se recorría y migraba TODA la base en cada llamada de la web.
  // Ahora solo se hace al crear la base o al cambiar esta versión.
  if (
    created ||
    props.getProperty(DATABASE_SCHEMA_PROPERTY) !== DATABASE_SCHEMA_VERSION
  ) {
    ensureDatabaseSchema_(ss);
    props.setProperty(DATABASE_SCHEMA_PROPERTY, DATABASE_SCHEMA_VERSION);
  }

  return ss;
}

function ensureDatabaseSchema_(ss) {
  ensureSheet_(ss, SHEET_SERVICES, SERVICE_HEADERS);
  ensureSheet_(ss, SHEET_SCENARIOS, SCENARIO_HEADERS);
  ensureSheet_(ss, SHEET_TEAMS, TEAM_HEADERS);
  ensureSheet_(ss, SHEET_WORKERS, WORKER_HEADERS);
  ensureSheet_(ss, SHEET_INCIDENTS, INCIDENT_HEADERS);
  ensureSheet_(ss, SHEET_AUDIT, AUDIT_HEADERS);
  ensureSheet_(ss, SHEET_REQUIREMENTS, REQUIREMENT_HEADERS);

  // Migración de una base V3:
  migrateV3Teams_(ss);
  migrateV3Workers_(ss);
  migrateMissingScenarioDefaults_(ss);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    if (ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0) {
      sheet = ss.getSheets()[0];
      sheet.setName(name);
    } else {
      sheet = ss.insertSheet(name);
    }
  }

  const existingHeaders = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0]
    : [];

  const normalizedExisting = existingHeaders.map(normalize_);

  headers.forEach(header => {
    if (!normalizedExisting.includes(normalize_(header))) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      normalizedExisting.push(normalize_(header));
    }
  });

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  sheet.setFrozenRows(1);
}

function migrateV3Teams_(ss) {
  const sheet = ss.getSheetByName(SHEET_TEAMS);
  const headers = getHeaderMap_(sheet);

  // Si la V3 no tenía SCENARIO_ID, ensureSheet_ ya la añadió al final.
  // Aquí no movemos columnas: el acceso siempre se hace por nombre.
  if (!headers.SCENARIO_ID) return;
}

function migrateV3Workers_(ss) {
  // Igual que arriba: los nuevos campos se añaden al final y se leen por encabezado.
}

function migrateMissingScenarioDefaults_(ss) {
  const services = getDataObjects_(ss.getSheetByName(SHEET_SERVICES));
  const scenarioSheet = ss.getSheetByName(SHEET_SCENARIOS);
  const teamSheet = ss.getSheetByName(SHEET_TEAMS);

  services.forEach(service => {
    const code = String(service.CODE || '');
    if (!code) return;

    const scenarios = readScenarios_(ss, code);

    if (!scenarios.length) {
      appendObjects_(scenarioSheet, SCENARIO_HEADERS, [{
        CODE: code,
        SCENARIO_ID: DEFAULT_SCENARIO.id,
        NAME: DEFAULT_SCENARIO.name,
        SORT_ORDER: 1
      }]);
    }

    // Equipos antiguos sin SCENARIO_ID pasan al escenario principal.
    const allTeams = getDataObjects_(teamSheet);
    let changed = false;

    allTeams.forEach(t => {
      if (String(t.CODE) !== code) return;
      if (!String(t.SCENARIO_ID || '').trim()) {
        t.SCENARIO_ID = DEFAULT_SCENARIO.id;
        changed = true;
      }
    });

    if (changed) rewriteObjects_(teamSheet, TEAM_HEADERS, allTeams);
  });
}

function ensureServiceDefaults_(db, code) {
  const scenarios = readScenarios_(db, code);

  if (!scenarios.length) {
    createDefaultScenario_(db, code);
    ensureCoreTeams_(db, code);
    ensureReserveTeam_(db, code);
    return;
  }

  const teams = readTeams_(db, code);

  if (!teams.length) {
    createDefaultTeamsForScenario_(db, code, scenarios[0].id);
  }

  // Migración automática: añade estos equipos solo si faltan.
  ensureCoreTeams_(db, code);
  ensureReserveTeam_(db, code);
}

function createDefaultScenario_(db, code) {
  appendObjects_(db.getSheetByName(SHEET_SCENARIOS), SCENARIO_HEADERS, [{
    CODE: code,
    SCENARIO_ID: DEFAULT_SCENARIO.id,
    NAME: DEFAULT_SCENARIO.name,
    SORT_ORDER: 1
  }]);

  createDefaultTeamsForScenario_(db, code, DEFAULT_SCENARIO.id);
}

function createDefaultTeamsForScenario_(db, code, scenarioId) {
  const isMain = scenarioId === DEFAULT_SCENARIO.id;
  const definitions = (isMain ? DEFAULT_CORE_TEAMS : []).concat(DEFAULT_STAGE_TEAMS);

  const rows = definitions.map((team, i) => ({
    CODE: code,
    TEAM_ID: sanitizeId_(scenarioId + '_' + team.key + '_' + uniqueId_('T').slice(-6)),
    SCENARIO_ID: scenarioId,
    NAME: team.name,
    COLOR_NAME: team.colorName,
    COLOR_HEX: team.colorHex,
    NO_VEST: team.noVest,
    SORT_ORDER: i + 1
  }));

  appendObjects_(db.getSheetByName(SHEET_TEAMS), TEAM_HEADERS, rows);
}


function ensureCoreTeams_(db, code) {
  const scenarios = readScenarios_(db, code);
  if (!scenarios.length) return {};

  const mainScenario = scenarios.find(s => s.id === DEFAULT_SCENARIO.id) || scenarios[0];
  let teams = readTeams_(db, code);
  const result = {};

  DEFAULT_CORE_TEAMS.forEach((definition, index) => {
    let existing = teams.find(t => normalize_(t.name) === normalize_(definition.name));

    if (!existing) {
      const team = {
        id: sanitizeId_(mainScenario.id + '_' + definition.key + '_' + uniqueId_('T').slice(-6)),
        scenarioId: mainScenario.id,
        name: definition.name,
        colorName: definition.colorName,
        colorHex: definition.colorHex,
        noVest: true,
        sortOrder: index + 1
      };

      appendObjects_(db.getSheetByName(SHEET_TEAMS), TEAM_HEADERS, [{
        CODE: code,
        TEAM_ID: team.id,
        SCENARIO_ID: team.scenarioId,
        NAME: team.name,
        COLOR_NAME: team.colorName,
        COLOR_HEX: team.colorHex,
        NO_VEST: true,
        SORT_ORDER: team.sortOrder
      }]);

      existing = team;
      teams.push(team);
    }

    result[definition.key] = existing;
  });

  return result;
}

function ensureReserveTeam_(db, code) {
  const scenarios = readScenarios_(db, code);
  if (!scenarios.length) return null;

  const mainScenario = scenarios.find(s => s.id === DEFAULT_SCENARIO.id) || scenarios[0];
  const teams = readTeams_(db, code);
  const existing = teams.find(t => normalize_(t.name) === 'RESERVA');
  if (existing) return existing;

  const team = {
    id: sanitizeId_(mainScenario.id + '_RESERVE_' + uniqueId_('T').slice(-6)),
    scenarioId: mainScenario.id,
    name: 'RESERVA',
    colorName: 'GRIS',
    colorHex: '#6B7280',
    noVest: false,
    sortOrder: teams.filter(t => t.scenarioId === mainScenario.id).length + 1
  };

  appendObjects_(db.getSheetByName(SHEET_TEAMS), TEAM_HEADERS, [{
    CODE: code,
    TEAM_ID: team.id,
    SCENARIO_ID: team.scenarioId,
    NAME: team.name,
    COLOR_NAME: team.colorName,
    COLOR_HEX: team.colorHex,
    NO_VEST: team.noVest,
    SORT_ORDER: team.sortOrder
  }]);

  return team;
}

function assertServiceExists_(db, code) {
  if (!findObjectRow_(db.getSheetByName(SHEET_SERVICES), 'CODE', code)) {
    throw new Error('No existe ningún servicio con el código ' + code + '.');
  }
}

/* =========================================================
   HELPERS DE HOJAS
   ========================================================= */

function getHeaderMap_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const values = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const map = {};

  values.forEach((header, i) => {
    const key = String(header || '').trim();
    if (key) map[key] = i + 1;
  });

  return map;
}

function getDataObjects_(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();

  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[String(h).trim()] = row[i];
    });
    return obj;
  });
}

function appendObjects_(sheet, canonicalHeaders, objects) {
  if (!objects || !objects.length) return;

  ensureHeadersOnSheet_(sheet, canonicalHeaders);

  const currentHeaders = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  const rows = objects.map(obj =>
    currentHeaders.map(h => obj[String(h).trim()] !== undefined ? obj[String(h).trim()] : '')
  );

  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, currentHeaders.length)
    .setValues(rows);
}

function rewriteObjects_(sheet, canonicalHeaders, objects) {
  ensureHeadersOnSheet_(sheet, canonicalHeaders);

  const currentHeaders = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (!objects.length) return;

  const rows = objects.map(obj =>
    currentHeaders.map(h => obj[String(h).trim()] !== undefined ? obj[String(h).trim()] : '')
  );

  sheet.getRange(2, 1, rows.length, currentHeaders.length).setValues(rows);
}

function ensureHeadersOnSheet_(sheet, canonicalHeaders) {
  const existing = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getDisplayValues()[0];

  const normalized = existing.map(normalize_);

  canonicalHeaders.forEach(h => {
    if (!normalized.includes(normalize_(h))) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
      normalized.push(normalize_(h));
    }
  });
}

function findObjectRow_(sheet, field, value) {
  const map = getHeaderMap_(sheet);
  const col = map[field];
  if (!col || sheet.getLastRow() <= 1) return null;

  const found = sheet
    .getRange(2, col, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .findNext();

  if (!found) return null;

  const row = found.getRow();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  const object = {};

  headers.forEach((h, i) => {
    if (h) object[String(h).trim()] = values[i];
  });

  return { row, object };
}

function writeObjectRow_(sheet, rowNumber, object) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  const row = headers.map(h => object[String(h).trim()] !== undefined ? object[String(h).trim()] : '');
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}

function deleteRowsByField_(sheet, field, value) {
  const map = getHeaderMap_(sheet);
  const col = map[field];

  if (!col || sheet.getLastRow() <= 1) return;

  const values = sheet
    .getRange(2, col, sheet.getLastRow() - 1, 1)
    .getDisplayValues()
    .flat();

  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i]) === String(value)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function touchService_(db, code) {
  const sheet = db.getSheetByName(SHEET_SERVICES);
  const found = findObjectRow_(sheet, 'CODE', code);

  if (!found) return;

  found.object.UPDATED_AT = new Date();
  writeObjectRow_(sheet, found.row, found.object);
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function normalizeCode_(code) {
  const v = String(code || '').trim();
  if (!/^\d{6}$/.test(v)) throw new Error('El código debe tener 6 cifras.');
  return v;
}

function normalize_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeHex_(value) {
  const v = String(value || '').trim();
  return /^#[0-9A-Fa-f]{6}$/.test(v) ? v.toUpperCase() : '#BDBDBD';
}

function normalizeStatus_(value) {
  const v = normalize_(value);
  if (v === 'CONTACTADO') return 'CONTACTADO';
  if (v === 'PRESENTE') return 'PRESENTE';
  if (v === 'NO PRESENTADO') return 'NO PRESENTADO';
  return 'PENDIENTE';
}

function normalizeMobile_(value) {
  let v = String(value || '').trim().replace(/[()\s.-]/g, '');
  if (!v) return '';
  if (v.startsWith('0034')) v = '+34' + v.slice(4);
  else if (v.startsWith('34') && v.length === 11) v = '+34' + v.slice(2);
  return v;
}

function normalizeTime_(value) {
  if (value === null || value === undefined || value === '') return '';

  // En Sheets las horas pueden almacenarse como fechas del 30/12/1899.
  // Las convertimos a HH:mm y evitamos por completo GMT, zona horaria y 1899.
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, getAppTimeZone_(), 'HH:mm');
  }

  const v = String(value).trim();
  if (!v) return '';

  // Corrige también valores antiguos ya serializados como
  // "Sat Dec 30 1899 06:00:00 GMT..."
  const dateStringTime = v.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (/\b1899\b/.test(v) && dateStringTime) {
    return String(Number(dateStringTime[1])).padStart(2, '0') + ':' + dateStringTime[2];
  }

  const m = v.match(/^(\d{1,2})[:.,](\d{1,2})$/);
  if (!m) return v;

  return String(Number(m[1])).padStart(2, '0') + ':' +
    String(Number(m[2])).padStart(2, '0');
}

function normalizeDate_(value) {
  if (value === null || value === undefined || value === '') return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, getAppTimeZone_(), 'dd/MM/yyyy');
  }

  const v = String(value).trim();
  if (!v) return '';

  const direct = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (direct) {
    return String(Number(direct[1])).padStart(2, '0') + '/' +
      String(Number(direct[2])).padStart(2, '0') + '/' +
      direct[3];
  }

  // Compatibilidad con fechas antiguas serializadas por JavaScript.
  const parsed = new Date(v);
  if (!isNaN(parsed.getTime()) && !/\b1899\b/.test(v)) {
    return Utilities.formatDate(parsed, getAppTimeZone_(), 'dd/MM/yyyy');
  }

  return v;
}

function getAppTimeZone_() {
  try {
    return Session.getScriptTimeZone() || 'Europe/Madrid';
  } catch (e) {
    return 'Europe/Madrid';
  }
}

function asBoolean_(value, defaultValue) {
  if (value === true || value === false) return value;

  const v = normalize_(value);
  if (['TRUE', 'VERDADERO', 'SI', 'SÍ', '1'].includes(v)) return true;
  if (['FALSE', 'FALSO', 'NO', '0'].includes(v)) return false;

  return defaultValue;
}

function sanitizeId_(value) {
  return String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, '_')
    .slice(0, 100);
}

function uniqueId_(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}


function normalizePause_(value) {
  if (value === null || value === undefined || value === '') return '00:00';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, getAppTimeZone_(), 'HH:mm');
  }

  const v = String(value).trim();
  if (!v) return '00:00';

  const m = v.match(/(\d{1,2})[:.,](\d{1,2})/);
  if (!m) return '00:00';

  const hours = Math.max(0, Number(m[1]) || 0);
  const minutes = Math.max(0, Math.min(59, Number(m[2]) || 0));

  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

function normalizeOptionalPause_(value) {
  if (value === null || value === undefined || value === '') return '';
  return normalizePause_(value);
}

function normalizeDietCount_(value) {
  if (value === null || value === undefined || value === '') return 0;

  if (typeof value === 'number' && isFinite(value)) {
    // Si Sheets lo guarda como fracción de día (1:00 => 1/24), recuperamos la hora.
    if (value > 0 && value < 1) return Math.max(0, Math.round(value * 24));
    return Math.max(0, Math.round(value));
  }

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Number(Utilities.formatDate(value, getAppTimeZone_(), 'H')) || 0;
  }

  const v = String(value).trim();
  if (!v) return 0;

  const time = v.match(/^(\d{1,2})[:.,]\d{1,2}$/);
  if (time) return Math.max(0, Number(time[1]) || 0);

  const numeric = Number(v.replace(',', '.'));
  return isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
}

function normalizeOptionalDiet_(value) {
  if (value === null || value === undefined || value === '') return '';
  return normalizeDietCount_(value);
}

function normalizeRating_(value) {
  const n = Number(value || 0);
  if (!isFinite(n) || n <= 0) return 0;
  return Math.max(1, Math.min(5, Math.round(n)));
}


function assertServiceOpen_(db, code) {
  const found = findObjectRow_(db.getSheetByName(SHEET_SERVICES), 'CODE', code);
  if (!found) throw new Error('No existe el servicio ' + code + '.');
  if (asBoolean_(found.object.CLOSED, false)) {
    throw new Error('El servicio está cerrado. Reábrelo si necesitas hacer cambios.');
  }
}

function normalizeIncidentCategory_(value) {
  const v = normalize_(value);
  const allowed = [
    'RETRASO', 'UNIFORMIDAD', 'ACTITUD', 'SEGURIDAD',
    'AUSENCIA', 'DANOS', 'DAÑOS',
    'CAMBIO CATEGORIA', 'OTRO'
  ];
  if (v === 'DANOS') return 'DAÑOS';
  if (v === 'CAMBIO DE CATEGORIA') return 'CAMBIO CATEGORIA';
  return allowed.includes(v) ? v : 'OTRO';
}

function normalizeIncidentSeverity_(value) {
  const v = normalize_(value);
  if (v === 'GRAVE') return 'GRAVE';
  if (v === 'MEDIA') return 'MEDIA';
  return 'LEVE';
}

function normalizeIncidentStatus_(value) {
  const v = normalize_(value);
  return v === 'RESUELTA' || v === 'RESUELTO' ? 'RESUELTA' : 'ABIERTA';
}

function mapIncident_(r) {
  return {
    id: String(r.INCIDENT_ID || ''),
    workerId: String(r.WORKER_ID || ''),
    personal: String(r.PERSONAL || ''),
    serviceDate: normalizeDate_(r.SERVICE_DATE),
    trabajo: String(r.TRABAJO || ''),
    createdAt: dateToIso_(r.CREATED_AT),
    category: normalizeIncidentCategory_(r.CATEGORY),
    severity: normalizeIncidentSeverity_(r.SEVERITY),
    oldCategory: String(r.OLD_CATEGORY || ''),
    newCategory: String(r.NEW_CATEGORY || ''),
    description: String(r.DESCRIPTION || ''),
    actionTaken: String(r.ACTION_TAKEN || ''),
    status: normalizeIncidentStatus_(r.STATUS)
  };
}

function readIncidents_(db, code) {
  return getDataObjects_(db.getSheetByName(SHEET_INCIDENTS))
    .filter(r => String(r.CODE || '') === code)
    .map(mapIncident_)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function readAudit_(db, code, limit) {
  limit = Math.max(1, Number(limit || 40));
  return getDataObjects_(db.getSheetByName(SHEET_AUDIT))
    .filter(r => String(r.CODE || '') === code)
    .map(r => ({
      id: String(r.EVENT_ID || ''),
      createdAt: dateToIso_(r.CREATED_AT),
      actor: String(r.ACTOR || ''),
      type: String(r.EVENT_TYPE || ''),
      workerId: String(r.WORKER_ID || ''),
      details: String(r.DETAILS || '')
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}

function logAudit_(db, code, eventType, workerId, details) {
  try {
    appendObjects_(db.getSheetByName(SHEET_AUDIT), AUDIT_HEADERS, [{
      CODE: code,
      EVENT_ID: uniqueId_('EVT'),
      CREATED_AT: new Date(),
      ACTOR: getActor_(),
      EVENT_TYPE: String(eventType || ''),
      WORKER_ID: String(workerId || ''),
      DETAILS: JSON.stringify(details || {})
    }]);
  } catch (e) {
    // El registro de auditoría nunca debe bloquear la operación principal.
  }
}

function getActor_() {
  try {
    return Session.getActiveUser().getEmail() || 'APP';
  } catch (e) {
    return 'APP';
  }
}

function timeToMinutes_(value) {
  const v = normalizeTime_(value);
  const m = String(v || '').match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function pauseToMinutes_(value) {
  const v = normalizePause_(value);
  const m = String(v || '').match(/^(\d{2}):(\d{2})$/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

function calculateWorkedMinutes_(start, end, pause) {
  const s = timeToMinutes_(start);
  const e = timeToMinutes_(end);
  if (s === null || e === null) return 0;

  let duration = e - s;
  if (duration < 0) duration += 24 * 60;

  return Math.max(0, duration - pauseToMinutes_(pause));
}

function workedMinutesFromRaw_(m) {
  const start = m.actualStart || m.inicio;
  const end = m.actualEnd || m.fin;
  const pause = m.actualPause || m.pausa || '00:00';
  return calculateWorkedMinutes_(start, end, pause);
}

function dateKey_(value) {
  const v = normalizeDate_(value);
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return 0;
  return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
}

function formatMinutesHuman_(minutes) {
  const n = Number(minutes || 0);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return sign + h + 'h ' + String(m).padStart(2, '0') + 'm';
}

function safeFileName_(value) {
  return String(value || 'servicio')
    .replace(/[\\/:*?"<>|#%{}\[\]]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateFinalServicePdf_(db, code) {
  const service = loadService_(db, code);
  const folder = DriveApp.getFolderById(DESTINATION_FOLDER_ID);

  const teams = {};
  service.teams.forEach(t => teams[t.id] = t);

  const incidentsByWorker = {};
  (service.incidents || []).forEach(i => {
    if (!incidentsByWorker[i.workerId]) incidentsByWorker[i.workerId] = [];
    incidentsByWorker[i.workerId].push(i);
  });

  const logoHtml = getFastPdfLogoHtml_();
  const days = [...new Set(service.workers.map(w => w.serviceDate || 'SIN FECHA'))]
    .sort((a, b) => dateKey_(a) - dateKey_(b));

  let bodyHtml = `
    <header class="top">
      <div>
        <div class="orange-title">LLAMADAS PERSONAL - CIERRE</div>
        <div class="service-code">SERVICIO ${escapePdfHtml_(code)}</div>
      </div>
      <div class="logo">${logoHtml}</div>
    </header>

    <table class="info">
      <tr>
        <th>REFERENCIA</th><td>${escapePdfHtml_(service.serviceName || '')}</td>
        <th>FECHA</th><td>${escapePdfHtml_(service.serviceDate || '')}</td>
      </tr>
      <tr>
        <th>RECINTO</th><td>${escapePdfHtml_(service.venue || '')}</td>
        <th>CÓDIGO</th><td>${escapePdfHtml_(code)}</td>
      </tr>
    </table>
  `;

  days.forEach(day => {
    const dayWorkers = service.workers.filter(
      w => (w.serviceDate || 'SIN FECHA') === day && w.included
    );
    const workTypes = [...new Set(dayWorkers.map(w => w.trabajo || 'SIN TIPO'))];

    bodyHtml += `<h2>${escapePdfHtml_(day)}</h2>`;

    workTypes.forEach(work => {
      const rows = dayWorkers.filter(w => (w.trabajo || 'SIN TIPO') === work);

      bodyHtml += `<h3>TRABAJO: ${escapePdfHtml_(work)}</h3>`;

      const staffingRequirements = (service.requirements || []).filter(r =>
        r.serviceDate === day && normalize_(r.trabajo) === normalize_(work)
      );

      if (staffingRequirements.length) {
        bodyHtml += `
          <table class="staffing">
            <thead>
              <tr><th>EQUIPO</th><th>NECESARIOS</th><th>ASIGNADOS</th><th>PRESENTES</th></tr>
            </thead>
            <tbody>
        `;

        staffingRequirements.forEach(req => {
          const team = teams[req.teamId];
          if (!team) return;
          const assigned = rows.filter(w => w.teamId === req.teamId).length;
          const presentCount = rows.filter(
            w => w.teamId === req.teamId && w.status === 'PRESENTE'
          ).length;

          bodyHtml += `
            <tr>
              <td>${escapePdfHtml_(team.name || '')}</td>
              <td>${Number(req.requiredCount || 0)}</td>
              <td>${assigned}</td>
              <td>${presentCount}</td>
            </tr>
          `;
        });

        bodyHtml += `</tbody></table>`;
      }

      bodyHtml += `
        <table class="personnel">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>ESPECIALIDAD</th>
              <th>EQUIPO</th>
              <th>H.LLAM.</th>
              <th>INICIO PDF</th>
              <th>FIN PDF</th>
              <th>INICIO REAL</th>
              <th>FIN REAL</th>
              <th>PAUSA</th>
              <th>DIETA</th>
              <th>CS</th>
              <th>MÓVIL</th>
              <th>ESTADO</th>
              <th>U/A/P</th>
              <th>INC.</th>
            </tr>
          </thead>
          <tbody>
      `;

      rows.forEach(w => {
        const teamName = teams[w.teamId] ? teams[w.teamId].name : '';
        const ratings = [
          Number(w.ratingUniformidad || 0),
          Number(w.ratingActitud || 0),
          Number(w.ratingPuntualidad || 0)
        ];
        const ratingText = ratings.some(v => v > 0)
          ? ratings.map(v => v > 0 ? String(v) : '-').join('/')
          : '';

        bodyHtml += `
          <tr>
            <td class="name">${escapePdfHtml_(w.personal || '')}</td>
            <td>${escapePdfHtml_(w.especialidad || '')}</td>
            <td>${escapePdfHtml_(teamName)}</td>
            <td>${escapePdfHtml_(w.hLlam || '')}</td>
            <td>${escapePdfHtml_(w.inicio || '')}</td>
            <td>${escapePdfHtml_(w.fin || '')}</td>
            <td>${escapePdfHtml_(w.actualStart || w.inicio || '')}</td>
            <td>${escapePdfHtml_(w.actualEnd || w.fin || '')}</td>
            <td>${escapePdfHtml_(w.actualPause || w.pausa || '00:00')}</td>
            <td>${escapePdfHtml_(
              String(w.actualDiet === '' || w.actualDiet === null ? w.nDieta : w.actualDiet)
            )}</td>
            <td>${w.isCoordinator ? 'X' : ''}</td>
            <td>${escapePdfHtml_(w.movil || '')}</td>
            <td>${escapePdfHtml_(w.status || '')}</td>
            <td>${escapePdfHtml_(ratingText)}</td>
            <td>${(incidentsByWorker[w.id] || []).length}</td>
          </tr>
        `;
      });

      bodyHtml += `</tbody></table>`;
    });
  });

  bodyHtml += `
    <div class="page-break"></div>
    <h2>RESUMEN DE HORAS</h2>
    <table class="summary">
      <thead><tr><th>NOMBRE</th><th>PREVISTAS</th><th>REALES</th><th>DIFERENCIA</th></tr></thead>
      <tbody>
  `;

  service.workers.filter(w => w.included).forEach(w => {
    bodyHtml += `
      <tr>
        <td class="name">${escapePdfHtml_(w.personal || '')}</td>
        <td>${escapePdfHtml_(formatMinutesHuman_(w.plannedMinutes))}</td>
        <td>${escapePdfHtml_(formatMinutesHuman_(w.actualMinutes))}</td>
        <td>${escapePdfHtml_(formatMinutesHuman_(w.overtimeMinutes))}</td>
      </tr>
    `;
  });

  bodyHtml += `</tbody></table><h2>INCIDENCIAS</h2>
    <table class="summary">
      <thead>
        <tr>
          <th>FECHA</th><th>TRABAJADOR</th><th>TIPO</th><th>GRAVEDAD</th>
          <th>DESCRIPCIÓN</th><th>MEDIDA</th><th>ESTADO</th>
        </tr>
      </thead><tbody>`;

  if ((service.incidents || []).length) {
    service.incidents.forEach(i => {
      bodyHtml += `
        <tr>
          <td>${escapePdfHtml_(i.serviceDate || '')}</td>
          <td class="name">${escapePdfHtml_(i.personal || '')}</td>
          <td>${escapePdfHtml_(i.category || '')}</td>
          <td>${escapePdfHtml_(i.severity || '')}</td>
          <td>${escapePdfHtml_(i.description || '')}</td>
          <td>${escapePdfHtml_(i.actionTaken || '')}</td>
          <td>${escapePdfHtml_(i.status || '')}</td>
        </tr>`;
    });
  } else {
    bodyHtml += `<tr><td colspan="7">Sin incidencias registradas</td></tr>`;
  }

  bodyHtml += `</tbody></table><h2>NOTAS / OBSERVACIONES</h2>
    <table class="summary">
      <thead><tr><th>TRABAJADOR</th><th>FECHA</th><th>TRABAJO</th><th>NOTA</th></tr></thead>
      <tbody>`;

  const notedWorkers = service.workers.filter(w => String(w.notes || '').trim());

  if (notedWorkers.length) {
    notedWorkers.forEach(w => {
      bodyHtml += `
        <tr>
          <td class="name">${escapePdfHtml_(w.personal || '')}</td>
          <td>${escapePdfHtml_(w.serviceDate || '')}</td>
          <td>${escapePdfHtml_(w.trabajo || '')}</td>
          <td>${escapePdfHtml_(w.notes || '')}</td>
        </tr>`;
    });
  } else {
    bodyHtml += `<tr><td colspan="4">Sin notas registradas</td></tr>`;
  }

  bodyHtml += `
      </tbody>
    </table>
    <p class="footer">
      Documento generado al cerrar el servicio ${escapePdfHtml_(code)}.
      Los horarios reales, pausas, dietas, valoraciones e incidencias reflejan
      el estado registrado en la app.
    </p>
  `;

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      @page { size: A4 landscape; margin: 8mm; }
      * { box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #111;
        margin: 0;
        font-size: 7px;
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #111;
        padding-bottom: 5px;
        margin-bottom: 7px;
      }
      .orange-title {
        color: #f58220;
        font-size: 13px;
        font-weight: 800;
      }
      .service-code { font-size: 8px; font-weight: 700; margin-top: 3px; }
      .logo img { height: 38px; max-width: 160px; object-fit: contain; }
      .logo-text { font-size: 16px; font-weight: 800; letter-spacing: 2px; }
      h2 {
        color: #f58220;
        font-size: 11px;
        margin: 10px 0 4px;
        page-break-after: avoid;
      }
      h3 {
        text-align: center;
        font-size: 8px;
        margin: 6px 0 2px;
        page-break-after: avoid;
      }
      table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
      th, td {
        border: .5px solid #555;
        padding: 2.2px 3px;
        vertical-align: top;
      }
      th { background: #ededed; font-weight: 800; white-space: nowrap; }
      .info th { width: 9%; }
      .info td { width: 41%; font-size: 8px; }
      .personnel { font-size: 5.7px; page-break-inside: auto; }
      .personnel tr { page-break-inside: avoid; page-break-after: auto; }
      .personnel .name, .summary .name { font-weight: 700; }
      .staffing {
        width: 52%;
        margin: 2px 0 5px auto;
        font-size: 6px;
      }
      .summary { font-size: 6.3px; }
      .page-break { page-break-before: always; }
      .footer { margin-top: 8px; color: #666; font-size: 6px; }
    </style>
  </head>
  <body>${bodyHtml}</body>
  </html>`;

  const pdfName = safeFileName_(
    'CIERRE_' + code + '_' + (service.serviceName || 'SERVICIO')
  ) + '.pdf';

  // Conversión en un único paso. Evita cientos de llamadas a DocumentApp.
  const htmlBlob = Utilities.newBlob(html, 'text/html', 'cierre_' + code + '.html');
  const pdfBlob = htmlBlob.getAs(MimeType.PDF).setName(pdfName);
  const pdfFile = folder.createFile(pdfBlob);
  pdfFile.setDescription('Cierre final del servicio ' + code);

  return {
    fileId: pdfFile.getId(),
    url: pdfFile.getUrl(),
    name: pdfFile.getName()
  };
}

function getFastPdfLogoHtml_() {
  return '<span class="logo-text">CREW CONTROL</span>';
}

function escapePdfHtml_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function styleInfoTable_(table) {
  try {
    table.setBorderWidth(0.5);
    for (let r = 0; r < table.getNumRows(); r++) {
      for (let c = 0; c < table.getRow(r).getNumCells(); c++) {
        const cell = table.getCell(r, c);
        cell.editAsText().setFontSize(7);
        if (c % 2 === 0) {
          cell.setBackgroundColor('#F3F3F3');
          cell.editAsText().setBold(true);
        }
      }
    }
  } catch (e) {}
}

function stylePersonnelTable_(table) {
  try {
    table.setBorderWidth(0.4);
    for (let r = 0; r < table.getNumRows(); r++) {
      const row = table.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        cell.editAsText().setFontSize(r === 0 ? 6 : 5);
        if (r === 0) {
          cell.setBackgroundColor('#E9E9E9');
          cell.editAsText().setBold(true);
        }
      }
    }
  } catch (e) {}
}

function dateToIso_(value) {
  if (!value) return '';
  try { return new Date(value).toISOString(); }
  catch (e) { return ''; }
}
