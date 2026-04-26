/* =========================================
  PAGE TRANSITIONS — CROSS-PAGE NAVIGATION
========================================= */
function navigateWithTransition(url) {
  var overlay = document.getElementById('pageTransOverlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(function() { window.location.href = url; }, 350);
  } else {
    window.location.href = url;
  }
}

/* On page load - fade in from transition */
window.addEventListener('load', function() {
  var overlay = document.getElementById('pageTransOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
});

/* =========================================
  PAGE TRANSITIONS
========================================= */
function smoothNav(pageId) {
  var container = document.getElementById('pageContainer');
  if (container) container.classList.add('page-fade-out');
  setTimeout(function() {
    showPage(pageId);
    if (container) {
      container.classList.remove('page-fade-out');
      container.classList.add('page-fade-in');
      setTimeout(function(){ container.classList.remove('page-fade-in'); }, 400);
    }
  }, 250);
}

function smoothNavAnchor(anchorId) {
  var homePage = document.getElementById('home');
  if (!homePage || homePage.style.display === 'none') {
    smoothNav('home');
    setTimeout(function() {
      var el = document.getElementById(anchorId);
      if (el) { var top = el.getBoundingClientRect().top + window.pageYOffset - 90; window.scrollTo({ top: top, behavior: 'smooth' }); }
    }, 500);
  } else {
    var el = document.getElementById(anchorId);
    if (el) { var top = el.getBoundingClientRect().top + window.pageYOffset - 90; window.scrollTo({ top: top, behavior: 'smooth' }); }
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(function(p){ p.style.display = 'none'; });
  var page = document.getElementById(pageId);
  if (page) page.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  var header = document.getElementById('mainHeader');
  var mainNav = document.getElementById('mainNav');
  var headerButtons = document.getElementById('headerButtons');

  if (pageId === 'dashboard') {
    if (header) header.style.display = 'none';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('dashboard-active');
    initResidentDashboard();
  } else if (pageId === 'login') {
    if (header) header.style.display = 'none';
    document.body.style.overflow = '';
    document.body.classList.remove('dashboard-active');
  } else {
    if (header) header.style.display = 'flex';
    document.body.style.overflow = '';
    document.body.classList.remove('dashboard-active');
    if (mainNav) mainNav.style.display = 'flex';
    if (headerButtons) headerButtons.style.display = 'flex';
  }
}

function initResidentDashboard() {
  document.querySelectorAll('.res-section').forEach(function(el){ el.style.display = 'none'; });
  var home = document.getElementById('res-home');
  if (home) { home.style.display = 'block'; home.classList.add('section-enter'); }
  document.querySelectorAll('.dash-btn').forEach(function(b){ b.classList.remove('active'); });
  var firstBtn = document.querySelector('.dash-btn');
  if (firstBtn) firstBtn.classList.add('active');
  loadProjectMonitoring();
  loadHomeNotifications();
  loadHomeLatestUpdates();
  loadHomeAdminMessages();
  updateNotifBell();
  loadHomeRequestWidget();
  loadMyCourtRequests();

  // Set date in resident inner header
  var dateEl = document.getElementById('residentDashDate');
  if (dateEl) {
    var d = new Date();
    dateEl.textContent = d.toLocaleDateString('en-PH', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  }
  // Update subtitle with resident name
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (user) {
    var sub = document.getElementById('residentDashSubtitle');
    if (sub) sub.textContent = 'Logged in as: ' + getFullName(user) + ' · ID: ' + user.userId;
  }
}

function loadHomeRequestWidget() {
  var el = document.getElementById('homeRequestWidget');
  if (!el) return;
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var all  = getData('clearanceRequests');
  var mine = all.filter(function(r){ return user && r.requestedBy === user.userId; }).slice(-3).reverse();
  if (mine.length === 0) {
    el.innerHTML = '<p style="color:#888;font-size:14px;">No requests yet. <a href="#" onclick="showResidentSection(\'res-documents\',document.querySelectorAll(\'.dash-btn\')[3]);return false;" style="color:var(--blue);">Request a document</a></p>';
    return;
  }
  var html = '';
  mine.forEach(function(r) {
    var cls = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending';
    var badgeColor = r.status === 'Approved' ? '#2ecc71' : r.status === 'Rejected' ? '#e74c3c' : '#f39c12';
    var icon = r.status === 'Approved' ? 'fa-circle-check' : r.status === 'Rejected' ? 'fa-circle-xmark' : 'fa-clock';
    html += '<div class="home-req-card">';
    html += '<div class="home-req-card-top">';
    html += '<div class="home-req-card-info">';
    html += '<i class="fa-solid fa-file-lines" style="color:var(--blue);margin-right:8px;"></i>';
    html += '<strong>' + esc(r.docType || 'Document') + '</strong>';
    html += '</div>';
    html += '<span class="home-req-badge" style="background:' + badgeColor + '20;color:' + badgeColor + ';border:1px solid ' + badgeColor + '40;">';
    html += '<i class="fa-solid ' + icon + '"></i> ' + r.status + '</span>';
    html += '</div>';
    html += '<div class="home-req-card-meta">';
    html += '<span><i class="fa-solid fa-calendar" style="color:#aaa;margin-right:4px;"></i>' + (r.date || '—') + '</span>';
    html += '<span><i class="fa-solid fa-bullseye" style="color:#aaa;margin-right:4px;"></i>' + esc(r.purpose || '') + '</span>';
    html += '</div>';
    if (r.status === 'Approved') {
      html += '<button class="home-download-btn" onclick="showResidentSection(\'res-myrequests\',document.querySelectorAll(\'.dash-btn\')[4]);return false;">';
      html += '<i class="fa-solid fa-download"></i> Download Docs</button>';
    }
    if (r.status === 'Rejected' && r.adminNote) {
      html += '<div class="home-req-admin-note"><i class="fa-solid fa-comment" style="color:var(--orange);margin-right:6px;"></i>' + esc(r.adminNote) + '</div>';
    }
    html += '</div>';
  });
  el.innerHTML = html;
}

/* =========================================
  STORAGE
========================================= */
function getData(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function showAlert(id, msg, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert alert-' + (type || 'success') + ' show';
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function(){ el.classList.remove('show'); el.style.display = 'none'; }, 5000);
}

/* =========================================
  TOAST NOTIFICATION — centered popup
========================================= */
function showToast(msg, type) {
  type = type || 'success';
  var existing = document.getElementById('globalToast');
  if (existing) existing.remove();

  var icon = type === 'success'
    ? '<i class="fa-solid fa-circle-check" style="color:#2ecc71;font-size:1.3rem;flex-shrink:0;"></i>'
    : '<i class="fa-solid fa-circle-xmark" style="color:#e74c3c;font-size:1.3rem;flex-shrink:0;"></i>';

  var toast = document.createElement('div');
  toast.id = 'globalToast';
  toast.style.cssText = [
    'position:fixed',
    'bottom:36px',
    'left:50%',
    'transform:translateX(-50%) translateY(20px)',
    'background:#fff',
    'border-radius:14px',
    'box-shadow:0 8px 40px rgba(0,0,0,0.18)',
    'padding:16px 24px',
    'display:flex',
    'align-items:center',
    'gap:12px',
    'z-index:99999',
    'min-width:280px',
    'max-width:480px',
    'font-family:Poppins,sans-serif',
    'font-size:14px',
    'color:#222',
    'border-left:4px solid ' + (type === 'success' ? '#2ecc71' : '#e74c3c'),
    'opacity:0',
    'transition:opacity .3s ease, transform .3s ease'
  ].join(';');
  toast.innerHTML = icon + '<span style="flex:1;line-height:1.4;">' + msg + '</span>'
    + '<button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#aaa;font-size:16px;padding:0 0 0 8px;line-height:1;">&times;</button>';

  document.body.appendChild(toast);
  // Animate in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });
  // Auto remove
  setTimeout(function() {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function(){ if (toast.parentElement) toast.remove(); }, 350);
    }
  }, 4500);
}

/* =========================================
  HELPER: GET SURNAME
========================================= */
function getSurname(r) {
  if (r.familyName) return r.familyName.toLowerCase();
  if (r.name) {
    var n = r.name;
    return n.indexOf(',') !== -1 ? n.split(',')[0].trim().toLowerCase() : n.split(' ')[0].toLowerCase();
  }
  return '';
}

function getFullName(r) {
  if (r.familyName) {
    var n = r.familyName;
    if (r.firstName) n += ', ' + r.firstName;
    if (r.middleName) n += ' ' + r.middleName;
    if (r.extName) n += ' ' + r.extName;
    return n;
  }
  return r.name || '—';
}

/* =========================================
  ADMIN: REGISTER RESIDENT
========================================= */
function adminRegisterResident() {
  var familyName  = document.getElementById('regFamilyName').value.trim();
  var firstName   = document.getElementById('regFirstName').value.trim();
  var middleName  = document.getElementById('regMiddleName').value.trim();
  var extName     = document.getElementById('regExtName').value.trim();
  var sex         = document.getElementById('regSex').value;
  var address     = document.getElementById('regAddress').value.trim();

  // Reset error states
  ['regFamilyName','regFirstName','regSex','regAddress'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.border = ''; el.style.boxShadow = ''; }
  });

  var hasError = false;
  var errorFields = [];
  if (!familyName) { errorFields.push('regFamilyName'); hasError = true; }
  if (!firstName)  { errorFields.push('regFirstName');  hasError = true; }
  if (!sex)        { errorFields.push('regSex');         hasError = true; }
  if (!address)    { errorFields.push('regAddress');     hasError = true; }

  if (hasError) {
    errorFields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.border = '1.5px solid #e74c3c';
        el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.15)';
      }
    });
    showAlert('admin-reg-alert', 'Please fill in all required fields highlighted in red.', 'error');
    // Scroll to first error
    var first = document.getElementById(errorFields[0]);
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  var residents = getData('residents');
  var nextId = 14001;
  if (residents.length > 0) {
    var ids = residents.map(function(r){ return parseInt(r.userId) || 0; });
    nextId = Math.max(14001, Math.max.apply(null, ids) + 1);
  }

  var userId   = String(nextId);
  var lastTwo  = userId.slice(-2);
  var fnCap    = familyName.charAt(0).toUpperCase() + familyName.slice(1).toLowerCase();
  var fnLow    = firstName.toLowerCase();
  var mnLow    = middleName ? middleName.toLowerCase() : '';
  var password = mnLow
    ? fnCap + '.' + fnLow + '.' + mnLow + lastTwo
    : fnCap + '.' + fnLow + lastTwo;

  residents.push({ userId: userId, familyName: familyName, firstName: firstName, middleName: middleName, extName: extName, sex: sex, address: address, password: password, name: familyName + ', ' + firstName });
  setData('residents', residents);

  showAlert('admin-reg-alert', 'Account created! ID: ' + userId + ' | Default Password: ' + password, 'success');
  document.getElementById('regFamilyName').value = '';
  document.getElementById('regFirstName').value = '';
  document.getElementById('regMiddleName').value = '';
  document.getElementById('regExtName').value = '';
  document.getElementById('regSex').value = '';
  document.getElementById('regAddress').value = '';
}

/* =========================================
  RESIDENT LOGIN / LOGOUT
========================================= */
function residentLogin() {
  var userId   = document.getElementById('loginUsername').value.trim();
  var password = document.getElementById('loginPassword').value.trim();
  var residents = getData('residents');
  var user = null;
  for (var i = 0; i < residents.length; i++) {
    if (residents[i].userId === userId && residents[i].password === password) { user = residents[i]; break; }
  }
  if (!user) return showAlert('login-alert', 'Invalid ID or password.', 'error');

  // IDENTITY VERIFICATION REMOVED - Proceed directly to login with correct credentials
  doLoginUser(user, true);
}

var _pendingLoginUser = null;

/* Fixed set of 15 security questions — users must answer ALL of them */
var SECURITY_QUESTIONS = [
  'What is your favorite food?',
  'What is your favorite color?',
  'What is the name of the street you grew up on?',
  'What is the name of your first school?',
  'What is the name of your first pet?',
  'What is your childhood nickname?',
  'What is the full name of your closest childhood friend?',
  'What is the name of your favorite teacher?',
  'What is the nickname only your family calls you?',
  'What is the name of your favorite childhood cartoon?',
  'What is your favorite movie?',
  'What is a dream destination you have always wanted to visit?',
  'What is the name of your best friend from childhood?',
  'What is your favorite sports team?',
  'What is your most memorable childhood birthday wish?'
];

function showVerificationModal(user) {
  // Pick 1 random question from all 15 stored answers
  var available = [];
  for (var i = 1; i <= 15; i++) {
    var k = 'secQ' + i;
    if (user[k]) available.push({ key: k, label: SECURITY_QUESTIONS[i - 1] });
  }
  if (!available.length) return;
  var pick = available[Math.floor(Math.random() * available.length)];
  _verifyKey = pick.key;
  _verifyExpected = (user[pick.key] || '').toLowerCase().trim();

  var overlay = document.getElementById('verifyOverlay');
  var labelEl = document.getElementById('verifyQuestionLabel');
  var answerEl = document.getElementById('verifyAnswer');
  if (labelEl) labelEl.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#1e73be;margin-right:8px;"></i>' + pick.label;
  if (answerEl) { answerEl.value = ''; }
  if (overlay) { overlay.style.display = 'flex'; }
}

var _verifyKey = '';
var _verifyExpected = '';
var _verifyAttempts = 0;

function submitVerification() {
  var answer = (document.getElementById('verifyAnswer').value || '').toLowerCase().trim();
  if (!answer) return showAlert('verify-alert', 'Please type your answer.', 'error');
  if (answer === _verifyExpected) {
    _verifyAttempts = 0;
    closeVerifyModal();
    doLoginUser(_pendingLoginUser, false);
    _pendingLoginUser = null;
  } else {
    _verifyAttempts++;
    if (_verifyAttempts >= 3) {
      _verifyAttempts = 0;
      closeVerifyModal();
      showAlert('login-alert', 'Too many incorrect attempts. Please try again later.', 'error');
      _pendingLoginUser = null;
    } else {
      showAlert('verify-alert', 'Incorrect answer. Please try again.', 'error');
    }
  }
}

function cancelVerification() {
  closeVerifyModal();
  _pendingLoginUser = null;
}

function closeVerifyModal() {
  var overlay = document.getElementById('verifyOverlay');
  if (overlay) overlay.style.display = 'none';
}

function doLoginUser(user, isNew) {
  sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  var welcomeEl = document.getElementById('welcomeUser');
  var welcomeInner = document.getElementById('welcomeUserInner');
  var welcomeSub = document.getElementById('welcomeUserSub');
  var displayName = user.firstName ? user.firstName : getFullName(user);
  if (welcomeEl) welcomeEl.textContent = getFullName(user);
  if (welcomeInner) welcomeInner.textContent = displayName;
  if (welcomeSub) welcomeSub.textContent = getFullName(user) + ' (ID: ' + user.userId + ')';
  updateAvatarDisplay(user);

  // Only show tutorial if the resident has never set security questions yet
  var hasSetupAccount = (function() {
    for (var i = 1; i <= 15; i++) { if (!user['secQ' + i]) return false; }
    return true;
  })();
  if (isNew && !hasSetupAccount) {
    // First-time login: show tutorial to set security questions
    showTutorialModal();
  } else {
    // Returning user (or already completed setup): go straight to dashboard
    smoothNav('dashboard');
  }
}

/* =========================================
  FORGOT PASSWORD FUNCTIONALITY - SIMPLIFIED
========================================= */
var _fpCurrentUser = null;
var _fpCurrentQuestion = null;
var _fpAttempts = 0;

function showForgotPasswordModal() {
  var overlay = document.getElementById('forgotPasswordOverlay');
  if (overlay) overlay.style.display = 'block';
  document.getElementById('fpName').value = '';
  document.getElementById('fpNewPassword').value = '';
  document.getElementById('fpConfirmPassword').value = '';
  fpShowStep(1);
}

function closeForgotPasswordModal() {
  var overlay = document.getElementById('forgotPasswordOverlay');
  if (overlay) overlay.style.display = 'none';
  _fpCurrentUser = null;
  _fpCurrentQuestion = null;
  _fpAttempts = 0;
  // Clear all 15 answer fields
  for (var _ci = 1; _ci <= 15; _ci++) {
    var _cel = document.getElementById('fpAns' + _ci);
    if (_cel) { _cel.value = ''; _cel.style.border = ''; }
  }
}

function fpShowStep(step) {
  document.querySelectorAll('.fp-step').forEach(function(el){ el.style.display = 'none'; });
  var stepEl = document.getElementById('fpStep' + step) || document.getElementById('fpStep' + step.toString().toUpperCase());
  if (!stepEl && step === 'err') stepEl = document.getElementById('fpStepErr');
  if (stepEl) stepEl.style.display = 'block';
}

function fpFindResident() {
  var name = (document.getElementById('fpName').value || '').trim();
  if (!name) return showAlert('fp-alert', 'Please enter your full name.', 'error');

  var residents = getData('residents');
  var matches = [];

  var nameLower = name.toLowerCase();
  for (var i = 0; i < residents.length; i++) {
    var r = residents[i];
    var fullName1 = ((r.familyName || '') + ' ' + (r.firstName || '')).toLowerCase();
    var fullName2 = ((r.firstName || '') + ' ' + (r.familyName || '')).toLowerCase();
    var nameField = (r.name || '').toLowerCase();
    if (fullName1.includes(nameLower) || fullName2.includes(nameLower) || nameField.includes(nameLower)) {
      matches.push(r);
    }
  }

  if (matches.length === 0) {
    return showAlert('fp-alert', 'Name not found in resident records. Please check and try again.', 'error');
  }

  if (matches.length === 1) {
    fpProceedWithResident(matches[0]);
  } else {
    // Multiple matches — show selection step
    var list = document.getElementById('fpNameList');
    list.innerHTML = '';
    matches.forEach(function(r, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fp-name-option';
      btn.innerHTML = '<i class="fa-solid fa-user" style="color:#1e73be;margin-right:10px;"></i>' + esc(getFullName(r));
      btn.onclick = (function(resident) {
        return function() { fpSelectResident(resident); };
      })(r);
      list.appendChild(btn);
    });
    document.getElementById('fpMatchCount').textContent = matches.length + ' accounts found with that name. Select yours:';
    fpShowStep('select');
  }
}

function fpSelectResident(r) {
  fpProceedWithResident(r);
}

function fpProceedWithResident(found) {
  // Require all 15 security questions to have been set up
  var allSet = true;
  for (var i = 1; i <= 15; i++) { if (!found['secQ' + i]) { allSet = false; break; } }
  if (!allSet) {
    document.getElementById('fpFoundNameErr').textContent = getFullName(found);
    document.getElementById('fpFoundIdErr').textContent = '—';
    fpShowStep('err');
    return;
  }

  _fpCurrentUser = found;
  // Show name only — NO ID until after verification
  document.getElementById('fpFoundName').textContent = getFullName(found);
  document.getElementById('fpFoundId').textContent = '••••••';

  // Clear all 15 answer fields
  for (var j = 1; j <= 15; j++) {
    var el = document.getElementById('fpAns' + j);
    if (el) { el.value = ''; el.style.border = ''; }
  }
  _fpAttempts = 0;
  fpShowStep(2);
}

function fpVerifyQuestion() {
  var missing = false;
  var wrong   = false;
  for (var i = 1; i <= 15; i++) {
    var el = document.getElementById('fpAns' + i);
    var ans = el ? (el.value || '').toLowerCase().trim() : '';
    var exp = (_fpCurrentUser['secQ' + i] || '').toLowerCase().trim();
    if (!ans) {
      if (el) el.style.border = '1.5px solid #e74c3c';
      missing = true;
    } else {
      if (el) el.style.border = '';
    }
    if (ans && ans !== exp) {
      if (el) el.style.border = '1.5px solid #e74c3c';
      wrong = true;
    }
  }

  if (missing) return showAlert('fp-alert-q', 'Please answer all 15 security questions.', 'error');

  if (!wrong) {
    _fpAttempts = 0;
    document.getElementById('fpFoundId').textContent = _fpCurrentUser.userId;
    fpShowStep(3);
    document.getElementById('fpNewPassword').focus();
  } else {
    _fpAttempts++;
    if (_fpAttempts >= 3) {
      _fpAttempts = 0;
      _fpCurrentUser = null;
      closeForgotPasswordModal();
      showAlert('login-alert', 'Too many incorrect attempts. Please try again later.', 'error');
    } else {
      showAlert('fp-alert-q', 'One or more answers are incorrect (highlighted in red). ' + (3 - _fpAttempts) + ' attempt(s) remaining.', 'error');
    }
  }
}


function fpBackToName() {
  document.getElementById('fpName').value = '';
  for (var _i = 1; _i <= 15; _i++) {
    var _el = document.getElementById('fpAns' + _i);
    if (_el) { _el.value = ''; _el.style.border = ''; }
  }
  var list = document.getElementById('fpNameList');
  if (list) list.innerHTML = '';
  _fpCurrentUser = null;
  _fpCurrentQuestion = null;
  _fpAttempts = 0;
  fpShowStep(1);
}

/* Password strength checker for reset modal */
function fpCheckStrength(pw) {
  var bars = ['fpBar1','fpBar2','fpBar3','fpBar4'];
  var label = document.getElementById('fpStrengthLabel');
  var score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  var colors = ['#e74c3c','#f39c12','#3498db','#27ae60'];
  var labels = ['Weak','Fair','Good','Strong'];
  var labelColors = ['#e74c3c','#f39c12','#3498db','#27ae60'];

  bars.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.background = i < score ? colors[score - 1] : '#e0e0e0';
  });
  if (label) {
    if (!pw) { label.textContent = 'Enter a password'; label.style.color = '#aaa'; }
    else { label.textContent = labels[score - 1] || 'Weak'; label.style.color = labelColors[score - 1] || '#e74c3c'; }
  }
}

function fpResetPassword() {
  var newPw = document.getElementById('fpNewPassword').value;
  var confirmPw = document.getElementById('fpConfirmPassword').value;
  
  if (!newPw) return showAlert('fp-alert-pw', 'Please enter a new password.', 'error');
  if (newPw.length < 8) return showAlert('fp-alert-pw', 'Password must be at least 8 characters long.', 'error');
  if (!confirmPw) return showAlert('fp-alert-pw', 'Please confirm your password.', 'error');
  if (newPw !== confirmPw) return showAlert('fp-alert-pw', 'Passwords do not match.', 'error');
  
  // Update resident password
  var residents = getData('residents');
  for (var i = 0; i < residents.length; i++) {
    if (residents[i].userId === _fpCurrentUser.userId) {
      residents[i].password = newPw;
      break;
    }
  }
  setData('residents', residents);
  
  _fpCurrentUser = null;
  _fpCurrentQuestion = null;
  _fpAttempts = 0;
  fpShowStep(4);

}

function fpSuccessRedirect() {
  closeForgotPasswordModal();
  window.location.href = 'residents.html';
}

/* =========================================
  FORGOT USERNAME FUNCTIONALITY
========================================= */
// Not implemented in this simplified version

/* =========================================
  TUTORIAL MODAL FUNCTIONS
========================================= */
function showTutorialModal() {
  tutNext(1);
  var overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.style.display = 'block';
}

function tutNext(step) {
  document.querySelectorAll('.tut-step').forEach(function(el){ el.style.display = 'none'; });
  var s = document.getElementById('tut-step-' + step);
  if (s) s.style.display = 'block';
  // Update visual progress bar
  for (var i = 1; i <= 3; i++) {
    var prog = document.getElementById('tprog-' + i);
    if (!prog) continue;
    prog.classList.remove('active', 'done', 'pending');
    if (i < step) prog.classList.add('done');
    else if (i === step) prog.classList.add('active');
    else prog.classList.add('pending');
  }
  // Legacy dot support
  document.querySelectorAll('.tut-dot').forEach(function(el){ el.classList.remove('active'); });
  var d = document.getElementById('tdot-' + step);
  if (d) d.classList.add('active');
}

function tutFinish() {
  var missing = false;
  for (var i = 1; i <= 15; i++) {
    var el = document.getElementById('secQ' + i);
    if (!el || !(el.value || '').trim()) { missing = true; break; }
  }
  if (missing) {
    showAlert('tut-secq-alert', 'Please answer all 15 security questions before continuing.', 'error');
    return;
  }

  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (user) {
    for (var j = 1; j <= 15; j++) {
      var el = document.getElementById('secQ' + j);
      if (el) user['secQ' + j] = (el.value || '').trim().toLowerCase();
    }
    var residents = getData('residents');
    for (var k = 0; k < residents.length; k++) {
      if (residents[k].userId === user.userId) { residents[k] = user; break; }
    }
    setData('residents', residents);
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  var overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.style.display = 'none';
  smoothNav('dashboard');
}


function updateAvatarDisplay(user) {
  var letterEl = document.getElementById('residentAvatarLetter');
  var imgEl    = document.getElementById('residentAvatarImg');
  var previewEl = document.getElementById('profilePicPreview');
  var initial = (user.familyName || user.name || 'R').charAt(0).toUpperCase();

  if (letterEl) letterEl.textContent = initial;
  if (previewEl) {
    if (user.profilePic) {
      previewEl.innerHTML = '<img src="' + user.profilePic + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      previewEl.textContent = initial;
      previewEl.style.background = 'var(--blue)';
    }
  }
  if (imgEl && user.profilePic) {
    imgEl.src = user.profilePic;
    imgEl.style.display = 'block';
    if (letterEl) letterEl.style.display = 'none';
  }
}

function residentLogout() {
  sessionStorage.removeItem('loggedInUser');
  document.body.style.overflow = '';
  window.location.href = 'index.html';
}

/* =========================================
  ADMIN LOGIN / LOGOUT
  NOTE: adminLogin() is defined in admin.html to avoid overriding
  the showAdminDash() call. Only adminLogout is defined here.
========================================= */
function adminLogout() {
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
}

/* =========================================
  RESIDENTS: LOAD + SEARCH + FILTER
========================================= */

// Pagination state
var residentCurrentPage = 1;
var residentItemsPerPage = 15;
var residentFilteredData = [];

function loadAdminResidents() {
  var tbody = document.getElementById('residentTable');
  if (!tbody) return;
  var residents = getData('residents');
  // Update count banner
  var countEl = document.getElementById('residentCountNum');
  if (countEl) countEl.textContent = residents.length;
  residentCurrentPage = 1; // Reset to first page on load
  filterResidents(residents);
}

function filterResidents(residents) {
  var tbody = document.getElementById('residentTable');
  if (!tbody) return;
  if (!residents) residents = getData('residents');

  var searchVal  = (document.getElementById('residentSearch') || {}).value || '';
  var filterBy   = (document.getElementById('filterBy') || {}).value || 'all';
  var filterSex  = (document.getElementById('filterSex') || {}).value || '';
  var filterCivil = (document.getElementById('filterCivil') || {}).value || '';

  // Show/hide sex and civil dropdowns
  var sexEl = document.getElementById('filterSex');
  var civilEl = document.getElementById('filterCivil');
  if (sexEl) sexEl.style.display = filterBy === 'sex' ? 'block' : 'none';
  if (civilEl) civilEl.style.display = filterBy === 'civil' ? 'block' : 'none';

  var q = searchVal.toLowerCase();

  var filtered = residents.filter(function(r) {
    var matches = true;
    if (q) {
      if (filterBy === 'name') {
        matches = getSurname(r).includes(q) || getFullName(r).toLowerCase().includes(q);
      } else if (filterBy === 'userId') {
        matches = (r.userId || '').toLowerCase().includes(q);
      } else { // 'all' — search name AND userId
        matches = getSurname(r).includes(q) || getFullName(r).toLowerCase().includes(q) || (r.userId || '').toLowerCase().includes(q);
      }
    }
    if (filterBy === 'sex' && filterSex) matches = r.sex === filterSex;
    if (filterBy === 'civil' && filterCivil) matches = r.civilStatus === filterCivil;
    return matches;
  });

  // Sort by surname
  var indexed = filtered.map(function(r, i) {
    return { r: r, origIndex: residents.indexOf(r) };
  }).sort(function(a, b) {
    return getSurname(a.r) < getSurname(b.r) ? -1 : getSurname(a.r) > getSurname(b.r) ? 1 : 0;
  });

  // Store filtered data for pagination
  residentFilteredData = indexed;
  residentCurrentPage = 1; // Reset to first page on filter change

  if (indexed.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#888;">No residents found.</td></tr>';
    var paginationContainer = document.getElementById('residentPaginationContainer');
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  // Display first page
  displayResidentPage();
}

function displayResidentPage() {
  var tbody = document.getElementById('residentTable');
  if (!tbody) return;

  var startIndex = (residentCurrentPage - 1) * residentItemsPerPage;
  var endIndex = startIndex + residentItemsPerPage;
  var pageData = residentFilteredData.slice(startIndex, endIndex);

  var html = '';
  for (var i = 0; i < pageData.length; i++) {
    var item = pageData[i];
    var r = item.r;
    var oi = item.origIndex;
    var initial = (r.familyName || r.name || 'R').charAt(0).toUpperCase();
    var photoHtml = r.profilePic
      ? '<div class="resident-photo-cell"><img src="' + r.profilePic + '" class="resident-photo" alt="photo"></div>'
      : '<div class="resident-photo-cell"><div class="resident-photo-placeholder">' + initial + '</div></div>';
    html += '<tr>';
    html += '<td>' + photoHtml + '</td>';
    html += '<td>' + esc(r.userId || '—') + '</td>';
    html += '<td>' + esc(r.familyName || r.name || '—') + '</td>';
    html += '<td>' + esc(r.firstName || '—') + '</td>';
    html += '<td>' + esc(r.middleName || '—') + '</td>';
    html += '<td>' + esc(r.extName || '—') + '</td>';
    html += '<td>' + esc(r.sex || '—') + '</td>';
    html += '<td>' + esc(r.address || '—') + '</td>';
    html += '<td style="white-space:nowrap;">';
    html += '<button class="btn btn-secondary btn-sm" style="margin-right:4px;" data-edit="' + oi + '"><i class="fa-solid fa-pen"></i></button>';
    html += '<button class="btn btn-danger btn-sm" data-delete="' + oi + '"><i class="fa-solid fa-trash"></i></button>';
    html += '</td></tr>';
  }
  tbody.innerHTML = html;

  // Attach listeners
  tbody.querySelectorAll('[data-edit]').forEach(function(btn) {
    btn.addEventListener('click', function(){ openEditResident(parseInt(this.getAttribute('data-edit'))); });
  });
  tbody.querySelectorAll('[data-delete]').forEach(function(btn) {
    btn.addEventListener('click', function(){ deleteResidentByIndex(parseInt(this.getAttribute('data-delete'))); });
  });

  // Update pagination controls
  updatePaginationControls();
}

function updatePaginationControls() {
  var totalItems = residentFilteredData.length;
  var totalPages = Math.ceil(totalItems / residentItemsPerPage);
  var paginationContainer = document.getElementById('residentPaginationContainer');
  
  if (totalPages <= 1) {
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  if (paginationContainer) paginationContainer.style.display = 'block';

  var startNum = (residentCurrentPage - 1) * residentItemsPerPage + 1;
  var endNum = Math.min(residentCurrentPage * residentItemsPerPage, totalItems);

  document.getElementById('paginationStart').textContent = startNum;
  document.getElementById('paginationEnd').textContent = endNum;
  document.getElementById('paginationTotal').textContent = totalItems;

  // Update previous button
  var prevBtn = document.getElementById('prevPageBtn');
  if (prevBtn) {
    prevBtn.style.display = residentCurrentPage > 1 ? 'inline-block' : 'none';
  }

  // Update next button
  var nextBtn = document.getElementById('nextPageBtn');
  if (nextBtn) {
    nextBtn.style.display = residentCurrentPage < totalPages ? 'inline-block' : 'none';
  }

  // Generate page numbers
  var numbersContainer = document.getElementById('paginationNumbers');
  if (numbersContainer) {
    numbersContainer.innerHTML = '';
    
    var startPage = Math.max(1, residentCurrentPage - 2);
    var endPage = Math.min(totalPages, residentCurrentPage + 2);

    if (startPage > 1) {
      var firstPageBtn = document.createElement('button');
      firstPageBtn.className = 'btn btn-secondary btn-sm';
      firstPageBtn.textContent = '1';
      firstPageBtn.onclick = function() { goToPage(1); };
      numbersContainer.appendChild(firstPageBtn);

      if (startPage > 2) {
        var dots = document.createElement('span');
        dots.style.padding = '0 4px';
        dots.textContent = '...';
        numbersContainer.appendChild(dots);
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      var pageBtn = document.createElement('button');
      pageBtn.className = 'btn btn-secondary btn-sm';
      if (i === residentCurrentPage) {
        pageBtn.style.backgroundColor = 'var(--blue)';
        pageBtn.style.color = '#fff';
        pageBtn.style.borderColor = 'var(--blue)';
      }
      pageBtn.textContent = i;
      pageBtn.onclick = (function(pageNum) {
        return function() { goToPage(pageNum); };
      })(i);
      numbersContainer.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        var dots2 = document.createElement('span');
        dots2.style.padding = '0 4px';
        dots2.textContent = '...';
        numbersContainer.appendChild(dots2);
      }

      var lastPageBtn = document.createElement('button');
      lastPageBtn.className = 'btn btn-secondary btn-sm';
      lastPageBtn.textContent = totalPages;
      lastPageBtn.onclick = function() { goToPage(totalPages); };
      numbersContainer.appendChild(lastPageBtn);
    }
  }
}

function goToPage(pageNum) {
  var totalPages = Math.ceil(residentFilteredData.length / residentItemsPerPage);
  if (pageNum >= 1 && pageNum <= totalPages) {
    residentCurrentPage = pageNum;
    displayResidentPage();
  }
}

function goToPreviousPage() {
  if (residentCurrentPage > 1) {
    residentCurrentPage--;
    displayResidentPage();
  }
}

function goToNextPage() {
  var totalPages = Math.ceil(residentFilteredData.length / residentItemsPerPage);
  if (residentCurrentPage < totalPages) {
    residentCurrentPage++;
    displayResidentPage();
  }
}

function calcAge(birthday) {
  var today = new Date();
  var birth = new Date(birthday);
  var age = today.getFullYear() - birth.getFullYear();
  var m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function deleteResidentByIndex(index) {
  if (!confirm('Are you sure you want to delete this resident?')) return;
  var residents = getData('residents');
  residents.splice(index, 1);
  setData('residents', residents);
  loadAdminResidents();
}

function openEditResident(index) {
  var residents = getData('residents');
  var r = residents[index];
  if (!r) return;
  document.getElementById('editResidentIndex').value = index;
  document.getElementById('editAdminFamilyName').value = r.familyName || '';
  document.getElementById('editAdminFirstName').value  = r.firstName  || '';
  document.getElementById('editAdminMiddleName').value = r.middleName || '';
  document.getElementById('editAdminExtName').value    = r.extName    || '';
  document.getElementById('editAdminSex').value        = r.sex        || '';
  document.getElementById('editAdminAddress').value    = r.address    || '';
  document.getElementById('editAdminPassword').value   = '';

  // Show profile picture in admin edit view
  var preview = document.getElementById('adminEditPicPreview');
  if (preview) {
    var initial = (r.familyName || r.name || '?').charAt(0).toUpperCase();
    if (r.profilePic) {
      preview.innerHTML = '<img src="' + r.profilePic + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      preview.textContent = initial;
      preview.style.background = 'var(--blue)';
    }
  }

  if (typeof showAdminSection === 'function') showAdminSection('edit-resident', null);
}

function saveEditResident() {
  var index     = parseInt(document.getElementById('editResidentIndex').value);
  var residents = getData('residents');
  var r = residents[index];
  if (!r) return;

  r.familyName  = document.getElementById('editAdminFamilyName').value.trim();
  r.firstName   = document.getElementById('editAdminFirstName').value.trim();
  r.middleName  = document.getElementById('editAdminMiddleName').value.trim();
  r.extName     = document.getElementById('editAdminExtName').value.trim();
  r.sex         = document.getElementById('editAdminSex').value;
  r.address     = document.getElementById('editAdminAddress').value.trim();
  r.name        = r.familyName + (r.firstName ? ', ' + r.firstName : '');

  var newPass = document.getElementById('editAdminPassword').value.trim();
  if (newPass) r.password = newPass;

  residents[index] = r;
  setData('residents', residents);

  // Update session if editing logged-in user
  var loggedIn = sessionStorage.getItem('loggedInUser');
  if (loggedIn) {
    var lu = JSON.parse(loggedIn);
    if (lu.userId === r.userId) sessionStorage.setItem('loggedInUser', JSON.stringify(r));
  }

  showAlert('edit-resident-alert', 'Resident updated successfully!', 'success');
}

/* =========================================
  RESIDENT: SAVE PROFILE
========================================= */
function previewProfilePic(input) {
  if (!input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var preview = document.getElementById('profilePicPreview');
    if (preview) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function saveProfile() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;

  user.familyName  = document.getElementById('editFamilyName').value.trim() || user.familyName;
  user.firstName   = document.getElementById('editFirstName').value.trim()  || user.firstName;
  user.middleName  = document.getElementById('editMiddleName').value.trim();
  user.extName     = document.getElementById('editExtName').value.trim();
  user.sex         = document.getElementById('editSex').value         || user.sex;
  user.address     = document.getElementById('editAddress').value.trim() || user.address;
  user.name        = (user.familyName || '') + (user.firstName ? ', ' + user.firstName : '');

  // Update all 15 security answers if filled in
  for (var si = 1; si <= 15; si++) {
    var sel = document.getElementById('profileSecQ' + si);
    var ans = sel ? (sel.value || '').trim() : '';
    if (ans) user['secQ' + si] = ans.toLowerCase();
  }

  // Profile pic
  var picInput = document.getElementById('profilePicInput');
  if (picInput && picInput.files && picInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      user.profilePic = e.target.result;
      finishSaveProfile(user);
    };
    reader.readAsDataURL(picInput.files[0]);
    return;
  }

  finishSaveProfile(user);
}

function finishSaveProfile(user) {
  // Password change
  var cur = document.getElementById('currentPassword').value.trim();
  var nw  = document.getElementById('newPassword').value.trim();
  var cf  = document.getElementById('confirmPassword').value.trim();

  if (cur || nw || cf) {
    if (!cur) return showAlert('profile-alert', 'Enter your current password.', 'error');
    if (user.password !== cur) return showAlert('profile-alert', 'Current password is incorrect.', 'error');
    if (!nw) return showAlert('profile-alert', 'Enter a new password.', 'error');
    if (nw !== cf) return showAlert('profile-alert', 'New passwords do not match.', 'error');
    user.password = nw;
  }

  // Save back to residents array
  var residents = getData('residents');
  for (var i = 0; i < residents.length; i++) {
    if (residents[i].userId === user.userId) { residents[i] = user; break; }
  }
  setData('residents', residents);
  sessionStorage.setItem('loggedInUser', JSON.stringify(user));

  // Update UI
  var welcomeEl = document.getElementById('welcomeUser');
  var welcomeInner = document.getElementById('welcomeUserInner');
  if (welcomeEl) welcomeEl.textContent = getFullName(user);
  if (welcomeInner) welcomeInner.textContent = user.firstName || getFullName(user);
  updateAvatarDisplay(user);

  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  showAlert('profile-alert', 'Profile updated successfully!', 'success');
}

function loadProfileForm() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('editFamilyName', user.familyName);
  set('editFirstName',  user.firstName);
  set('editMiddleName', user.middleName);
  set('editExtName',    user.extName);
  set('editSex',        user.sex);
  set('editAddress',    user.address);

  // Load all 15 security answers (show existing so user knows they're set)
  for (var pi = 1; pi <= 15; pi++) {
    set('profileSecQ' + pi, user['secQ' + pi] || '');
  }

  var preview = document.getElementById('profilePicPreview');
  var initial = (user.familyName || user.name || 'R').charAt(0).toUpperCase();
  if (preview) {
    if (user.profilePic) {
      preview.innerHTML = '<img src="' + user.profilePic + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      preview.textContent = initial;
      preview.style.background = 'var(--blue)';
      preview.style.color = 'white';
    }
  }
}

/* =========================================
  SHOW RESIDENT SECTION
========================================= */
function showResidentSection(sectionId, btn) {
  // Always close the court modal before switching sections
  var _cm = document.getElementById('courtRequestModal');
  if (_cm) _cm.classList.remove('open');

  var current = document.querySelector('.res-section[style*="block"]') || document.querySelector('.res-section:not([style*="none"])');
  document.querySelectorAll('.res-section').forEach(function(el){ el.style.display='none'; el.classList.remove('section-enter'); });
  document.querySelectorAll('.dash-btn').forEach(function(b){ b.classList.remove('active'); });
  var el = document.getElementById(sectionId);
  if (el) {
    el.style.display = 'block';
    el.classList.remove('section-enter');
    void el.offsetWidth; // force reflow
    el.classList.add('section-enter');
  }
  // Always scroll dash-main back to top when switching sections
  var dashMain = document.querySelector('.dash-main');
  if (dashMain) dashMain.scrollTop = 0;
  if (btn) btn.classList.add('active');
  if (sectionId === 'res-myrequests') loadMyClearances();
  if (sectionId === 'res-forum') loadForum();
  if (sectionId === 'res-announcements') { loadProjectMonitoring(); loadResidentAnnouncementCards(); }
  if (sectionId === 'res-profile') loadProfileForm();
  if (sectionId === 'res-home') { loadHomeNotifications(); loadHomeLatestUpdates(); loadHomeAdminMessages(); loadHomeRequestWidget(); updateNotifBell(); }
  if (sectionId === 'res-court') { loadCourtSchedule(); loadMyCourtRequests(); renderCourtCalendar(); }
  if (sectionId === 'res-messages') { loadResidentMessages(); }
}

/* =========================================
  DOC TYPE CARD SELECTOR
========================================= */
function selectDocType(cardEl, value) {
  document.querySelectorAll('.doc-type-card').forEach(function(c){ c.classList.remove('selected'); });
  cardEl.classList.add('selected');
  var hidden = document.getElementById('docType');
  if (hidden) hidden.value = value;
  var indicator = document.getElementById('docTypeSelected');
  var label = document.getElementById('docTypeSelectedLabel');
  if (indicator) indicator.style.display = 'block';
  if (label) label.textContent = value;
  
  // Hide all dynamic fields first
  var dynamicWrap = document.getElementById('dynamicFieldsWrap');
  if (dynamicWrap) dynamicWrap.style.display = 'block';
  ['clearanceFields', 'residencyFields', 'businessFields', 'caseFields', 'indigencyFields'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  // Show relevant fields based on document type
  if (value === 'Barangay Clearance') {
    var el = document.getElementById('clearanceFields');
    if (el) el.style.display = 'block';
  } else if (value === 'Certificate of Residency') {
    var el = document.getElementById('residencyFields');
    if (el) el.style.display = 'block';
  } else if (value === 'Certificate of Business') {
    var el = document.getElementById('businessFields');
    if (el) el.style.display = 'block';
  } else if (value === 'Case Report') {
    var el = document.getElementById('caseFields');
    if (el) el.style.display = 'block';
  } else if (value === 'Certificate of Indigency') {
    var el = document.getElementById('indigencyFields');
    if (el) el.style.display = 'block';
  }
  
  // Update Purpose/Narrative label based on document type
  var purposeLabel = document.getElementById('docPurposeLabel');
  var purposeField = document.getElementById('docPurpose');
  var purposeHint = document.getElementById('docPurposeHint');
  
  if (value === 'Case Report') {
    if (purposeLabel) purposeLabel.innerHTML = 'Narrative Report <span style="color:#e74c3c;">*</span>';
    if (purposeField) purposeField.placeholder = 'Describe what happened in detail. Include date, time, location, and involved parties.';
    if (purposeHint) purposeHint.textContent = 'Provide detailed information about the incident or issue';
  } else {
    if (purposeLabel) purposeLabel.innerHTML = 'Purpose <span style="color:#e74c3c;">*</span>';
    if (purposeField) purposeField.placeholder = 'e.g. Employment, Travel, Scholarship';
    if (purposeHint) purposeHint.textContent = 'e.g. Employment, Travel, Scholarship, Medical assistance';
  }
}

function clearDocType() {
  document.querySelectorAll('.doc-type-card').forEach(function(c){ c.classList.remove('selected'); });
  var hidden = document.getElementById('docType');
  if (hidden) hidden.value = '';
  var indicator = document.getElementById('docTypeSelected');
  if (indicator) indicator.style.display = 'none';
  // Hide all dynamic field wrappers so second request starts clean
  var dynamicWrap = document.getElementById('dynamicFieldsWrap');
  if (dynamicWrap) dynamicWrap.style.display = 'none';
  ['clearanceFields','residencyFields','businessFields','caseFields','indigencyFields'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Clear docTypeCards outline
  var dtCards = document.getElementById('docTypeCards');
  if (dtCards) dtCards.style.outline = '';
}

/* =========================================
  FILE UPLOAD PREVIEW
========================================= */
function previewUpload(input, previewId, wrapId) {
  var previewEl = document.getElementById(previewId);
  var wrapEl = document.getElementById(wrapId);
  if (!previewEl) return;
  if (!input.files || input.files.length === 0) { previewEl.style.display='none'; return; }
  var file = input.files[0];
  var isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  // Remove error highlight on selection
  if (wrapEl) wrapEl.classList.remove('has-error');
  var errId = wrapId.replace('Wrap','Error');
  var errEl = document.getElementById(errId);
  if (errEl) errEl.style.display = 'none';

  if (isPdf) {
    previewEl.innerHTML = '<div style="display:flex;align-items:center;gap:10px;background:#f8f9fb;border:1.5px solid #b3d9f7;border-radius:10px;padding:10px 14px;">' +
      '<i class="fa-solid fa-file-pdf" style="color:#e53935;font-size:1.8rem;flex-shrink:0;"></i>' +
      '<div><div style="font-weight:600;color:var(--navy);font-size:13px;">' + esc(file.name) + '</div>' +
      '<div style="font-size:11.5px;color:var(--gray);">PDF — ' + (file.size/1024).toFixed(1) + ' KB</div></div>' +
      '<button onclick="clearUpload(\'' + input.id + '\',\'' + previewId + '\',\'' + wrapId + '\')" style="margin-left:auto;background:none;border:none;color:#e53935;cursor:pointer;font-size:13px;" title="Remove"><i class="fa-solid fa-xmark"></i> Remove</button></div>';
    previewEl.style.display = 'block';
  } else {
    var reader = new FileReader();
    reader.onload = function(e) {
      previewEl.innerHTML = '<div style="position:relative;display:inline-block;">' +
        '<img src="' + e.target.result + '" style="max-width:100%;max-height:180px;border-radius:10px;border:2px solid #b3d9f7;display:block;object-fit:cover;">' +
        '<button onclick="clearUpload(\'' + input.id + '\',\'' + previewId + '\',\'' + wrapId + '\')" style="position:absolute;top:-8px;right:-8px;background:#e53935;border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);" title="Remove"><i class="fa-solid fa-xmark"></i></button>' +
        '<div style="font-size:11.5px;color:var(--gray);margin-top:5px;">' + esc(file.name) + ' · ' + (file.size/1024).toFixed(1) + ' KB</div>' +
        '</div>';
      previewEl.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function clearUpload(inputId, previewId, wrapId) {
  var input = document.getElementById(inputId);
  var preview = document.getElementById(previewId);
  if (input) input.value = '';
  if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
}

/* Multi-file upload preview (max 2 files) — for Gov't ID front+back */
function previewUploadMulti(input, previewId, wrapId) {
  var previewEl = document.getElementById(previewId);
  var wrapEl = document.getElementById(wrapId);
  if (!previewEl) return;
  if (!input.files || input.files.length === 0) { previewEl.style.display = 'none'; return; }

  // Cap at 2 files
  var files = Array.from(input.files).slice(0, 2);
  if (wrapEl) wrapEl.classList.remove('has-error');
  var errEl = document.getElementById(wrapId.replace('Wrap','Error'));
  if (errEl) errEl.style.display = 'none';

  var html = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
  var pending = files.length;

  function buildItem(file, dataUrl) {
    var isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      return '<div style="display:flex;align-items:center;gap:10px;background:#f8f9fb;border:1.5px solid #b3d9f7;border-radius:10px;padding:10px 14px;min-width:180px;">' +
        '<i class="fa-solid fa-file-pdf" style="color:#e53935;font-size:1.8rem;flex-shrink:0;"></i>' +
        '<div><div style="font-weight:600;color:var(--navy);font-size:13px;">' + esc(file.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--gray);">' + (file.size/1024).toFixed(1) + ' KB</div></div></div>';
    }
    return '<div style="position:relative;display:inline-block;">' +
      '<img src="' + dataUrl + '" style="width:130px;height:90px;border-radius:10px;border:2px solid #b3d9f7;object-fit:cover;display:block;">' +
      '<div style="font-size:11px;color:var(--gray);margin-top:4px;text-align:center;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(file.name) + '</div>' +
      '</div>';
  }

  // Read all files then render
  var results = new Array(files.length);
  files.forEach(function(file, i) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      results[i] = null;
      pending--;
      if (pending === 0) {
        html = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
        files.forEach(function(f, j) { html += buildItem(f, results[j]); });
        html += '<div style="font-size:12px;color:#27ae60;width:100%;margin-top:4px;"><i class="fa-solid fa-check" style="margin-right:5px;"></i>' + files.length + ' file(s) selected</div></div>';
        html += '<button onclick="clearUpload(\'docGovId\',\'' + previewId + '\',\'' + wrapId + '\')" style="margin-top:6px;background:none;border:none;color:#e53935;cursor:pointer;font-size:13px;font-family:\'Poppins\',sans-serif;"><i class="fa-solid fa-xmark"></i> Clear</button>';
        previewEl.innerHTML = html;
        previewEl.style.display = 'block';
      }
    } else {
      var reader = new FileReader();
      reader.onload = (function(idx) { return function(e) {
        results[idx] = e.target.result;
        pending--;
        if (pending === 0) {
          var out = '<div style="display:flex;flex-wrap:wrap;gap:12px;">';
          files.forEach(function(f, j) { out += buildItem(f, results[j]); });
          out += '<div style="font-size:12px;color:#27ae60;width:100%;margin-top:4px;"><i class="fa-solid fa-check" style="margin-right:5px;"></i>' + files.length + ' file(s) selected</div></div>';
          out += '<button onclick="clearUpload(\'docGovId\',\'' + previewId + '\',\'' + wrapId + '\')" style="margin-top:6px;background:none;border:none;color:#e53935;cursor:pointer;font-size:13px;font-family:\'Poppins\',sans-serif;"><i class="fa-solid fa-xmark"></i> Clear</button>';
          previewEl.innerHTML = out;
          previewEl.style.display = 'block';
        }
      }; })(i);
      reader.readAsDataURL(file);
    }
  });
}

/* =========================================
  DOCUMENT REQUESTS
========================================= */
function requestDocument() {
  var docType  = document.getElementById('docType').value;
  var purpose  = document.getElementById('docPurpose').value.trim();

  // Capture dynamic fields based on document type
  var age = (document.getElementById('docAge') ? document.getElementById('docAge').value.trim() : '');
  var civilStatus = (document.getElementById('docCivilStatus') ? document.getElementById('docCivilStatus').value.trim() : '');
  var residenceYears = (document.getElementById('docResidenceYears') ? document.getElementById('docResidenceYears').value.trim() : '');
  var businessName = (document.getElementById('docBusinessName') ? document.getElementById('docBusinessName').value.trim() : '');
  var businessType = (document.getElementById('docBusinessType') ? document.getElementById('docBusinessType').value.trim() : '');
  var businessAddress = (document.getElementById('docBusinessAddress') ? document.getElementById('docBusinessAddress').value.trim() : '');
  var incidentType = (document.getElementById('docIncidentType') ? document.getElementById('docIncidentType').value.trim() : '');
  // New address fields (per doc type)
  var clearanceAddress    = (document.getElementById('docClearanceAddress')    ? document.getElementById('docClearanceAddress').value.trim()    : '');
  var residencyAge        = (document.getElementById('docResidencyAge')        ? document.getElementById('docResidencyAge').value.trim()        : '');
  var residencyAddress    = (document.getElementById('docResidencyAddress')    ? document.getElementById('docResidencyAddress').value.trim()    : '');
  var businessAge         = (document.getElementById('docBusinessAge')         ? document.getElementById('docBusinessAge').value.trim()         : '');
  var residentialAddress  = (document.getElementById('docResidentialAddress')  ? document.getElementById('docResidentialAddress').value.trim()  : '');
  var caseAge             = (document.getElementById('docCaseAge')             ? document.getElementById('docCaseAge').value.trim()             : '');
  var caseAddress         = (document.getElementById('docCaseAddress')         ? document.getElementById('docCaseAddress').value.trim()         : '');
  var indigencyAge        = (document.getElementById('docIndigencyAge')        ? document.getElementById('docIndigencyAge').value.trim()        : '');
  var indigencyAddress    = (document.getElementById('docIndigencyAddress')    ? document.getElementById('docIndigencyAddress').value.trim()    : '');

  // Reset all inline errors
  ['docTypeCards','docTypeError','govIdWrap','cedulaWrap','signatureWrap','govIdBackWrap','govIdError','govIdBackError','cedulaError','signatureError','docPurposeWrap','docPurposeError',
   'docClearanceAddressError','docResidencyAgeError','docResidencyAddressError','docBusinessAgeError','docResidentialAddressError',
   'docCaseAgeError','docCaseAddressError','docIndigencyAgeError','docIndigencyAddressError'].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    if (id.endsWith('Wrap') || id === 'docTypeCards') el.classList && el.classList.remove('has-error');
    if (id.endsWith('Error')) el.style.display = 'none';
  });
  // Also remove red border from purpose input
  var purposeInput = document.getElementById('docPurpose');
  if (purposeInput) purposeInput.style.border = '';

  var hasError = false;

  // Validate doc type
  if (!docType) {
    var dtCards = document.getElementById('docTypeCards');
    if (dtCards) dtCards.style.outline = '2px solid #e74c3c';
    var dtErr = document.getElementById('docTypeError');
    if (dtErr) dtErr.style.display = 'block';
    hasError = true;
  } else {
    var dtCards = document.getElementById('docTypeCards');
    if (dtCards) dtCards.style.outline = '';
  }

  // Validate required dynamic fields
  if (docType === 'Barangay Clearance') {
    if (!age) {
      var el = document.getElementById('docAge');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
    if (!clearanceAddress) {
      var el = document.getElementById('docClearanceAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docClearanceAddressError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
  }
  if (docType === 'Certificate of Residency') {
    if (!residencyAge) {
      var el = document.getElementById('docResidencyAge');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docResidencyAgeError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!residencyAddress) {
      var el = document.getElementById('docResidencyAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docResidencyAddressError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!civilStatus) {
      var el = document.getElementById('docCivilStatus');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
    if (!residenceYears) {
      var el = document.getElementById('docResidenceYears');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
  }
  if (docType === 'Certificate of Indigency') {
    if (!indigencyAge) {
      var el = document.getElementById('docIndigencyAge');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docIndigencyAgeError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!indigencyAddress) {
      var el = document.getElementById('docIndigencyAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docIndigencyAddressError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
  }
  if (docType === 'Certificate of Business') {
    if (!businessAge) {
      var el = document.getElementById('docBusinessAge');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docBusinessAgeError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!residentialAddress) {
      var el = document.getElementById('docResidentialAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docResidentialAddressError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!businessName) {
      var el = document.getElementById('docBusinessName');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
    if (!businessType) {
      var el = document.getElementById('docBusinessType');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
    if (!businessAddress) {
      var el = document.getElementById('docBusinessAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
  }
  if (docType === 'Case Report') {
    if (!caseAge) {
      var el = document.getElementById('docCaseAge');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docCaseAgeError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!caseAddress) {
      var el = document.getElementById('docCaseAddress');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      var errEl = document.getElementById('docCaseAddressError');
      if (errEl) errEl.style.display = 'block';
      hasError = true;
    }
    if (!incidentType) {
      var el = document.getElementById('docIncidentType');
      if (el) { el.style.border = '1.5px solid #e74c3c'; el.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
      hasError = true;
    }
  }

  // Validate purpose
  if (!purpose) {
    if (purposeInput) { purposeInput.style.border = '1.5px solid #e74c3c'; purposeInput.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.12)'; }
    var pErr = document.getElementById('docPurposeError');
    if (pErr) pErr.style.display = 'block';
    hasError = true;
  }

  var govIdFile    = document.getElementById('docGovId')      ? document.getElementById('docGovId').files      : null;
  var govIdBackFile= document.getElementById('docGovIdBack')  ? document.getElementById('docGovIdBack').files  : null;
  var cedulaFile   = document.getElementById('docCedula')     ? document.getElementById('docCedula').files     : null;
  var sigFile      = document.getElementById('docSignature')  ? document.getElementById('docSignature').files  : null;

  if (!govIdFile || govIdFile.length === 0) {
    var w = document.getElementById('govIdWrap'); if (w) w.classList.add('has-error');
    var e = document.getElementById('govIdError'); if (e) e.style.display = 'block';
    hasError = true;
  }
  if (!cedulaFile || cedulaFile.length === 0) {
    var w = document.getElementById('cedulaWrap'); if (w) w.classList.add('has-error');
    var e = document.getElementById('cedulaError'); if (e) e.style.display = 'block';
    hasError = true;
  }
  if (!sigFile || sigFile.length === 0) {
    var w = document.getElementById('signatureWrap'); if (w) w.classList.add('has-error');
    var e = document.getElementById('signatureError'); if (e) e.style.display = 'block';
    hasError = true;
  }

  if (hasError) {
    // Scroll to first error
    var firstErr = document.querySelector('.has-error,[style*="color:#e74c3c"][style*="block"]');
    if (!firstErr) firstErr = document.getElementById('docTypeError');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Read all files as base64 then save
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var requests = getData('clearanceRequests');

  function readFileAsBase64(file, cb) {
    if (!file) return cb(null);
    var reader = new FileReader();
    reader.onload = function(e) { cb(e.target.result); };
    reader.readAsDataURL(file);
  }

  readFileAsBase64(govIdFile[0], function(govIdData) {
    readFileAsBase64(govIdBackFile && govIdBackFile[0] ? govIdBackFile[0] : null, function(govIdData2) {
    readFileAsBase64(cedulaFile[0], function(cedulaData) {
      readFileAsBase64(sigFile[0], function(sigData) {
        requests.push({
          fullname:    getFullName(user),
          userId:      user.userId,
          requestedBy: user.userId,
          docType:     docType,
          purpose:     purpose,
          status:      'Pending',
          date:        new Date().toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }),
          govIdData:   govIdData,
          govIdData2:  govIdData2 || null,
          cedulaData:  cedulaData,
          sigData:     sigData,
          govIdName:   govIdFile[0].name,
          govIdName2:  govIdBackFile && govIdBackFile[0] ? govIdBackFile[0].name : null,
          cedulaName:  cedulaFile[0].name,
          sigName:     sigFile[0].name,
          // Dynamic fields
          age:              age,
          clearanceAddress: clearanceAddress,
          civilStatus:      civilStatus,
          residencyAge:     residencyAge,
          residencyAddress: residencyAddress,
          residenceYears:   residenceYears,
          businessAge:      businessAge,
          residentialAddress: residentialAddress,
          businessName:     businessName,
          businessType:     businessType,
          businessAddress:  businessAddress,
          caseAge:          caseAge,
          caseAddress:      caseAddress,
          incidentType:     incidentType,
          indigencyAge:     indigencyAge,
          indigencyAddress: indigencyAddress
        });
        setData('clearanceRequests', requests);

        // Reset form
        document.getElementById('docType').value = '';
        document.getElementById('docPurpose').value = '';
        if (document.getElementById('docAge')) document.getElementById('docAge').value = '';
        if (document.getElementById('docClearanceAddress'))   document.getElementById('docClearanceAddress').value = '';
        if (document.getElementById('docCivilStatus')) document.getElementById('docCivilStatus').value = '';
        if (document.getElementById('docResidencyAge'))       document.getElementById('docResidencyAge').value = '';
        if (document.getElementById('docResidencyAddress'))   document.getElementById('docResidencyAddress').value = '';
        if (document.getElementById('docResidenceYears')) document.getElementById('docResidenceYears').value = '';
        if (document.getElementById('docBusinessAge'))        document.getElementById('docBusinessAge').value = '';
        if (document.getElementById('docResidentialAddress')) document.getElementById('docResidentialAddress').value = '';
        if (document.getElementById('docBusinessName')) document.getElementById('docBusinessName').value = '';
        if (document.getElementById('docBusinessType')) document.getElementById('docBusinessType').value = '';
        if (document.getElementById('docBusinessAddress')) document.getElementById('docBusinessAddress').value = '';
        if (document.getElementById('docCaseAge'))            document.getElementById('docCaseAge').value = '';
        if (document.getElementById('docCaseAddress'))        document.getElementById('docCaseAddress').value = '';
        if (document.getElementById('docIncidentType')) document.getElementById('docIncidentType').value = '';
        if (document.getElementById('docIndigencyAge'))       document.getElementById('docIndigencyAge').value = '';
        if (document.getElementById('docIndigencyAddress'))   document.getElementById('docIndigencyAddress').value = '';
        if (document.getElementById('docGovId'))     document.getElementById('docGovId').value = '';
        if (document.getElementById('docGovIdBack')) document.getElementById('docGovIdBack').value = '';
        if (document.getElementById('docCedula'))    document.getElementById('docCedula').value = '';
        if (document.getElementById('docSignature')) document.getElementById('docSignature').value = '';
        ['govIdPreview','govIdBackPreview','cedulaPreview','signaturePreview'].forEach(function(id){ var el=document.getElementById(id); if(el){el.innerHTML='';el.style.display='none';} });
        clearDocType();
        showToast('<strong>' + docType + '</strong> request submitted successfully! Check <em>My Requests</em> for status updates.', 'success');
        showAlert('doc-alert', docType + ' request submitted! Check My Requests for status.', 'success');
        loadHomeNotifications();
        updateNotifBell();
      });
    });
    });
  });
}

function loadMyClearances() {
  var el = document.getElementById('myClearanceTable');
  if (!el) return;
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var all  = getData('clearanceRequests');
  var mine = all.filter(function(r){ return user && r.requestedBy === user.userId; });
  if (mine.length === 0) { el.innerHTML = '<p style="color:#888;margin-top:8px;">No requests yet.</p>'; return; }

  // Sort latest first
  mine = mine.slice().reverse();

  var html = '<div style="display:grid;gap:14px;">';
  mine.forEach(function(r) {
    var realIdx = all.findIndex(function(x){ return user && x.requestedBy === user.userId && x.docType === r.docType && x.date === r.date && x.purpose === r.purpose; });
    var statusColor = r.status === 'Approved' ? '#43a047' : r.status === 'Rejected' ? '#e53935' : '#f57c00';
    var statusIcon  = r.status === 'Approved' ? 'fa-circle-check' : r.status === 'Rejected' ? 'fa-circle-xmark' : 'fa-clock';
    var docIcons = {
      'Barangay Clearance':     'fa-id-card',
      'Certificate of Residency': 'fa-house-user',
      'Certificate of Indigency': 'fa-hand-holding-heart',
      'Certificate of Business':  'fa-store',
      'Case Report':              'fa-gavel'
    };
    var docIcon = docIcons[r.docType] || 'fa-file-lines';

    var isPaid = r.status === 'Approved' && r.paymentMethod && r.paymentStatus === 'approved';
    var paymentPending = r.status === 'Approved' && r.paymentMethod && r.paymentStatus === 'pending';
    var paymentRejected = r.status === 'Approved' && r.paymentMethod && r.paymentStatus === 'rejected';
    var cardStyle = isPaid
      ? 'background:#fff;border:2px solid #43a047;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:box-shadow .2s,transform .2s;'
      : 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;transition:box-shadow .2s,transform .2s;';
    var clickAttr = isPaid ? ' onclick="viewDocumentPDF(' + realIdx + ')" title="Click to view/download your document"' : '';

    html += '<div class="hoverable-card" style="' + cardStyle + '"' + clickAttr + '>';

    // Doc icon
    html += '<div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#e8f4fd,#c3dff7);display:flex;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<i class="fa-solid ' + docIcon + '" style="color:var(--blue);font-size:1.3rem;"></i>';
    html += '</div>';

    // Info
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-weight:700;color:var(--navy);font-size:.95rem;">' + esc(r.docType || 'Document') + '</div>';
    html += '<div style="font-size:12.5px;color:#555;margin-top:2px;">' + esc(r.purpose || '') + '</div>';
    html += '<div style="font-size:11.5px;color:#aaa;margin-top:3px;"><i class="fa-solid fa-calendar" style="margin-right:4px;"></i>' + (r.date || '—') + '</div>';
    if (isPaid) {
      html += '<div style="font-size:12px;color:#43a047;margin-top:4px;font-weight:600;"><i class="fa-solid fa-file-arrow-down" style="margin-right:5px;"></i>Click to view & download document</div>';
    }
    if (paymentPending) {
      html += '<div style="font-size:12px;color:#f57c00;margin-top:4px;font-weight:600;"><i class="fa-solid fa-hourglass-end" style="margin-right:5px;"></i>⏳ Waiting for admin approval...</div>';
    }
    if (paymentRejected) {
      html += '<div style="font-size:12px;color:#e53935;margin-top:4px;font-weight:600;"><i class="fa-solid fa-circle-xmark" style="margin-right:5px;"></i>❌ Payment rejected - Please resubmit</div>';
    }
    if (r.status === 'Rejected' && r.adminNote) {
      html += '<div style="margin-top:6px;font-size:12px;color:#e53935;background:#fff5f5;border-radius:6px;padding:5px 10px;border-left:3px solid #e53935;"><i class="fa-solid fa-comment" style="margin-right:5px;"></i>' + esc(r.adminNote) + '</div>';
    }
    html += '</div>';

    // Status badge
    html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">';
    html += '<span style="font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;background:' + statusColor + '18;color:' + statusColor + ';border:1px solid ' + statusColor + '44;white-space:nowrap;">';
    html += '<i class="fa-solid ' + statusIcon + '" style="margin-right:4px;"></i>' + r.status + '</span>';

    // Action buttons
    if (r.status === 'Rejected') {
      html += '<div style="display:flex;gap:6px;">';
      html += '<button onclick="deleteMyRequest(' + realIdx + ')" style="background:#e5393518;color:#e53935;border:1px solid #e5393540;border-radius:7px;padding:5px 11px;font-size:11.5px;cursor:pointer;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:4px;"><i class="fa-solid fa-trash"></i> Delete</button>';
      html += '<button onclick="reRequestDoc(\'' + esc(r.docType) + '\')" style="background:var(--blue);color:#fff;border:none;border-radius:7px;padding:5px 11px;font-size:11.5px;cursor:pointer;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:4px;"><i class="fa-solid fa-rotate-right"></i> Re-request</button>';
      html += '</div>';
    }
    if (r.status === 'Approved') {
      if (!r.paymentMethod) {
        html += '<button onclick="openResDocPaymentModal(' + realIdx + ')" style="background:linear-gradient(135deg,var(--orange),#c85a00);color:#fff;border:none;border-radius:7px;padding:6px 13px;font-size:11.5px;cursor:pointer;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(245,124,0,0.3);"><i class="fa-solid fa-credit-card"></i> Pay Now</button>';
      } else if (paymentPending) {
        html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">';
        html += '<span style="font-size:11.5px;color:#f57c00;font-weight:600;display:flex;align-items:center;gap:4px;background:#f57c0015;border:1px solid #f57c0030;border-radius:7px;padding:5px 11px;"><i class="fa-solid fa-hourglass-end"></i> Pending Approval</span>';
        html += '</div>';
      } else if (paymentRejected) {
        html += '<button onclick="openResDocPaymentModal(' + realIdx + ')" style="background:linear-gradient(135deg,#e53935,#c62828);color:#fff;border:none;border-radius:7px;padding:6px 13px;font-size:11.5px;cursor:pointer;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(229,57,53,0.3);"><i class="fa-solid fa-rotate-right"></i> Resubmit</button>';
      } else {
        var mIcon = r.paymentMethod === 'gcash' ? 'fa-mobile-alt' : r.paymentMethod === 'paymaya' ? 'fa-wallet' : 'fa-qrcode';
        var mColor = r.paymentMethod === 'gcash' ? '#007bff' : r.paymentMethod === 'paymaya' ? '#6f42c1' : '#27ae60';
        html += '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">';
        html += '<span style="font-size:11.5px;color:' + mColor + ';font-weight:600;display:flex;align-items:center;gap:4px;background:' + mColor + '15;border:1px solid ' + mColor + '30;border-radius:7px;padding:5px 11px;"><i class="fa-solid ' + mIcon + '"></i> ✅ Approved</span>';
        html += '<button onclick="event.stopPropagation();viewDocumentPDF(' + realIdx + ')" style="background:linear-gradient(135deg,#43a047,#1b5e20);color:#fff;border:none;border-radius:7px;padding:5px 11px;font-size:11.5px;cursor:pointer;font-family:Poppins,sans-serif;display:flex;align-items:center;gap:4px;"><i class="fa-solid fa-file-arrow-down"></i> Download</button>';
        html += '</div>';
      }
    }

    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

/* =========================================
  VIEW / DOWNLOAD DOCUMENT PDF
========================================= */
function viewDocumentPDF(realIdx) {
  var all = getData('clearanceRequests');
  var r = all[realIdx];
  if (!r) return;

  // Security check: Only allow download if payment is approved
  if (r.paymentStatus !== 'approved') {
    showToast('<strong>⚠️ Document Not Ready</strong> Waiting for admin to approve your payment.', 'warning');
    return;
  }

  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
  var monthYear = now.toLocaleDateString('en-PH', { month:'long', year:'numeric' });
  var controlNo = 'BRY99-' + now.getFullYear() + '-' + String(realIdx+1).padStart(4,'0');

  // Generate document body based on type - Formal black and white format
  var docBody = '';
  var fullname = esc(r.fullname) || '[Full Name]';
  var purpose = esc(r.purpose) || '[Purpose/Details]';
  var civilStatus = esc(r.civilStatus) || '[Civil Status]';
  var residenceYears = esc(r.residenceYears) || '[Years of Residence]';
  var businessName = esc(r.businessName) || '[Business Name]';
  var businessType = esc(r.businessType) || '[Type of Business]';
  var businessAddress = esc(r.businessAddress) || '[Business Address]';

  // Auto-resolve age and address per document type from stored request fields,
  // falling back to the logged-in user's profile address when available.
  var userProfileAddress = (user && user.address) ? user.address : '';
  var resolvedAge, resolvedAddress;
  if (r.docType === 'Barangay Clearance') {
    resolvedAge     = r.age             || (user && user.age) || '';
    resolvedAddress = r.clearanceAddress || userProfileAddress;
  } else if (r.docType === 'Certificate of Residency') {
    resolvedAge     = r.residencyAge    || (user && user.age) || '';
    resolvedAddress = r.residencyAddress || userProfileAddress;
  } else if (r.docType === 'Certificate of Indigency') {
    resolvedAge     = r.indigencyAge    || (user && user.age) || '';
    resolvedAddress = r.indigencyAddress || userProfileAddress;
  } else if (r.docType === 'Certificate of Business') {
    resolvedAge     = r.businessAge     || (user && user.age) || '';
    resolvedAddress = r.residentialAddress || userProfileAddress;
  } else if (r.docType === 'Case Report') {
    resolvedAge     = r.caseAge         || (user && user.age) || '';
    resolvedAddress = r.caseAddress     || userProfileAddress;
  } else {
    resolvedAge     = r.age             || (user && user.age) || '';
    resolvedAddress = r.address         || userProfileAddress;
  }
  var autoAge     = esc(resolvedAge)     || '[Age]';
  var autoAddress = esc(resolvedAddress) || '[Complete Address]';

  if (r.docType === 'Barangay Clearance') {
    docBody = '<p style="text-align:center;margin-bottom:24px;">TO WHOM IT MAY CONCERN:</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This is to certify that <u>' + fullname + '</u>, ' + autoAge + ' years old, residing at ' + autoAddress + ', Barangay 99 Zone 9, District II, Caloocan City, is a bona fide resident of this barangay and has no derogatory records on file with the barangay office as of this date. The barangay has checked its records and found that the person mentioned above is known as a peace-loving and law-abiding resident of the community.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:24px;">This clearance is issued upon the request of the above-named person for the purpose of ' + purpose + '. It is issued freely and shall be used only for the stated purpose. It does not replace any other document that may be required by the school, company, or government office concerned.</p>';
  } else if (r.docType === 'Certificate of Residency') {
    docBody = '<p style="text-align:center;margin-bottom:24px;">TO WHOM IT MAY CONCERN:</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This is to certify that <u>' + fullname + '</u>, of legal age, ' + civilStatus + ', Filipino citizen, is a bona fide resident of ' + autoAddress + ', Barangay 99, Caloocan City.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">According to the records of this office, he/she has been residing in this Barangay for ' + residenceYears + ' year(s).</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:24px;">This certification is issued upon the request of the above-named person for ' + purpose + ' and for whatever legal purpose it may serve.</p>';
  } else if (r.docType === 'Certificate of Indigency') {
    docBody = '<p style="text-align:center;margin-bottom:24px;">TO WHOM IT MAY CONCERN:</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This is to certify that <u>' + fullname + '</u>, residing at ' + autoAddress + ', Barangay 99 Zone 9, District II, Caloocan City, is a member of an indigent family based on the records of this barangay. The barangay has checked the family\'s situation and found that they are among the low-income households in the community.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This certificate is issued upon the request of the person named above for the purpose of ' + purpose + '.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:24px;">This certification is issued freely and shall be used only for the purpose stated above. It does not replace any other documents that may be required by the school, hospital, government office, or other agency.</p>';
  } else if (r.docType === 'Certificate of Business') {
    docBody = '<p style="text-align:center;margin-bottom:24px;">TO WHOM IT MAY CONCERN:</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This is to certify that <u>' + fullname + '</u>, of legal age, Filipino, and a resident of ' + autoAddress + ', has applied for a Barangay Business Clearance to operate a business within the jurisdiction of this Barangay.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">The business is registered under the name <u>' + businessName + '</u>, located at ' + businessAddress + ', and is engaged in ' + businessType + '.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;">This certification is issued upon the request of the applicant for the purpose of securing a Mayor\'s Permit/Business Permit and for whatever legal purpose it may serve.</p>' +
      '<p style="text-align:justify;line-height:1.8;margin-bottom:16px;"><u>This further certifies that:</u></p>' +
      '<ul style="margin:12px 0 24px 40px;padding:0;line-height:1.8;text-align:justify;">' +
      '<li>The applicant has complied with the requirements of the Barangay.</li>' +
      '<li>The business activity is not in violation of any existing Barangay ordinance.</li>' +
      '<li>The applicant has no pending complaint or derogatory record in this Barangay.</li>' +
      '</ul>';
  } else if (r.docType === 'Case Report') {
    docBody = '<p style="text-align:center;margin-bottom:24px;"><u>BARANGAY BLOTTER / CASE REPORT</u></p>' +
      '<div style="border:1.5px solid #000;padding:18px 20px;margin:20px 0;line-height:1.8;">' +
      '<p><u>Complainant:</u> ' + fullname + '</p>' +
      '<p><u>Date/Time of Report:</u> ' + dateStr + '</p>' +
      '<p><u>Address:</u> ' + autoAddress + ', Barangay 99 Zone 9, District II, Caloocan City</p>' +
      '<p><u>Incident Type:</u> ' + esc(r.incidentType || '[Type of Incident]') + '</p>' +
      '<p style="margin-top:16px;"><u>Narrative Report:</u></p>' +
      '<p style="white-space:pre-wrap;padding:12px;border-left:3px solid #000;margin:12px 0 0 0;">' + purpose + '</p>' +
      '</div>';
  }

  var winContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + r.docType + ' — Barangay 99</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">' +
    '<style>' +
      'body{font-family:Poppins,sans-serif;margin:0;padding:20px;background:#fff;}' +
      '.doc-page{max-width:850px;margin:0 auto;background:#fff;padding:40px 60px;}' +
      '.doc-header{text-align:center;margin-bottom:8px;border-bottom:3px solid #000;padding-bottom:20px;}' +
      '.doc-header-logo{display:flex;justify-content:center;margin-bottom:16px;}' +
      '.doc-header-logo img{width:60px;height:60px;object-fit:contain;}' +
      '.doc-header-title{font-weight:700;font-size:0.9rem;letter-spacing:1px;margin:0 0 4px;text-transform:uppercase;}' +
      '.doc-header-subtitle{font-weight:600;font-size:0.85rem;margin:2px 0;letter-spacing:0.5px;}' +
      '.doc-header-line{font-size:0.8rem;margin:2px 0;letter-spacing:0.5px;}' +
      '.doc-title{text-align:center;font-weight:700;font-size:1.1rem;margin:32px 0 28px;text-transform:uppercase;letter-spacing:0.5px;}' +
      '.doc-body{font-size:0.95rem;line-height:1.9;text-align:justify;color:#000;}' +
      '.doc-intro{margin-bottom:20px;}' +
      '.doc-footer{margin-top:60px;padding-top:40px;display:flex;justify-content:space-between;}' +
      '.footer-col{text-align:center;flex:1;}' +
      '.sig-line{width:180px;border-top:1px solid #000;margin:0 auto 8px;}' +
      '.sig-label{font-size:0.9rem;font-weight:600;margin-bottom:2px;}' +
      '.sig-title{font-size:0.85rem;font-weight:600;}' +
      '.print-btn{position:fixed;bottom:28px;right:28px;background:#000;color:#fff;border:none;border-radius:50px;padding:14px 28px;font-size:14px;font-family:Poppins,sans-serif;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;z-index:100;}' +
      '.print-btn:hover{background:#333;}' +
      '@media print{.print-btn{display:none;}body{background:#fff;padding:0;margin:0;}.doc-page{margin:0;padding:40px 60px;max-width:100%;}}' +
    '</style></head><body>' +
    '<div class="doc-page">' +
      '<div class="doc-header">' +
        '<div class="doc-header-logo"><img src="images/logo/logo.png" alt="Barangay Logo"></div>' +
        '<div class="doc-header-title">Republic of the Philippines</div>' +
        '<div class="doc-header-subtitle">CITY OF CALOOCAN</div>' +
        '<div class="doc-header-line">BARANGAY 99. ZONE 9, DISTRICT II</div>' +
        '<div class="doc-header-line">TANGGAPAN NG PUNONG BARANGAY</div>' +
        '<div style="text-align:center;margin-top:8px;border-top:2px solid #000;border-bottom:2px solid #000;padding:4px 0;font-size:0.75rem;letter-spacing:2px;font-weight:600;">===============================================================</div>' +
      '</div>' +
      '<div class="doc-title">' + r.docType.toUpperCase() + '</div>' +
      '<div class="doc-body">' +
        docBody +
      '</div>' +
      '<p style="text-align:center;margin-top:32px;font-size:0.95rem;">Issued on this ' + now.getDate() + ' day of ' + monthYear + ', at Barangay 99, City of Caloocan.</p>' +
      '<div class="doc-footer">' +
        '<div class="footer-col">' +
          '<img src="data:image/jpeg;base64,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" style="height:150px;object-fit:contain;display:block;margin:0 auto 4px;">' +
          '<div class="sig-line"></div>' +
          '<div class="sig-label">Prepared by:</div>' +
          '<div class="sig-title">Emelina R. Santos</div>' +
          '<div class="sig-title">Barangay Secretary</div>' +
        '</div>' +
        '<div class="footer-col">' +
          '<img src="data:image/jpeg;base64,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" style="height:150px;object-fit:contain;display:block;margin:0 auto 4px;">' +
          '<div class="sig-line"></div>' +
          '<div class="sig-label">Attested by:</div>' +
          '<div class="sig-title">Hon. Danilo C. Caldo</div>' +
          '<div class="sig-title">Barangay Chairman</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>' +
    '</body></html>';

  var win = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes');
  if (win) {
    win.document.write(winContent);
    win.document.close();
  } else {
    alert('Please allow pop-ups to view your document.');
  }
}

/* =========================================
  RESIDENT DOCUMENT PAYMENT MODAL
========================================= */
function openResDocPaymentModal(realIdx) {
  var all = getData('clearanceRequests');
  var r = all[realIdx];
  if (!r) return;
  var modal = document.getElementById('resDocPaymentModal');
  if (!modal) return;
  document.getElementById('resDocPayReqIndex').value = realIdx;
  document.getElementById('resDocPaySummary').textContent = r.docType || 'Document Request';
  document.getElementById('resDocPayPurpose').textContent = 'Purpose: ' + (r.purpose || '—');
  document.getElementById('resDocPayAlert').style.display = 'none';
  document.getElementById('resDocPayRefInput').value = '';
  // Clear proof-of-payment upload fields
  var proofFile    = document.getElementById('resDocPayProofFile');
  var proofPreview = document.getElementById('resDocPayProofPreview');
  var proofArea    = document.getElementById('resDocPayProofUploadArea');
  var proofErr     = document.getElementById('resDocPayProofError');
  if (proofFile)    proofFile.value = '';
  if (proofPreview) { proofPreview.innerHTML = ''; proofPreview.style.display = 'none'; }
  if (proofArea)    proofArea.style.display = 'block';
  if (proofErr)     proofErr.style.display = 'none';
  switchResDocPayTab('qr');
  modal.style.display = 'flex';
}

function closeResDocPaymentModal() {
  var modal = document.getElementById('resDocPaymentModal');
  if (modal) modal.style.display = 'none';
}

function switchResDocPayTab(tab) {
  document.querySelectorAll('[data-rdtab]').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-rdtab') === tab);
  });
  ['gcash','paymaya','qr'].forEach(function(t) {
    var el = document.getElementById('resDocPay-tab-' + t);
    if (el) el.style.display = (t === tab) ? 'block' : 'none';
  });
}

function confirmResDocPayment() {
  var idx = parseInt(document.getElementById('resDocPayReqIndex').value);
  var ref = (document.getElementById('resDocPayRefInput').value || '').trim();
  var activeTab = document.querySelector('[data-rdtab].active');
  var method = activeTab ? activeTab.getAttribute('data-rdtab') : 'qr';
  var alertEl = document.getElementById('resDocPayAlert');
  var proofFileEl = document.getElementById('resDocPayProofFile');
  var proofErrEl  = document.getElementById('resDocPayProofError');

  // Reset error states
  if (proofErrEl) proofErrEl.style.display = 'none';

  if (!ref) {
    alertEl.style.display = 'block';
    alertEl.className = 'alert alert-error';
    alertEl.textContent = 'Please enter your reference number.';
    return;
  }

  // Require proof-of-payment image
  if (!proofFileEl || !proofFileEl.files || !proofFileEl.files[0]) {
    if (proofErrEl) proofErrEl.style.display = 'block';
    alertEl.style.display = 'block';
    alertEl.className = 'alert alert-error';
    alertEl.textContent = 'Please upload your proof of payment before submitting.';
    // Scroll to proof upload
    var proofWrap = document.getElementById('resDocPayProofWrap');
    if (proofWrap) proofWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  var all = getData('clearanceRequests');
  if (!all[idx]) return;

  // Read proof image then save
  var reader = new FileReader();
  reader.onload = function(e) {
    all[idx].paymentMethod      = method;
    all[idx].paymentRef         = ref;
    all[idx].paymentDate        = new Date().toLocaleDateString('en-PH');
    all[idx].paymentStatus      = 'pending';
    all[idx].paymentProofImage  = e.target.result;   // ← save proof
    all[idx].paymentApprovedBy  = null;
    all[idx].paymentApprovedDate = null;
    setData('clearanceRequests', all);
    closeResDocPaymentModal();
    showToast('<strong>Payment submitted!</strong> Reference: ' + ref + '. Waiting for admin approval...', 'success');
    loadMyClearances();
    loadHomeRequestWidget();
  };
  reader.readAsDataURL(proofFileEl.files[0]);
}

document.addEventListener('click', function(e) {
  var modal = document.getElementById('resDocPaymentModal');
  if (modal && e.target === modal) closeResDocPaymentModal();
});

function deleteMyRequest(realIdx) {
  if (!confirm('Delete this rejected request?')) return;
  var all = getData('clearanceRequests');
  all.splice(realIdx, 1);
  setData('clearanceRequests', all);
  loadMyClearances();
  loadHomeRequestWidget();
}

function reRequestDoc(docType) {
  var btn = document.querySelectorAll('.dash-btn')[3];
  showResidentSection('res-documents', btn);
  // Pre-select the card after section switches
  setTimeout(function() {
    var hidden = document.getElementById('docType');
    if (hidden) hidden.value = docType;
    var cards = document.querySelectorAll('.doc-type-card');
    cards.forEach(function(c) {
      if (c.getAttribute('data-value') === docType) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
    var indicator = document.getElementById('docTypeSelected');
    var label = document.getElementById('docTypeSelectedLabel');
    if (indicator) indicator.style.display = 'block';
    if (label) label.textContent = docType;
  }, 80);
}

/* =========================================
  ADMIN: DOCUMENT REQUESTS
========================================= */
function loadAdminRequests() {
  var tbody = document.getElementById('requestTable');
  if (!tbody) return;
  var requests = getData('clearanceRequests');
  // Show latest first
  var reversed = requests.slice().reverse();
  var indexMap = reversed.map(function(r) { return requests.indexOf(r); });
  if (requests.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No requests yet.</td></tr>'; return; }
  var html = '';
  for (var i = 0; i < reversed.length; i++) {
    var r = reversed[i];
    var realIdx = indexMap[i];
    var cls = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending';
    var action = r.status === 'Pending'
      ? '<button class="btn btn-success btn-sm approve-btn" data-i="'+realIdx+'" style="margin-right:4px;">Approve</button><button class="btn btn-danger btn-sm reject-btn" data-i="'+realIdx+'">Reject</button>'
      : '<span style="font-weight:600;">' + r.status + '</span>';

    // Uploaded images thumbnails
    var imgHtml = '';
    if (r.govIdData || r.cedulaData || r.sigData) {
      imgHtml += '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">';
      if (r.govIdData) {
        imgHtml += '<div style="text-align:center;">';
        if (r.govIdData.startsWith('data:image')) {
          imgHtml += '<img src="' + r.govIdData + '" onclick="adminViewDocImg(this.src,\'Gov\\\'t ID\')" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1.5px solid #b3d9f7;cursor:pointer;" title="View Gov\'t ID">';
        } else {
          imgHtml += '<a href="' + r.govIdData + '" target="_blank" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:#fde;border-radius:6px;border:1.5px solid #f9b3ad;" title="View Gov\'t ID PDF"><i class="fa-solid fa-file-pdf" style="color:#e53935;font-size:1.2rem;"></i></a>';
        }
        imgHtml += '<div style="font-size:9.5px;color:#aaa;margin-top:2px;">ID</div></div>';
      }
      if (r.cedulaData) {
        imgHtml += '<div style="text-align:center;">';
        if (r.cedulaData.startsWith('data:image')) {
          imgHtml += '<img src="' + r.cedulaData + '" onclick="adminViewDocImg(this.src,\'Cedula\')" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1.5px solid #b3d9f7;cursor:pointer;" title="View Cedula">';
        } else {
          imgHtml += '<a href="' + r.cedulaData + '" target="_blank" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:#fde;border-radius:6px;border:1.5px solid #f9b3ad;" title="View Cedula PDF"><i class="fa-solid fa-file-pdf" style="color:#e53935;font-size:1.2rem;"></i></a>';
        }
        imgHtml += '<div style="font-size:9.5px;color:#aaa;margin-top:2px;">Cedula</div></div>';
      }
      if (r.sigData) {
        imgHtml += '<div style="text-align:center;">';
        imgHtml += '<img src="' + r.sigData + '" onclick="adminViewDocImg(this.src,\'E-Signature\')" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1.5px solid #deb3f7;cursor:pointer;background:#f5f5f5;" title="View E-Signature">';
        imgHtml += '<div style="font-size:9.5px;color:#aaa;margin-top:2px;">Sig.</div></div>';
      }
      imgHtml += '</div>';
    }

    html += '<tr><td><strong>' + esc(r.fullname) + '</strong><br><small style="color:#aaa;">ID: ' + esc(r.userId||'') + '</small></td>';
    html += '<td>' + esc(r.docType || '—') + '</td>';
    html += '<td><span style="font-size:13px;">' + esc(r.purpose) + '</span>' + imgHtml + '</td>';
    html += '<td>' + (r.date||'—') + '</td>';
    html += '<td><span class="badge badge-' + cls + '">' + r.status + '</span>';
    if (r.status === 'Approved' && r.paymentMethod) {
      if (r.paymentStatus === 'pending') {
        html += '<br><span style="font-size:11px;color:#f57c00;font-weight:600;"><i class="fa-solid fa-hourglass-end"></i> Payment Pending</span>';
      } else if (r.paymentStatus === 'approved') {
        html += '<br><span style="font-size:11px;color:#43a047;font-weight:600;"><i class="fa-solid fa-circle-check"></i> Payment Approved</span>';
      } else if (r.paymentStatus === 'rejected') {
        html += '<br><span style="font-size:11px;color:#e53935;font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> Payment Rejected</span>';
      }
    } else if (r.status === 'Approved' && !r.paymentMethod) {
      html += '<br><span style="font-size:11px;color:#f57c00;font-weight:600;"><i class="fa-solid fa-clock"></i> Awaiting Payment</span>';
    }
    html += '</td><td>' + action + '</td></tr>';
  }
  tbody.innerHTML = html;
  tbody.querySelectorAll('.approve-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ updateRequest(parseInt(this.getAttribute('data-i')), 'Approved'); });
  });
  tbody.querySelectorAll('.reject-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ updateRequest(parseInt(this.getAttribute('data-i')), 'Rejected'); });
  });
}

function adminViewDocImg(src, label) {
  var existing = document.getElementById('adminDocImgModal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'adminDocImgModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = '<div style="background:#fff;border-radius:16px;overflow:hidden;max-width:90vw;max-height:90vh;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
    '<div style="background:linear-gradient(135deg,var(--navy),#1a4a7a);padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">' +
      '<span style="color:#fff;font-weight:700;font-size:14px;"><i class="fa-solid fa-image" style="margin-right:8px;"></i>' + esc(label) + '</span>' +
      '<button onclick="document.getElementById(\'adminDocImgModal\').remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;">&times;</button>' +
    '</div>' +
    '<div style="padding:16px;text-align:center;overflow:auto;max-height:80vh;">' +
      '<img src="' + src + '" style="max-width:100%;max-height:70vh;border-radius:8px;display:block;margin:0 auto;">' +
    '</div>' +
  '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function updateRequest(index, status) {
  var requests = getData('clearanceRequests');
  if (status === 'Rejected') {
    var note = prompt('Enter a reason for rejection (this will be shown to the resident):');
    if (note === null) return; // Admin clicked Cancel — do nothing
    requests[index].adminNote = note.trim() || 'Request was rejected by the administrator.';
  } else {
    requests[index].adminNote = '';
  }
  requests[index].status = status;
  setData('clearanceRequests', requests);
  loadAdminRequests();
}

function approvePayment(index) {
  var requests = getData('clearanceRequests');
  if (!requests[index]) return;
  requests[index].paymentStatus = 'approved';
  requests[index].paymentApprovedBy = getCurrentAdminName();
  requests[index].paymentApprovedDate = new Date().toLocaleDateString('en-PH');
  setData('clearanceRequests', requests);
  showToast('<strong>Payment approved!</strong> Resident can now access the document.', 'success');
  loadAdminRequests();
  loadAdminPayments();
}

function getCurrentAdminName() {
  var adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
  return adminProfile.displayName || 'Barangay Administration';
}

function rejectPayment(index) {
  if (!confirm('Reject this payment? The resident will need to resubmit.')) return;
  var requests = getData('clearanceRequests');
  if (!requests[index]) return;
  requests[index].paymentStatus = 'rejected';
  requests[index].paymentRef = null;
  setData('clearanceRequests', requests);
  showToast('<strong>Payment rejected.</strong> Resident notified.', 'info');
  loadAdminRequests();
  loadAdminPayments();
}

function loadAdminPayments() {
  var tbody = document.getElementById('adminPaymentsTable');
  if (!tbody) return;
  var requests = getData('clearanceRequests');
  var pending = requests.filter(function(r) { return r.paymentStatus === 'pending'; });

  if (pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;">No pending payments.</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < pending.length; i++) {
    var r = pending[i];
    var realIdx = requests.indexOf(r);

    // Build proof-of-payment cell
    var proofHtml = '';
    if (r.paymentProofImage) {
      var isImg = r.paymentProofImage.startsWith('data:image');
      if (isImg) {
        proofHtml =
          '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
          '<img src="' + r.paymentProofImage + '"' +
          ' onclick="adminViewDocImg(\'' + r.paymentProofImage.replace(/'/g,"\\'",'g') + '\',\'Payment Proof\')"' +
          ' style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:2px solid #b3d9f7;cursor:zoom-in;transition:transform .15s;"' +
          ' title="Click to view full image"' +
          ' onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'\'">' +
          '<span style="font-size:10px;color:#1e73be;font-weight:600;">View Proof</span></div>';
      } else {
        proofHtml =
          '<a href="' + r.paymentProofImage + '" target="_blank"' +
          ' style="display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;">' +
          '<div style="width:52px;height:52px;background:#fff5f5;border:2px solid #f9b3ad;border-radius:8px;display:flex;align-items:center;justify-content:center;">' +
          '<i class="fa-solid fa-file-pdf" style="color:#e53935;font-size:1.4rem;"></i></div>' +
          '<span style="font-size:10px;color:#e53935;font-weight:600;">View PDF</span></a>';
      }
    } else {
      proofHtml =
        '<span style="font-size:11.5px;color:#e74c3c;font-weight:600;background:#fff0f0;border:1px solid #f9b3ad;border-radius:6px;padding:4px 8px;display:inline-block;">' +
        '<i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i>No Proof</span>';
    }

    html += '<tr>';
    html += '<td><strong>' + esc(r.fullname) + '</strong><br><small style="color:#aaa;">ID: ' + esc(r.userId||'') + '</small></td>';
    html += '<td>' + esc(r.docType || '—') + '</td>';
    html += '<td>' + esc(r.paymentRef || '—') + '</td>';
    html += '<td>' + (r.paymentDate||'—') + '</td>';
    html += '<td style="text-align:center;">' + proofHtml + '</td>';
    html += '<td><span class="badge badge-warning"><i class="fa-solid fa-hourglass-end"></i> Pending</span></td>';
    html += '<td>';
    if (r.paymentProofImage) {
      html += '<button class="btn btn-success btn-sm" onclick="approvePayment(' + realIdx + ')" style="margin-right:4px;">Approve</button>';
      html += '<button class="btn btn-danger btn-sm" onclick="rejectPayment(' + realIdx + ')">Reject</button>';
    } else {
      html += '<button class="btn btn-success btn-sm" disabled title="No proof uploaded — cannot approve" style="margin-right:4px;opacity:.45;cursor:not-allowed;">Approve</button>';
      html += '<button class="btn btn-danger btn-sm" onclick="rejectPayment(' + realIdx + ')">Reject</button>';
      html += '<div style="font-size:10.5px;color:#e74c3c;margin-top:4px;">No proof uploaded</div>';
    }
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

/* =========================================
  PROJECT MONITORING
========================================= */

// Initialize project date inputs when adding a project
function initializeProjectDateInputs() {
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  var todayStr = yyyy + '-' + mm + '-' + dd;

  var startInput = document.getElementById('projectStart');
  var endInput = document.getElementById('projectEnd');

  if (startInput) {
    startInput.min = todayStr;
    startInput.addEventListener('input', function() {
      // When start date is set, update end date minimum
      if (this.value) {
        if (endInput) endInput.min = this.value;
      }
    });
  }

  if (endInput) {
    endInput.min = todayStr;
  }
}

// Validate project dates - called when dates change
function validateProjectDates() {
  var startInput = document.getElementById('projectStart');
  var endInput = document.getElementById('projectEnd');
  var alert = document.getElementById('project-alert');

  if (!startInput || !endInput) return;

  var startVal = startInput.value;
  var endVal = endInput.value;

  if (!alert) alert = document.createElement('div');

  // Clear previous error
  if (alert.classList.contains('alert-error')) {
    alert.style.display = 'none';
    alert.classList.remove('alert-error');
  }

  // If both dates are set, check that start is not after end
  if (startVal && endVal) {
    var startDate = new Date(startVal);
    var endDate = new Date(endVal);

    if (startDate > endDate) {
      showAlert('project-alert', 'End date must be after or equal to start date.', 'error');
      // Automatically clear the end date to force correction
      endInput.value = '';
    }
  }
}

function addProject() {
  var title  = document.getElementById('projectTitle').value.trim();
  var desc   = document.getElementById('projectDesc').value.trim();
  var start  = document.getElementById('projectStart').value;
  var end    = document.getElementById('projectEnd').value;
  var status = document.getElementById('projectStatus').value;
  if (!title) return showAlert('project-alert', 'Please enter a project title.', 'error');

  // Validate dates
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  var todayStr = yyyy + '-' + mm + '-' + dd;

  if (start && start < todayStr) {
    return showAlert('project-alert', 'Start date cannot be in the past.', 'error');
  }

  if (end && end < todayStr) {
    return showAlert('project-alert', 'End date cannot be in the past.', 'error');
  }

  if (start && end && new Date(start) > new Date(end)) {
    return showAlert('project-alert', 'End date must be after or equal to start date.', 'error');
  }

  var imgInput = document.getElementById('projectImage');
  function doSave(imageData) {
    var projects = getData('projects');
    projects.push({ title: title, desc: desc, start: start, end: end, status: status, image: imageData || null });
    setData('projects', projects);
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDesc').value  = '';
    document.getElementById('projectStart').value = '';
    document.getElementById('projectEnd').value   = '';
    if (imgInput) imgInput.value = '';
    var prev = document.getElementById('projectImgPreview');
    if (prev) prev.style.display = 'none';
    showAlert('project-alert', 'Project added!', 'success');
    setTimeout(function() {
      if (typeof closeAddProjectPanel === 'function') closeAddProjectPanel();
      if (typeof loadProjects === 'function') loadProjects();
      if (typeof showAdminSection === 'function') showAdminSection('projects', null);
    }, 900);
  }

  if (imgInput && imgInput.files && imgInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) { doSave(e.target.result); };
    reader.readAsDataURL(imgInput.files[0]);
  } else {
    doSave(null);
  }
}

function loadProjects() {
  var tbody = document.getElementById('projectTable');
  if (!tbody) return;
  var projects = getData('projects');
  if (projects.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No projects yet.</td></tr>'; return; }
  var html = '';
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    var cls = p.status === 'Completed' ? 'approved' : p.status === 'Ongoing' ? 'pending' : 'rejected';
    html += '<tr><td>' + esc(p.title) + '</td><td>' + esc(p.desc) + '</td><td>' + (p.start||'—') + '</td><td>' + (p.end||'—') + '</td>';
    html += '<td><span class="badge badge-' + cls + '">' + p.status + '</span></td>';
    html += '<td><button class="btn btn-danger btn-sm del-proj" data-i="' + i + '"><i class="fa-solid fa-trash"></i></button></td></tr>';
  }
  tbody.innerHTML = html;
  tbody.querySelectorAll('.del-proj').forEach(function(btn){
    btn.addEventListener('click', function(){
      var projects = getData('projects');
      projects.splice(parseInt(this.getAttribute('data-i')), 1);
      setData('projects', projects);
      loadProjects();
    });
  });
}

function loadProjectMonitoring() {
  var el = document.getElementById('projectMonitoringList');
  if (!el) return;
  var projects = getData('projects');
  if (projects.length === 0) { el.innerHTML = '<div class="card" style="color:#888;padding:20px 24px;width:100%;box-sizing:border-box;">No projects posted yet.</div>'; return; }
  var html = '';
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    var cls = p.status === 'Completed' ? 'approved' : p.status === 'Ongoing' ? 'pending' : 'rejected';
    var borderColor = p.status === 'Completed' ? '#2ecc71' : p.status === 'Ongoing' ? '#f39c12' : '#e74c3c';
    html += '<div class="proj-mon-card" style="border-left-color:' + borderColor + ';">';
    if (p.image) {
      html += '<img src="' + p.image + '" class="proj-mon-card-img" alt="Project photo">';
    }
    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">';
    html += '<div><strong style="color:var(--navy);font-size:1rem;">' + esc(p.title) + '</strong>';
    html += '<p style="color:#555;font-size:.88rem;margin-top:5px;line-height:1.6;">' + esc(p.desc) + '</p>';
    html += '<small style="color:#aaa;">' + (p.start||'') + (p.end?' – '+p.end:'') + '</small></div>';
    html += '<span class="badge badge-' + cls + '">' + p.status + '</span>';
    html += '</div></div>';
  }
  el.innerHTML = html;
}

/* =========================================
  PROFANITY FILTER
========================================= */
var BANNED_WORDS = [
  'putang','putangina','puta','gago','gaga','bobo','boba','ulol','tanga','tangina',
  'leche','kupal','pakyu','pakyo','pakshet','bwisit','yawa','inamo','inutil',
  'iyot','jakol','kantot','tarantado','hinayupak','hayop','siraulo','peste',
  'damn','shit','fuck','ass','bitch','bastard','crap','dick','cock','pussy',
  'asshole','motherfucker','bullshit','wtf','stfu'
];

function filterProfanity(text) {
  var result = text;
  BANNED_WORDS.forEach(function(word) {
    var re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
    result = result.replace(re, function(m) { return '*'.repeat(m.length); });
  });
  return result;
}

function hasProfanity(text) {
  var lower = text.toLowerCase();
  return BANNED_WORDS.some(function(w){ return lower.indexOf(w) !== -1; });
}

/* =========================================
  FORUM
========================================= */
function postForum() {
  var subject = document.getElementById('forumSubject').value.trim();
  var message = document.getElementById('forumMessage').value.trim();
  if (!subject || !message) return showAlert('forum-alert', 'Please fill in both fields.', 'error');
  if (hasProfanity(subject) || hasProfanity(message)) {
    return showAlert('forum-alert', 'Your post contains inappropriate language. Please keep the forum respectful.', 'error');
  }
  var user  = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var posts = getData('forumPosts');
  posts.unshift({ subject: filterProfanity(subject), message: filterProfanity(message), author: user ? getFullName(user) : 'Anonymous', date: new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}), status: 'pending' });
  setData('forumPosts', posts);
  document.getElementById('forumSubject').value = '';
  document.getElementById('forumMessage').value = '';
  showAlert('forum-alert', '✅ Post submitted! It will appear in the forum once approved by the admin.', 'success');
  showToast('Your forum post has been submitted for review!', 'success');
  loadForum();
}

function loadForum() {
  var display = document.getElementById('forumDisplay');
  if (!display) return;
  var allPosts = getData('forumPosts');
  // Only show approved resident posts and all admin posts
  var posts = allPosts.filter(function(p) {
    if (p.role === 'admin') return true;
    return p.status === 'approved';
  });
  if (posts.length === 0) {
    display.innerHTML = '<div style="text-align:center;padding:32px 0;color:#aaa;"><i class="fa-solid fa-comments" style="font-size:2.5rem;display:block;margin-bottom:12px;opacity:.3;"></i><p style="font-size:14px;">No approved posts yet. Be the first to share a concern or suggestion!</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    var isAdmin = p.role === 'admin';
    var accentColor = isAdmin ? 'var(--blue)' : 'var(--orange)';
    var tagBg = isAdmin ? 'rgba(30,115,190,0.10)' : 'rgba(245,124,0,0.10)';
    var tagLabel = isAdmin ? 'Official' : 'Resident';
    var initial = isAdmin ? 'A' : (p.author||'R').charAt(0).toUpperCase();
    var avatarBg = isAdmin ? 'var(--navy)' : 'var(--orange)';
    html += '<div class="forum-post-card hoverable-card" style="border-left:4px solid ' + accentColor + ';cursor:pointer;position:relative;" onclick="openResidentForumPost(' + i + ')" title="Click to read full post">';
    html += '<div style="display:flex;align-items:flex-start;gap:14px;">';
    html += '<div style="width:40px;height:40px;border-radius:50%;background:' + avatarBg + ';display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:15px;flex-shrink:0;">' + initial + '</div>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">';
    html += '<span style="font-size:11px;font-weight:600;padding:2px 9px;border-radius:20px;background:' + tagBg + ';color:' + accentColor + ';">' + tagLabel + '</span>';
    html += '<span style="font-size:11px;color:#bbb;">' + esc(p.date||'') + '</span>';
    html += '</div>';
    html += '<div style="font-weight:700;color:var(--navy);font-size:.95rem;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(p.subject||'(No Subject)') + '</div>';
    html += '<div style="font-size:13.5px;color:#555;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + esc(p.message||p.content||'') + '</div>';
    html += '<div style="font-size:12px;color:var(--gray);margin-top:8px;display:flex;align-items:center;justify-content:space-between;">';
    html += '<span><i class="fa-solid fa-user" style="margin-right:5px;opacity:.5;"></i>' + esc(p.author||'Anonymous') + '</span>';
    html += '<span style="font-size:11px;color:var(--blue);font-weight:600;">Read more <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></span>';
    html += '</div>';
    html += '</div></div></div>';
  }
  display.innerHTML = html;
  // Store filtered posts for modal access
  display._forumPosts = posts;
}

function openResidentForumPost(idx) {
  var display = document.getElementById('forumDisplay');
  var posts = display && display._forumPosts;
  if (!posts || !posts[idx]) return;
  var p = posts[idx];
  var isAdmin = p.role === 'admin';
  var accentColor = isAdmin ? 'var(--blue)' : 'var(--orange)';
  var tagBg = isAdmin ? 'rgba(30,115,190,0.10)' : 'rgba(245,124,0,0.10)';
  var tagLabel = isAdmin ? 'Official' : 'Resident';
  var initial = isAdmin ? 'A' : (p.author||'R').charAt(0).toUpperCase();
  var avatarBg = isAdmin ? 'var(--navy)' : 'var(--orange)';

  var existing = document.getElementById('resForumPostModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'resForumPostModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML =
    '<div style="background:#fff;border-radius:18px;max-width:560px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.22);overflow:hidden;">' +
      // Header bar
      '<div style="padding:20px 24px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:' + avatarBg + ';display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:17px;flex-shrink:0;">' + initial + '</div>' +
          '<div>' +
            '<div style="font-weight:700;font-size:14px;color:var(--navy);">' + esc(p.author||'Anonymous') + '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:3px;">' +
              '<span style="font-size:11px;font-weight:600;padding:2px 9px;border-radius:20px;background:' + tagBg + ';color:' + accentColor + ';">' + tagLabel + '</span>' +
              '<span style="font-size:11px;color:#bbb;">' + esc(p.date||'') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button onclick="document.getElementById(\'resForumPostModal\').remove()" style="width:34px;height:34px;border-radius:50%;border:none;background:#f5f5f5;color:#888;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;" onmouseover="this.style.background=\'#eee\'" onmouseout="this.style.background=\'#f5f5f5\'">&times;</button>' +
      '</div>' +
      // Subject
      '<div style="padding:18px 24px 0;flex-shrink:0;">' +
        '<div style="font-size:1.1rem;font-weight:800;color:var(--navy);line-height:1.3;border-left:4px solid ' + accentColor + ';padding-left:12px;">' + esc(p.subject||'(No Subject)') + '</div>' +
      '</div>' +
      // Scrollable body
      '<div style="padding:16px 24px 24px;overflow-y:auto;flex:1;line-height:1.8;font-size:14px;color:#444;white-space:pre-wrap;word-break:break-word;">' +
        esc(p.message||p.content||'') +
      '</div>' +
    '</div>';

  // Close on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  document.body.appendChild(modal);
}

var _adminForumPage = 0;
var _adminForumPageSize = 6;

function loadAdminForum(page) {
  var el = document.getElementById('adminForumDisplay');
  if (!el) return;
  if (typeof page === 'number') _adminForumPage = page;
  var posts = getData('forumPosts');
  // Migrate legacy posts: admin posts are auto-approved, resident posts default to pending
  var migrated = false;
  posts.forEach(function(p) {
    if (!p.status) {
      p.status = (p.role === 'admin') ? 'approved' : 'pending';
      migrated = true;
    }
  });
  if (migrated) setData('forumPosts', posts);
  if (posts.length === 0) { el.innerHTML = '<div style="color:#888;padding:20px 0;">No posts yet.</div>'; return; }

  var totalPages = Math.ceil(posts.length / _adminForumPageSize);
  if (_adminForumPage >= totalPages) _adminForumPage = totalPages - 1;
  if (_adminForumPage < 0) _adminForumPage = 0;

  var start = _adminForumPage * _adminForumPageSize;
  var pagePosts = posts.slice(start, start + _adminForumPageSize);

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:18px;">';
  pagePosts.forEach(function(p, pi) {
    var realIdx = start + pi;
    var isAdmin = p.role === 'admin';
    var accentColor = isAdmin ? 'var(--blue)' : (p.status === 'approved' ? '#27ae60' : p.status === 'rejected' ? '#e74c3c' : 'var(--orange)');
    var tagBg = isAdmin ? 'rgba(30,115,190,0.12)' : (p.status === 'approved' ? 'rgba(39,174,96,0.12)' : p.status === 'rejected' ? 'rgba(231,76,60,0.12)' : 'rgba(245,124,0,0.12)');
    var statusLabel = isAdmin ? '🛡️ Official' : (p.status === 'approved' ? '✓ Approved' : p.status === 'rejected' ? '✗ Rejected' : '⏳ Pending');
    html += '<div class="admin-forum-card hoverable-card" style="border-left:4px solid ' + accentColor + ';display:flex;flex-direction:column;" onclick="openAdminForumPost(' + realIdx + ')" title="Click to view full post">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">';
    html += '<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:' + tagBg + ';color:' + accentColor + ';">' + statusLabel + '</span>';
    html += '<button class="btn btn-danger btn-sm del-post" data-i="' + realIdx + '" onclick="event.stopPropagation();adminDeleteForumPost(' + realIdx + ')" style="padding:3px 9px;font-size:11px;"><i class="fa-solid fa-trash"></i></button>';
    html += '</div>';
    html += '<div style="font-weight:700;color:var(--navy);font-size:.95rem;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(p.subject||'(No Subject)') + '</div>';
    html += '<div style="font-size:12.5px;color:#555;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;flex:1;">' + esc(p.message||p.content||'') + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;margin-bottom:10px;">';
    html += '<span style="font-size:11.5px;color:var(--gray);">' + esc(p.author||'Unknown') + '</span>';
    html += '<span style="font-size:11px;color:#bbb;">' + esc(p.date||'') + '</span>';
    html += '</div>';
    if (!isAdmin) {
      html += '<div style="display:flex;gap:7px;margin-top:auto;padding-top:10px;border-top:1px solid #f0f0f0;" onclick="event.stopPropagation()">';
      if (p.status !== 'approved') {
        html += '<button onclick="event.stopPropagation();adminForumQuickAction(' + realIdx + ',\'approved\')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:8px;border:none;background:linear-gradient(135deg,#27ae60,#1e8449);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s;" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'"><i class="fa-solid fa-circle-check"></i> Approve</button>';
      } else {
        html += '<button disabled style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:8px;border:none;background:#e9f7ef;color:#27ae60;font-size:12px;font-weight:600;cursor:default;font-family:inherit;opacity:.7;"><i class="fa-solid fa-circle-check"></i> Approved</button>';
      }
      if (p.status !== 'rejected') {
        html += '<button onclick="event.stopPropagation();adminForumQuickAction(' + realIdx + ',\'rejected\')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:8px;border:1.5px solid #e74c3c;background:#fff;color:#e74c3c;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;" onmouseover="this.style.background=\'#e74c3c\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#fff\';this.style.color=\'#e74c3c\'"><i class="fa-solid fa-circle-xmark"></i> Reject</button>';
      } else {
        html += '<button disabled style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:8px;border:1.5px solid #e74c3c;background:#fdf0ef;color:#e74c3c;font-size:12px;font-weight:600;cursor:default;font-family:inherit;opacity:.7;"><i class="fa-solid fa-circle-xmark"></i> Rejected</button>';
      }
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  // Pagination
  if (totalPages > 1) {
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;">';
    html += '<button class="btn btn-secondary btn-sm" onclick="loadAdminForum(' + (_adminForumPage-1) + ')" ' + (_adminForumPage===0?'disabled':'') + '><i class="fa-solid fa-chevron-left"></i> Prev</button>';
    html += '<span style="font-size:13px;color:var(--gray);">Page ' + (_adminForumPage+1) + ' of ' + totalPages + '</span>';
    html += '<button class="btn btn-secondary btn-sm" onclick="loadAdminForum(' + (_adminForumPage+1) + ')" ' + (_adminForumPage===totalPages-1?'disabled':'') + '>Next <i class="fa-solid fa-chevron-right"></i></button>';
    html += '</div>';
  }

  el.innerHTML = html;
}

function adminDeleteForumPost(idx) {
  if (!confirm('Delete this post?')) return;
  var posts = getData('forumPosts');
  posts.splice(idx, 1);
  setData('forumPosts', posts);
  loadAdminForum(_adminForumPage);
}

function adminForumQuickAction(idx, status) {
  var posts = getData('forumPosts');
  if (!posts[idx]) return;
  if (status === 'rejected') {
    if (!confirm('Reject and remove this post? This cannot be undone.')) return;
    posts.splice(idx, 1);
    setData('forumPosts', posts);
    loadAdminForum(_adminForumPage);
    showToast('Post rejected and removed.', 'error');
  } else {
    posts[idx].status = 'approved';
    setData('forumPosts', posts);
    loadAdminForum(_adminForumPage);
    showToast('Post approved — now visible to residents.', 'success');
  }
}

/* Admin forum post modal — approve/reject */
function openAdminForumPost(idx) {
  var posts = getData('forumPosts');
  var p = posts[idx];
  if (!p) return;
  var existing = document.getElementById('adminForumModal');
  if (existing) existing.remove();

  var isAdmin = p.role === 'admin';
  var currentStatus = p.status || (isAdmin ? 'approved' : 'pending');
  var statusColor = currentStatus === 'approved' ? '#27ae60' : currentStatus === 'rejected' ? '#e74c3c' : '#f39c12';
  var statusLabel = currentStatus === 'approved' ? '✓ Approved' : currentStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending Review';

  var modal = document.createElement('div');
  modal.id = 'adminForumModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  var actionBtns = '';
  if (!isAdmin) {
    if (currentStatus !== 'approved') {
      actionBtns += '<button class="btn btn-primary" style="flex:1;background:linear-gradient(135deg,#27ae60,#1e8449);border-color:#27ae60;" onclick="setForumPostStatus(' + idx + ',\'approved\')"><i class="fa-solid fa-circle-check"></i> Approve</button>';
    }
    if (currentStatus !== 'rejected') {
      actionBtns += '<button class="btn btn-danger" style="flex:1;" onclick="setForumPostStatus(' + idx + ',\'rejected\')"><i class="fa-solid fa-circle-xmark"></i> Reject</button>';
    }
  }
  actionBtns += '<button class="btn btn-secondary" onclick="document.getElementById(\'adminForumModal\').remove()"><i class="fa-solid fa-xmark"></i> Close</button>';

  modal.innerHTML =
    '<div style="background:#fff;border-radius:16px;padding:28px;max-width:540px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.28);max-height:90vh;overflow-y:auto;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">' +
        '<h3 style="color:var(--navy);font-size:1.1rem;"><i class="fa-solid fa-comments" style="color:var(--blue);margin-right:8px;"></i>Forum Post Review</h3>' +
        '<button onclick="document.getElementById(\'adminForumModal\').remove()" style="background:none;border:none;font-size:20px;color:#aaa;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;padding:10px 14px;background:#f8f9fa;border-radius:10px;border:1px solid #e9ecef;">' +
        '<div style="width:38px;height:38px;border-radius:50%;background:' + (isAdmin ? 'var(--navy)' : 'var(--orange)') + ';display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:15px;flex-shrink:0;">' + esc((p.author||'?').charAt(0).toUpperCase()) + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:600;font-size:13px;color:var(--navy);">' + esc(p.author||'Anonymous') + (isAdmin ? ' <span style="font-size:11px;background:rgba(30,115,190,0.12);color:var(--blue);padding:2px 7px;border-radius:20px;">Admin</span>' : '') + '</div>' +
          '<div style="font-size:12px;color:#999;">' + esc(p.date||'') + '</div>' +
        '</div>' +
        '<span style="font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:' + (currentStatus === 'approved' ? 'rgba(39,174,96,0.12)' : currentStatus === 'rejected' ? 'rgba(231,76,60,0.12)' : 'rgba(243,156,18,0.12)') + ';color:' + statusColor + ';">' + statusLabel + '</span>' +
      '</div>' +
      '<div style="margin-bottom:14px;">' +
        '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#aaa;margin-bottom:5px;">Subject</div>' +
        '<div style="font-weight:700;color:var(--navy);font-size:1rem;">' + esc(p.subject||'(No Subject)') + '</div>' +
      '</div>' +
      '<div style="margin-bottom:20px;">' +
        '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#aaa;margin-bottom:5px;">Message</div>' +
        '<div style="font-size:14px;color:#444;line-height:1.7;background:#f8f9fa;border-radius:10px;padding:14px 16px;border:1px solid #e9ecef;">' + esc(p.message||p.content||'') + '</div>' +
      '</div>' +
      (isAdmin ? '' : '<div style="background:linear-gradient(135deg,#fff8ef,#fdebd0);border:1px solid #f5d5a0;border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:12.5px;color:#7d5a00;"><i class="fa-solid fa-circle-info" style="margin-right:6px;"></i>Approving this post will make it visible to all residents in the Community Forum. Rejecting will hide it from residents.</div>') +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' + actionBtns + '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function setForumPostStatus(idx, status) {
  var posts = getData('forumPosts');
  if (!posts[idx]) return;
  if (status === 'rejected') {
    // Rejecting a post permanently deletes it
    posts.splice(idx, 1);
    setData('forumPosts', posts);
    document.getElementById('adminForumModal').remove();
    loadAdminForum(_adminForumPage);
    showToast('Post rejected and removed.', 'error');
  } else {
    posts[idx].status = status;
    setData('forumPosts', posts);
    document.getElementById('adminForumModal').remove();
    loadAdminForum(_adminForumPage);
    showToast('Post approved successfully.', 'success');
  }
}

/* =========================================
  COURT SCHEDULE — ADMIN
========================================= */
function addCourtSchedule() {
  var title    = document.getElementById('courtTitle').value.trim();
  var activity = document.getElementById('courtActivity').value.trim();
  var date     = document.getElementById('courtDate').value;
  var timeFrom = document.getElementById('courtTimeFrom').value;
  var timeTo   = document.getElementById('courtTimeTo').value;
  var notes    = document.getElementById('courtNotes').value.trim();
  if (!title || !date || !timeFrom) return showAlert('court-alert', 'Please fill in required fields.', 'error');

  // Enforce court hours: 7 AM – 9 PM
  var fromH = parseInt(timeFrom.split(':')[0], 10);
  if (fromH < 7) return showAlert('court-alert', '⚠️ Court schedules must start at 7:00 AM or later.', 'error');
  if (timeTo) {
    var toH = parseInt(timeTo.split(':')[0], 10);
    if (toH > 21 || (toH === 21 && parseInt(timeTo.split(':')[1], 10) > 0))
      return showAlert('court-alert', '⚠️ Court schedules must end by 9:00 PM.', 'error');
  }

  // Block past dates
  var today = new Date(); today.setHours(0,0,0,0);
  var chosen = new Date(date + 'T00:00:00');
  if (chosen < today) return showAlert('court-alert', '⚠️ You cannot post a schedule for a past date.', 'error');

  // Check time conflict with existing schedules on same date
  var schedules = getData('courtSchedules');
  if (timeTo) {
    var conflict = schedules.find(function(s) {
      if (s.date !== date) return false;
      var aFrom = timeFrom, aTo = timeTo || timeFrom;
      var bFrom = s.timeFrom, bTo = s.timeTo || s.timeFrom;
      return !(aTo <= bFrom || bTo <= aFrom);
    });
    if (conflict) return showAlert('court-alert', '⚠️ This time slot conflicts with an existing schedule: "' + conflict.title + '" (' + conflict.timeFrom + (conflict.timeTo ? ' – ' + conflict.timeTo : '') + '). Please choose a different time.', 'error');
  }

  schedules.push({ id: Date.now(), title: title, activity: activity, date: date, timeFrom: timeFrom, timeTo: timeTo, notes: notes, postedDate: new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}) });
  setData('courtSchedules', schedules);
  document.getElementById('courtTitle').value = '';
  document.getElementById('courtActivity').value = '';
  document.getElementById('courtDate').value = '';
  document.getElementById('courtTimeFrom').value = '';
  document.getElementById('courtTimeTo').value = '';
  document.getElementById('courtNotes').value = '';
  showAlert('court-alert', 'Court schedule posted!', 'success');
  loadAdminCourtSchedules();
}

function loadAdminCourtSchedules() {
  var tbody = document.getElementById('courtScheduleTable');
  if (!tbody) return;
  var schedules = getData('courtSchedules');
  var requests  = getData('courtRequests');
  if (schedules.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;">No schedules posted yet.</td></tr>'; return; }
  schedules.sort(function(a,b){ return a.date > b.date ? 1 : -1; });
  var today = new Date(); today.setHours(0,0,0,0);
  var html = '';
  for (var i = 0; i < schedules.length; i++) {
    var s = schedules[i];
    var isPast = new Date(s.date + 'T00:00:00') < today;
    var reqsForSlot   = requests.filter(function(r){ return r.scheduleId === s.id; });
    var approvedReq   = reqsForSlot.find(function(r){ return r.status === 'Approved'; });
    var pendingCount  = reqsForSlot.filter(function(r){ return r.status === 'Pending'; }).length;
    html += '<tr' + (isPast ? ' style="opacity:0.5;"' : '') + '>';
    html += '<td>' + esc(s.title) + (isPast ? ' <span style="font-size:11px;color:#aaa;">(past)</span>' : '') + '</td>';
    html += '<td>' + esc(s.activity||'—') + '</td>';
    html += '<td>' + s.date + '</td>';
    html += '<td>' + s.timeFrom + (s.timeTo ? ' – ' + s.timeTo : '') + '</td>';
    html += '<td>₱' + (s.timeTo ? (((parseInt(s.timeTo.split(':')[0])*60+parseInt(s.timeTo.split(':')[1])) - (parseInt(s.timeFrom.split(':')[0])*60+parseInt(s.timeFrom.split(':')[1])))/60*300).toLocaleString() : '300') + '</td>';
    html += '<td>' + esc(s.notes||'—') + '</td>';
    html += '<td style="white-space:nowrap;">';
    if (approvedReq) {
      html += '<span class="badge badge-approved" style="margin-right:4px;"><i class="fa-solid fa-lock"></i> Booked</span>';
      if (approvedReq.paymentStatus === 'Paid') html += '<span class="badge badge-approved"><i class="fa-solid fa-circle-check"></i> Paid</span>';
      else html += '<span class="badge badge-pending">Unpaid</span>';
    } else {
      if (pendingCount > 0) html += '<span class="badge badge-pending" style="margin-right:4px;">' + pendingCount + ' Pending</span>';
      html += '<span class="badge" style="background:rgba(46,204,113,0.15);color:#2ecc71;border:1px solid rgba(46,204,113,0.3);">Available</span>';
    }
    html += ' <button class="btn btn-danger btn-sm del-court" data-i="' + i + '" style="margin-left:4px;"><i class="fa-solid fa-trash"></i></button>';
    html += '</td></tr>';
  }
  tbody.innerHTML = html;
  tbody.querySelectorAll('.del-court').forEach(function(btn){
    btn.addEventListener('click', function(){
      var schedules = getData('courtSchedules');
      schedules.splice(parseInt(this.getAttribute('data-i')), 1);
      setData('courtSchedules', schedules);
      loadAdminCourtSchedules();
    });
  });
}

function loadAdminCourtRequests() {
  var el = document.getElementById('courtRequestsList');
  if (!el) return;
  var requests = getData('courtRequests');
  if (requests.length === 0) { el.innerHTML = '<p style="color:#888;padding:16px 0;">No court requests yet.</p>'; return; }
  var schedules = getData('courtSchedules');
  var html = '<table><thead><tr><th>Resident</th><th>Schedule</th><th>Purpose</th><th>Date Filed</th><th>Fee</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead><tbody>';
  for (var i = 0; i < requests.length; i++) {
    var r = requests[i];
    var sched = schedules.find(function(s){ return s.id === r.scheduleId; }) || {};
    var cls = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending';
    var fee = r.fee ? '₱' + r.fee.toLocaleString() : '₱300';
    var payBadge = r.paymentStatus === 'Paid'
      ? '<span class="badge badge-approved"><i class="fa-solid fa-circle-check"></i> Paid' + (r.paymentRef ? '<br><small>' + esc(r.paymentRef) + '</small>' : '') + '</span>' +
        (r.paymentProof
          ? (r.paymentProof.startsWith('data:image')
              ? '<br><img src="' + r.paymentProof + '" style="margin-top:6px;max-width:80px;max-height:60px;border-radius:6px;border:1px solid #b3d9f7;cursor:pointer;display:block;" onclick="adminViewDocImg(\'' + r.paymentProof.replace(/'/g,"\\'") + '\',\'Payment Proof\')" title="Click to enlarge">'
              : '<br><a href="' + r.paymentProof + '" target="_blank" style="font-size:11px;color:var(--blue);"><i class="fa-solid fa-file-pdf"></i> ' + esc(r.paymentProofName || 'proof.pdf') + '</a>')
          : '')
      : (r.status === 'Approved' ? '<span class="badge badge-pending">Unpaid</span>' : '—');

    // Check for time conflict before allowing approval
    var slotConflict = false;
    var rDate = r.date_iso || sched.date;
    var rFrom = r.timeFrom || sched.timeFrom;
    var rTo   = r.timeTo   || sched.timeTo;
    if (rDate && rFrom && rTo) {
      slotConflict = requests.some(function(rr) {
        if (rr === r || rr.status !== 'Approved') return false;
        var rrDate = rr.date_iso || (schedules.find(function(s){ return s.id === rr.scheduleId; }) || {}).date;
        var rrFrom = rr.timeFrom || (schedules.find(function(s){ return s.id === rr.scheduleId; }) || {}).timeFrom;
        var rrTo   = rr.timeTo   || (schedules.find(function(s){ return s.id === rr.scheduleId; }) || {}).timeTo;
        if (rrDate !== rDate || !rrFrom || !rrTo) return false;
        var aFrom = parseInt(rFrom.split(':')[0])*60+parseInt(rFrom.split(':')[1]);
        var aTo   = parseInt(rTo.split(':')[0])*60+parseInt(rTo.split(':')[1]);
        var bFrom = parseInt(rrFrom.split(':')[0])*60+parseInt(rrFrom.split(':')[1]);
        var bTo   = parseInt(rrTo.split(':')[0])*60+parseInt(rrTo.split(':')[1]);
        return !(aTo <= bFrom || bTo <= aFrom);
      });
    }

    var action;
    if (r.status === 'Pending') {
      if (slotConflict) {
        action = '<button class="btn btn-danger btn-sm auto-reject-court" data-i="'+i+'" title="Time conflict with approved booking"><i class="fa-solid fa-ban"></i> Conflict</button>';
      } else {
        action = '<button class="btn btn-success btn-sm approve-court" data-i="'+i+'" style="margin-right:4px;">Approve</button><button class="btn btn-danger btn-sm reject-court" data-i="'+i+'">Reject</button>';
      }
    } else {
      action = '<span style="font-weight:600;">' + r.status + '</span>';
    }
    var dateDisplay = r.date_iso || sched.date || '—';
    var timeDisplay = (r.timeFrom || sched.timeFrom || '—') + ((r.timeTo || sched.timeTo) ? ' – ' + (r.timeTo || sched.timeTo) : '');
    html += '<tr' + (slotConflict && r.status==='Pending' ? ' style="background:rgba(231,76,60,0.07);"' : '') + '>';
    html += '<td>' + esc(r.fullname) + '</td>';
    html += '<td><strong>' + esc(dateDisplay) + '</strong><br><small style="color:var(--gray);">' + esc(timeDisplay) + '</small>' + (sched.title ? '<br><small style="color:#aaa;">' + esc(sched.title) + '</small>' : '') + '</td>';
    html += '<td>' + esc(r.purpose) + '</td><td>' + (r.date||'—') + '</td>';
    html += '<td style="font-weight:700;color:var(--blue);">' + fee + '</td>';
    html += '<td><span class="badge badge-' + cls + '">' + r.status + '</span>';
    if (slotConflict && r.status === 'Pending') html += '<br><span style="color:#e74c3c;font-size:11px;">⚠️ Time Conflict</span>';
    html += '</td>';
    html += '<td>' + payBadge + '</td>';
    html += '<td>' + action + '</td></tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;

  el.querySelectorAll('.approve-court').forEach(function(btn){
    btn.addEventListener('click', function(){
      var i = parseInt(this.getAttribute('data-i'));
      var reqs = getData('courtRequests');
      var r = reqs[i];
      var scheds = getData('courtSchedules');
      var sched = r.scheduleId ? scheds.find(function(s){ return s.id === r.scheduleId; }) : null;
      var rDate = r.date_iso || (sched && sched.date);
      var rFrom = r.timeFrom || (sched && sched.timeFrom);
      var rTo   = r.timeTo   || (sched && sched.timeTo);
      var conflict = reqs.some(function(rr, ii) {
        if (ii === i || rr.status !== 'Approved') return false;
        var rrSched = rr.scheduleId ? scheds.find(function(s){ return s.id === rr.scheduleId; }) : null;
        var rrDate = rr.date_iso || (rrSched && rrSched.date);
        var rrFrom = rr.timeFrom || (rrSched && rrSched.timeFrom);
        var rrTo   = rr.timeTo   || (rrSched && rrSched.timeTo);
        if (!rrDate || rrDate !== rDate || !rrFrom || !rrTo || !rFrom || !rTo) return false;
        var aFrom = parseInt(rFrom.split(':')[0])*60+parseInt(rFrom.split(':')[1]);
        var aTo   = parseInt(rTo.split(':')[0])*60+parseInt(rTo.split(':')[1]);
        var bFrom = parseInt(rrFrom.split(':')[0])*60+parseInt(rrFrom.split(':')[1]);
        var bTo   = parseInt(rrTo.split(':')[0])*60+parseInt(rrTo.split(':')[1]);
        return !(aTo <= bFrom || bTo <= aFrom);
      });
      if (conflict) {
        alert('⚠️ Cannot approve — this time slot conflicts with an already-approved booking. Please reject this request instead.');
        return;
      }
      reqs[i].status = 'Approved';
      setData('courtRequests', reqs);
      // Auto-create a courtSchedules entry for free-form requests so calendar shows it
      ensureCourtScheduleEntry(reqs[i]);
      loadAdminCourtRequests();
      refreshCourtCalendars();
    });
  });
  el.querySelectorAll('.reject-court').forEach(function(btn){
    btn.addEventListener('click', function(){
      var reqs = getData('courtRequests');
      reqs[parseInt(this.getAttribute('data-i'))].status = 'Rejected';
      setData('courtRequests', reqs);
      loadAdminCourtRequests();
    });
  });
  el.querySelectorAll('.auto-reject-court').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (!confirm('This slot is already taken. Reject this request?')) return;
      var reqs = getData('courtRequests');
      reqs[parseInt(this.getAttribute('data-i'))].status = 'Rejected';
      setData('courtRequests', reqs);
      loadAdminCourtRequests();
    });
  });
}

/* =========================================
  COURT SCHEDULE — RESIDENT
========================================= */
function loadCourtSchedule() {
  var el = document.getElementById('courtScheduleList');
  if (!el) return;
  var schedules = getData('courtSchedules');
  var requests  = getData('courtRequests');
  var today = new Date(); today.setHours(0,0,0,0);

  // Only show future/today schedules to residents
  var upcoming = schedules.filter(function(s) {
    var d = new Date(s.date + 'T00:00:00');
    return d >= today;
  });

  if (upcoming.length === 0) { el.innerHTML = '<div class="card" style="color:#888;padding:20px;">No upcoming court schedules. Check back later.</div>'; return; }
  upcoming.sort(function(a,b){ return a.date > b.date ? 1 : -1; });
  var html = '';
  for (var i = 0; i < upcoming.length; i++) {
    var s = upcoming[i];
    // Check if this slot already has an APPROVED request (taken)
    var approvedReq = requests.find(function(r){ return r.scheduleId === s.id && r.status === 'Approved'; });
    var isTaken = !!approvedReq;
    html += '<div class="court-card' + (isTaken ? ' court-card-taken' : '') + '">';
    html += '<div class="court-card-header"><i class="fa-solid fa-basketball"></i><div>';
    html += '<strong>' + esc(s.title) + '</strong>';
    if (s.activity) html += '<span class="court-activity">' + esc(s.activity) + '</span>';
    html += '</div></div>';
    html += '<div class="court-card-meta">';
    html += '<span><i class="fa-solid fa-calendar"></i> ' + s.date + '</span>';
    html += '<span><i class="fa-solid fa-clock"></i> ' + s.timeFrom + (s.timeTo ? ' – ' + s.timeTo : '') + '</span>';
    html += '<span><i class="fa-solid fa-peso-sign"></i> ₱' + getCourtRate().toLocaleString() + '/hr</span>';
    html += '</div>';
    if (s.notes) html += '<p class="court-notes">' + esc(s.notes) + '</p>';
    if (isTaken) {
      html += '<div class="court-taken-badge"><i class="fa-solid fa-lock"></i> Slot Already Taken</div>';
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

/* ── Duration +/- button helpers ── */
function adjustResDuration(delta) {
  var el = document.getElementById('courtReqDuration');
  if (!el) return;
  var cur = parseInt(el.value || '0', 10);
  if (isNaN(cur) || cur < 1) cur = 0;
  var next = Math.max(1, cur + delta);
  el.value = next;
  calcCourtFee(); // triggers syncCourtReqTimeTo + fee update
}

function adjustAdminDuration(delta) {
  var el = document.getElementById('courtDuration');
  if (!el) return;
  var cur = parseInt(el.value || '0', 10);
  if (isNaN(cur) || cur < 1) cur = 0;
  var next = Math.max(1, cur + delta);
  el.value = next;
  syncAdminCourtTimeTo();
}

/* Open modal from "Schedule Court" button (no pre-selected slot) */
function openCourtRequestDirect() {
  var modal = document.getElementById('courtRequestModal');
  if (!modal) return;

  // Set today as min date
  var today = new Date();
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var dd = String(today.getDate()).padStart(2,'0');
  var todayStr = today.getFullYear() + '-' + mm + '-' + dd;

  document.getElementById('courtReqScheduleId').value = '';
  document.getElementById('courtReqDate').value = '';
  document.getElementById('courtReqDate').min  = todayStr;
  document.getElementById('courtReqTimeFrom').value = '';
  document.getElementById('courtReqTimeTo').value   = '';
  document.getElementById('courtReqPurpose').value  = '';
  var durEl = document.getElementById('courtReqDuration');
  if (durEl) durEl.value = '';

  var slotInfo = document.getElementById('courtReqSlotInfo');
  if (slotInfo) slotInfo.style.display = 'none';

  var feeCard = document.getElementById('courtFeeCard');
  if (feeCard) feeCard.style.display = 'none';

  var alertEl = document.getElementById('court-req-alert');
  if (alertEl) alertEl.className = 'alert';

  modal.classList.add('open');
  // Always scroll modal content to top so form is visible immediately
  var box = modal.querySelector('.modal-box');
  if (box) box.scrollTop = 0;
}

/* Open modal pre-filled from a specific schedule slot card */
function openCourtRequest(scheduleId, title, date) {
  var modal = document.getElementById('courtRequestModal');
  if (!modal) return;

  var today = new Date();
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var dd = String(today.getDate()).padStart(2,'0');
  var todayStr = today.getFullYear() + '-' + mm + '-' + dd;

  document.getElementById('courtReqScheduleId').value = scheduleId;
  document.getElementById('courtReqDate').value = date;
  document.getElementById('courtReqDate').min   = todayStr;
  document.getElementById('courtReqDate').readOnly = true;

  // Pre-fill times from schedule
  var schedules = getData('courtSchedules');
  var sched = schedules.find(function(s){ return s.id === scheduleId; });
  // Reset duration selector (free-form fields not used when slot is pre-filled)
  var durEl = document.getElementById('courtReqDuration');
  if (durEl) durEl.value = '';
  if (sched) {
    document.getElementById('courtReqTimeFrom').value = sched.timeFrom || '';
    // Always explicitly set timeTo from schedule data
    var toEl = document.getElementById('courtReqTimeTo');
    if (toEl) {
      if (sched.timeTo) {
        toEl.value = sched.timeTo;
      } else if (sched.timeFrom) {
        // If admin didn't set an end time, default to 1 hour after start
        var parts = sched.timeFrom.split(':');
        var endH = parseInt(parts[0], 10) + 1;
        toEl.value = endH <= 24 ? String(endH).padStart(2,'0') + ':00' : sched.timeFrom;
      } else {
        toEl.value = '';
      }
    }
  }

  document.getElementById('courtReqPurpose').value = '';

  var slotInfo = document.getElementById('courtReqSlotInfo');
  var titleEl  = document.getElementById('courtReqTitle');
  if (slotInfo) slotInfo.style.display = 'block';
  if (titleEl)  titleEl.textContent = title + '  ·  ' + date;

  var alertEl = document.getElementById('court-req-alert');
  if (alertEl) alertEl.className = 'alert';

  calcCourtFee();
  modal.classList.add('open');
}

/* Court rate helper — reads the admin-set rate from localStorage */
function getCourtRate() {
  return parseInt(localStorage.getItem('courtHourlyRate') || '300', 10);
}

/* Live fee calculation */
function calcCourtFee() {
  var fromVal = document.getElementById('courtReqTimeFrom').value;
  var toVal   = document.getElementById('courtReqTimeTo').value;
  var feeCard = document.getElementById('courtFeeCard');
  var feeAmt  = document.getElementById('courtFeeAmount');
  var feeBrkd = document.getElementById('courtFeeBreakdown');
  if (!feeCard || !feeAmt) return;

  if (!fromVal || !toVal) { feeCard.style.display = 'none'; return; }

  var fromMin = parseInt(fromVal.split(':')[0])*60 + parseInt(fromVal.split(':')[1]);
  var toMin   = parseInt(toVal.split(':')[0])*60   + parseInt(toVal.split(':')[1]);
  var diffMin = toMin - fromMin;

  if (diffMin <= 0) { feeCard.style.display = 'none'; return; }

  var rate = getCourtRate();
  var hrs  = diffMin / 60;
  var fee  = Math.ceil(hrs * rate);
  var hrsDisplay = hrs % 1 === 0 ? hrs + ' hr' + (hrs > 1 ? 's' : '') : hrs.toFixed(1) + ' hrs';

  feeCard.style.display = 'block';
  feeAmt.textContent  = '₱' + fee.toLocaleString();
  feeBrkd.textContent = '(' + hrsDisplay + ' × ₱' + rate.toLocaleString() + ')';
}

function closeCourtModal() {
  var modal = document.getElementById('courtRequestModal');
  if (modal) modal.classList.remove('open');
  var dateEl = document.getElementById('courtReqDate');
  if (dateEl) dateEl.readOnly = false;
  var feeCard = document.getElementById('courtFeeCard');
  if (feeCard) feeCard.style.display = 'none';
}

function submitCourtRequest() {
  var scheduleId = document.getElementById('courtReqScheduleId').value;
  scheduleId     = scheduleId ? parseInt(scheduleId) : null;
  var date       = document.getElementById('courtReqDate').value;
  var timeFrom   = document.getElementById('courtReqTimeFrom').value;
  var timeTo     = document.getElementById('courtReqTimeTo').value;
  var purpose    = document.getElementById('courtReqPurpose').value.trim();

  // Auto-compute timeTo from start time + duration if not already set
  if (!timeTo && timeFrom) {
    var durEl  = document.getElementById('courtReqDuration');
    var durVal = durEl ? parseInt(durEl.value || '0', 10) : 0;
    if (durVal > 0) {
      var endH = parseInt(timeFrom.split(':')[0], 10) + durVal;
      if (endH <= 24) {
        timeTo = String(endH).padStart(2, '0') + ':00';
        document.getElementById('courtReqTimeTo').value = timeTo;
      }
    }
  }

  // Validation
  if (!date)     return showAlert('court-req-alert', 'Please select a date for your court booking.', 'error');
  if (!timeFrom) return showAlert('court-req-alert', 'Please select a start time for your booking.', 'error');
  if (!timeTo)   return showAlert('court-req-alert', 'Please select a duration so we can calculate your end time.', 'error');
  if (!purpose)  return showAlert('court-req-alert', 'Please describe the purpose of your court booking.', 'error');
  if (hasProfanity(purpose)) return showAlert('court-req-alert', 'Your purpose contains inappropriate language. Please revise it before submitting.', 'error');

  // Past date check
  var today = new Date(); today.setHours(0,0,0,0);
  var chosen = new Date(date + 'T00:00:00');
  if (chosen < today) return showAlert('court-req-alert', 'The date you selected has already passed. Please choose an upcoming date.', 'error');

  // Time logic check
  var fromMin = parseInt(timeFrom.split(':')[0])*60 + parseInt(timeFrom.split(':')[1]);
  var toMin   = parseInt(timeTo.split(':')[0])*60   + parseInt(timeTo.split(':')[1]);
  if (toMin <= fromMin) return showAlert('court-req-alert', 'Your end time is before or the same as your start time. Please adjust your schedule.', 'error');
  // Enforce court hours: 7 AM – 9 PM
  if (fromMin < 7*60) return showAlert('court-req-alert', 'The court is only available starting 7:00 AM. Please choose a later start time.', 'error');
  if (toMin > 21*60)  return showAlert('court-req-alert', 'Your selected duration goes past the court closing time of 9:00 PM. Please choose an earlier start time or a shorter duration.', 'error');

  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var reqs = getData('courtRequests');

  // Check time overlap with existing APPROVED requests on the same date
  var timeConflict = reqs.find(function(r) {
    if (r.status !== 'Approved') return false;
    var schedules = getData('courtSchedules');

    // Get date/time for the existing approved request
    var rDate = r.date_iso || (function(){
      var rs = schedules.find(function(s){ return s.id === r.scheduleId; });
      return rs ? rs.date : null;
    })();
    var rFrom = r.timeFrom || (function(){
      var rs = schedules.find(function(s){ return s.id === r.scheduleId; });
      return rs ? rs.timeFrom : null;
    })();
    var rTo = r.timeTo || (function(){
      var rs = schedules.find(function(s){ return s.id === r.scheduleId; });
      return rs ? rs.timeTo : null;
    })();

    if (rDate !== date) return false;
    if (!rFrom || !rTo) return false;

    var bFrom = parseInt(rFrom.split(':')[0])*60 + parseInt(rFrom.split(':')[1]);
    var bTo   = parseInt(rTo.split(':')[0])*60   + parseInt(rTo.split(':')[1]);
    return !(toMin <= bFrom || bTo <= fromMin);
  });

  if (timeConflict) {
    return showAlert('court-req-alert',
      'This time slot is already taken by another approved booking on the same date. Please choose a different time.',
      'error');
  }

  // Check time overlap with admin-posted barangay schedules (these are reserved and cannot be booked by residents)
  var allSchedules = getData('courtSchedules');
  var adminSchedConflict = allSchedules.find(function(s) {
    // Only block if this is NOT the exact slot the resident is requesting
    if (scheduleId && s.id === scheduleId) return false;
    if (s.date !== date) return false;
    if (!s.timeFrom || !s.timeTo) return false;
    var sFrom = parseInt(s.timeFrom.split(':')[0])*60 + parseInt(s.timeFrom.split(':')[1]);
    var sTo   = parseInt(s.timeTo.split(':')[0])*60   + parseInt(s.timeTo.split(':')[1]);
    return !(toMin <= sFrom || sTo <= fromMin);
  });

  if (adminSchedConflict) {
    return showAlert('court-req-alert',
      'The court is reserved for a barangay event ("' + adminSchedConflict.title + '") from ' + adminSchedConflict.timeFrom + ' to ' + (adminSchedConflict.timeTo || '?') + ' on that day. Please choose a time outside of this reserved schedule.',
      'error');
  }

  // Check if same user already has a pending/approved request for same date AND overlapping time
  var duplicate = reqs.find(function(r) {
    if (r.userId !== (user && user.userId)) return false;
    if (r.date_iso !== date) return false;
    if (r.status === 'Rejected') return false;
    if (!r.timeFrom || !r.timeTo) return false;
    var bFrom = parseInt(r.timeFrom.split(':')[0])*60 + parseInt(r.timeFrom.split(':')[1]);
    var bTo   = parseInt(r.timeTo.split(':')[0])*60   + parseInt(r.timeTo.split(':')[1]);
    return !(toMin <= bFrom || bTo <= fromMin);
  });
  if (duplicate) return showAlert('court-req-alert', 'You already have a pending or approved request that overlaps with this time slot on the same date. Please check your existing bookings.', 'error');

  // Compute fee
  var hrs = (toMin - fromMin) / 60;
  var fee = Math.ceil(hrs * getCourtRate());

  var reqId = Date.now();
  reqs.push({
    id:          reqId,
    scheduleId:  scheduleId,   // null if free-form request
    userId:      user ? user.userId : '',
    fullname:    user ? getFullName(user) : 'Anonymous',
    purpose:     filterProfanity(purpose),
    status:      'Pending',
    paymentStatus: 'Unpaid',
    fee:         fee,
    date_iso:    date,
    timeFrom:    timeFrom,
    timeTo:      timeTo,
    date: new Date().toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' })
  });
  setData('courtRequests', reqs);
  closeCourtModal();
  showToast('<strong>Court request submitted!</strong> The admin will review your request.', 'success');
  showAlert('court-section-alert', '✅ Court request submitted! The admin will review your request.', 'success');
  loadMyCourtRequests();
  loadCourtSchedule();
}

function loadMyCourtRequests() {
  var el = document.getElementById('myCourtRequests');
  if (!el) return;
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var reqs = getData('courtRequests').filter(function(r){ return user && r.userId === user.userId; });
  var schedules = getData('courtSchedules');
  if (reqs.length === 0) { el.innerHTML = '<p style="color:#888;">No court requests yet.</p>'; return; }

  // Sort most recent first
  reqs = reqs.slice().reverse();

  var today = new Date(); today.setHours(0,0,0,0);

  var html = '<table><thead><tr><th>Date</th><th>Time</th><th>Purpose</th><th>Fee</th><th>Filed</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead><tbody>';
  reqs.forEach(function(r) {
    var sched = r.scheduleId ? (schedules.find(function(s){ return s.id === r.scheduleId; }) || {}) : {};
    var cls   = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending';
    var fee   = r.fee ? '₱' + r.fee.toLocaleString() : '₱300';
    var dateDisplay = r.date_iso || sched.date || '—';
    var timeDisplay = (r.timeFrom || sched.timeFrom || '—') + (r.timeTo || sched.timeTo ? ' – ' + (r.timeTo || sched.timeTo) : '');

    // Check if date has passed (for reschedule eligibility)
    var reqDatePassed = false;
    if (r.date_iso || sched.date) {
      var reqDate = new Date((r.date_iso || sched.date) + 'T00:00:00');
      reqDatePassed = reqDate < today;
    }
    var canReschedule = (r.status === 'Rejected' || reqDatePassed) && r.status !== 'Approved';

    var payCol = '—';
    if (r.status === 'Approved') {
      if (r.paymentStatus === 'Paid') {
        payCol = '<span class="badge badge-approved"><i class="fa-solid fa-circle-check"></i> Paid</span>';
      } else {
        payCol = '<button class="btn btn-primary btn-sm" onclick="openPaymentModal(' + r.id + ')"><i class="fa-solid fa-credit-card"></i> Pay Now</button>';
      }
    } else if (r.status === 'Pending') {
      payCol = '<span style="color:#aaa;font-size:12px;">Awaiting<br>approval</span>';
    }

    var actionCol = '—';
    if (canReschedule) {
      actionCol = '<button onclick="openRescheduleModal(' + r.id + ')" class="btn btn-secondary btn-sm" style="font-size:11px;white-space:nowrap;"><i class="fa-solid fa-calendar-day"></i> Reschedule</button>';
    }

    html += '<tr>';
    html += '<td style="white-space:nowrap;font-weight:600;">' + esc(dateDisplay) + (reqDatePassed && r.status !== 'Approved' ? ' <span style="font-size:10px;color:#aaa;">(past)</span>' : '') + '</td>';
    html += '<td style="white-space:nowrap;">' + esc(timeDisplay) + '</td>';
    html += '<td>' + esc(r.purpose) + '</td>';
    html += '<td style="white-space:nowrap;font-weight:700;color:var(--blue);">' + fee + '</td>';
    html += '<td style="white-space:nowrap;">' + (r.date||'—') + '</td>';
    html += '<td><span class="badge badge-' + cls + '">' + r.status + '</span></td>';
    html += '<td>' + payCol + '</td>';
    html += '<td>' + actionCol + '</td>';
    html += '</tr>';
  });
  el.innerHTML = html + '</tbody></table>';
}

/* =========================================
  COURT RESCHEDULE MODAL
========================================= */
function openRescheduleModal(reqId) {
  var reqs = getData('courtRequests');
  var req = reqs.find(function(r){ return r.id === reqId; });
  if (!req) return;

  var existing = document.getElementById('rescheduleModal');
  if (existing) existing.remove();

  var today = new Date();
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var dd = String(today.getDate()).padStart(2,'0');
  var todayStr = today.getFullYear() + '-' + mm + '-' + dd;

  var modal = document.createElement('div');
  modal.id = 'rescheduleModal';
  modal.className = 'modal-overlay open';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML =
    '<div class="modal-box" style="max-width:480px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div class="modal-header" style="background:linear-gradient(135deg,var(--navy),#1a4a7a);padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">' +
        '<h3 style="margin:0;color:#fff;font-size:1.05rem;"><i class="fa-solid fa-calendar-day" style="margin-right:8px;color:var(--orange);"></i>Reschedule Court Booking</h3>' +
        '<button onclick="document.getElementById(\'rescheduleModal\').remove()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;">&times;</button>' +
      '</div>' +
      '<div style="padding:24px;">' +
        '<div style="background:#f0f6ff;border-radius:10px;padding:12px 16px;margin-bottom:16px;border-left:4px solid var(--blue);">' +
          '<div style="font-size:12px;color:var(--gray);font-weight:600;margin-bottom:3px;">Current Booking</div>' +
          '<div style="font-weight:700;color:var(--navy);">' + esc(req.purpose) + '</div>' +
          '<div style="font-size:13px;color:#555;">' + esc(req.date_iso||'—') + ' · ' + esc(req.timeFrom||'—') + (req.timeTo ? ' – ' + req.timeTo : '') + '</div>' +
        '</div>' +
        '<div id="reschedule-alert" class="alert"></div>' +
        '<div class="form-group">' +
          '<div><label class="form-label"><i class="fa-solid fa-calendar" style="color:var(--blue);margin-right:6px;"></i>New Date *</label>' +
          '<input type="date" id="reschedDate" min="' + todayStr + '" /></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
            '<div><label class="form-label">New Time Start *</label><input type="time" id="reschedTimeFrom" oninput="calcReschedFee()" /></div>' +
            '<div><label class="form-label">New Time End *</label><input type="time" id="reschedTimeTo" oninput="calcReschedFee()" /></div>' +
          '</div>' +
          '<div id="reschedFeeCard" style="display:none;background:linear-gradient(135deg,var(--navy),#1a4a7a);border-radius:12px;padding:14px 18px;color:#fff;">' +
            '<div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">Estimated Fee</div>' +
            '<div><span id="reschedFeeAmt" style="font-size:24px;font-weight:700;color:#f0c040;">₱0</span> <span id="reschedFeeBrkd" style="font-size:12px;opacity:.7;"></span></div>' +
          '</div>' +
          '<div><label class="form-label">Update Purpose (optional)</label><textarea id="reschedPurpose" rows="2" placeholder="Same as before, or enter new purpose...">' + esc(req.purpose) + '</textarea></div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="confirmReschedule(' + reqId + ')"><i class="fa-solid fa-calendar-check"></i> Confirm Reschedule</button>' +
            '<button class="btn btn-secondary" onclick="document.getElementById(\'rescheduleModal\').remove()">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function calcReschedFee() {
  var from = document.getElementById('reschedTimeFrom') ? document.getElementById('reschedTimeFrom').value : '';
  var to   = document.getElementById('reschedTimeTo')   ? document.getElementById('reschedTimeTo').value   : '';
  var card = document.getElementById('reschedFeeCard');
  var amt  = document.getElementById('reschedFeeAmt');
  var brkd = document.getElementById('reschedFeeBrkd');
  if (!card) return;
  if (!from || !to) { card.style.display='none'; return; }
  var fromMin = parseInt(from.split(':')[0])*60+parseInt(from.split(':')[1]);
  var toMin   = parseInt(to.split(':')[0])*60+parseInt(to.split(':')[1]);
  if (toMin <= fromMin) { card.style.display='none'; return; }
  var hrs = (toMin-fromMin)/60;
  var fee = Math.ceil(hrs*getCourtRate());
  var hrsDisp = hrs%1===0 ? hrs+'hr'+(hrs>1?'s':'') : hrs.toFixed(1)+'hrs';
  card.style.display='block';
  if(amt) amt.textContent='₱'+fee.toLocaleString();
  if(brkd) brkd.textContent='('+hrsDisp+' × ₱'+getCourtRate().toLocaleString()+')';
}

function confirmReschedule(reqId) {
  var newDate = document.getElementById('reschedDate') ? document.getElementById('reschedDate').value : '';
  var newFrom = document.getElementById('reschedTimeFrom') ? document.getElementById('reschedTimeFrom').value : '';
  var newTo   = document.getElementById('reschedTimeTo')   ? document.getElementById('reschedTimeTo').value   : '';
  var newPurp = document.getElementById('reschedPurpose')  ? document.getElementById('reschedPurpose').value.trim() : '';

  if (!newDate) return showAlert('reschedule-alert','Please select a new date.','error');
  if (!newFrom) return showAlert('reschedule-alert','Please enter a start time.','error');
  if (!newTo)   return showAlert('reschedule-alert','Please enter an end time.','error');

  var today = new Date(); today.setHours(0,0,0,0);
  var chosen = new Date(newDate+'T00:00:00');
  if (chosen < today) return showAlert('reschedule-alert','Cannot reschedule to a past date.','error');

  var fromMin = parseInt(newFrom.split(':')[0])*60+parseInt(newFrom.split(':')[1]);
  var toMin   = parseInt(newTo.split(':')[0])*60+parseInt(newTo.split(':')[1]);
  if (toMin <= fromMin) return showAlert('reschedule-alert','End time must be after start time.','error');

  // Check conflicts with approved requests on new date
  var reqs = getData('courtRequests');
  var conflict = reqs.find(function(r) {
    if (r.id === reqId || r.status !== 'Approved') return false;
    var rDate = r.date_iso;
    if (rDate !== newDate) return false;
    var bFrom = parseInt((r.timeFrom||'00:00').split(':')[0])*60+parseInt((r.timeFrom||'00:00').split(':')[1]);
    var bTo   = parseInt((r.timeTo||'00:00').split(':')[0])*60+parseInt((r.timeTo||'00:00').split(':')[1]);
    return !(toMin <= bFrom || bTo <= fromMin);
  });
  if (conflict) return showAlert('reschedule-alert','⚠️ This time conflicts with an approved booking. Please choose a different time.','error');

  var hrs = (toMin-fromMin)/60;
  var fee = Math.ceil(hrs*getCourtRate());

  var idx = reqs.findIndex(function(r){ return r.id === reqId; });
  if (idx === -1) return;
  reqs[idx].date_iso   = newDate;
  reqs[idx].timeFrom   = newFrom;
  reqs[idx].timeTo     = newTo;
  reqs[idx].fee        = fee;
  reqs[idx].status     = 'Pending';
  reqs[idx].paymentStatus = 'Unpaid';
  reqs[idx].scheduleId = null;
  if (newPurp) reqs[idx].purpose = newPurp;
  reqs[idx].date = new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'});
  setData('courtRequests', reqs);

  var modal = document.getElementById('rescheduleModal');
  if (modal) modal.remove();
  showToast('<strong>Rescheduled!</strong> Your new booking is pending admin approval.','success');
  loadMyCourtRequests();
  renderCourtCalendar();
}

/* =========================================
  PAYMENT MODAL
========================================= */
function openPaymentModal(reqId) {
  var reqs = getData('courtRequests');
  var req  = reqs.find(function(r){ return r.id === reqId; });
  if (!req) return;
  var schedules = getData('courtSchedules');
  var sched = schedules.find(function(s){ return s.id === req.scheduleId; }) || {};
  var fee = req.fee || 300;

  var modal = document.getElementById('paymentModal');
  if (!modal) return;
  document.getElementById('payReqId').value = reqId;
  document.getElementById('payFeeDisplay').textContent = '₱' + fee.toLocaleString();
  document.getElementById('paySchedDisplay').textContent = (sched.title||'Court') + ' — ' + (sched.date||'') + ' ' + (sched.timeFrom||'');
  // Reset tabs
  document.querySelectorAll('.pay-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.pay-tab-content').forEach(function(c){ c.style.display = 'none'; });
  document.querySelector('.pay-tab[data-tab="gcash"]').classList.add('active');
  document.getElementById('pay-tab-gcash').style.display = 'block';
  modal.classList.add('open');
}

function closePaymentModal() {
  var modal = document.getElementById('paymentModal');
  if (modal) modal.classList.remove('open');
}

function switchPayTab(tab) {
  document.querySelectorAll('.pay-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.pay-tab-content').forEach(function(c){ c.style.display = 'none'; });
  var btn = document.querySelector('.pay-tab[data-tab="' + tab + '"]');
  var content = document.getElementById('pay-tab-' + tab);
  if (btn) btn.classList.add('active');
  if (content) content.style.display = 'block';
  // Clear reference inputs on tab switch
  document.querySelectorAll('.pay-ref-input').forEach(function(i){ i.value = ''; });
  document.getElementById('payRefNumber').value = '';
}

/* =========================================
  COURT CALENDAR — AUTO-SCHEDULE HELPER
  Ensures a courtSchedules entry exists for an
  approved+paid request so it appears on the calendar.
========================================= */
function ensureCourtScheduleEntry(req) {
  if (!req) return;
  var schedules = getData('courtSchedules');

  // If request already linked to an existing schedule, nothing to create
  if (req.scheduleId) {
    var existing = schedules.find(function(s){ return s.id === req.scheduleId; });
    if (existing) return; // already in calendar
  }

  // Don't create duplicates — check if we already made one for this request
  var alreadyMade = schedules.find(function(s){ return s._reqId === req.id; });
  if (alreadyMade) {
    // Make sure the request points at it
    if (!req.scheduleId) {
      var reqs = getData('courtRequests');
      var ri = reqs.findIndex(function(r){ return r.id === req.id; });
      if (ri !== -1) { reqs[ri].scheduleId = alreadyMade.id; setData('courtRequests', reqs); }
    }
    return;
  }

  // Create a new courtSchedules entry from the request data
  var newSched = {
    id:         Date.now(),
    _reqId:     req.id,           // link back so we can find it later
    title:      req.purpose || ('Court Booking — ' + (req.fullname || 'Resident')),
    activity:   'Resident Booking',
    date:       req.date_iso,
    timeFrom:   req.timeFrom,
    timeTo:     req.timeTo,
    notes:      'Booked by: ' + (req.fullname || '') + (req.paymentRef ? ' · Ref: ' + req.paymentRef : ''),
    postedDate: new Date().toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' })
  };
  schedules.push(newSched);
  setData('courtSchedules', schedules);

  // Link the request to the new schedule entry
  var reqs2 = getData('courtRequests');
  var ri2 = reqs2.findIndex(function(r){ return r.id === req.id; });
  if (ri2 !== -1) { reqs2[ri2].scheduleId = newSched.id; setData('courtRequests', reqs2); }
}

/* Refresh both admin and resident court calendars if the functions exist */
function refreshCourtCalendars() {
  if (typeof renderAdminCourtCalendar === 'function') renderAdminCourtCalendar();
  if (typeof renderCourtCalendar === 'function') renderCourtCalendar();
  if (typeof loadAdminCourtSchedules === 'function') loadAdminCourtSchedules();
}

function confirmPayment() {
  var reqId = parseInt(document.getElementById('payReqId').value);
  var refInput = document.getElementById('payRefNumber');
  var ref = refInput ? refInput.value.trim() : '';
  if (!ref) { showAlert('pay-alert', 'Please enter your reference/transaction number.', 'error'); return; }
  var reqs = getData('courtRequests');
  var idx  = reqs.findIndex(function(r){ return r.id === reqId; });
  if (idx === -1) return;
  reqs[idx].paymentStatus = 'Paid';
  reqs[idx].paymentRef = ref;
  reqs[idx].paymentDate = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' });
  // Attach proof of payment photo/PDF if provided
  if (window._courtPayProofData) {
    reqs[idx].paymentProof     = window._courtPayProofData;
    reqs[idx].paymentProofName = window._courtPayProofName || 'proof';
    window._courtPayProofData  = null;
    window._courtPayProofName  = null;
  }
  setData('courtRequests', reqs);

  // Auto-add to court calendar now that booking is approved + paid
  ensureCourtScheduleEntry(reqs[idx]);
  refreshCourtCalendars();

  closePaymentModal();
  showAlert('court-section-alert', '✅ Payment confirmed! Reference: ' + ref + '. Your court booking is now listed on the court calendar.', 'success');
  loadMyCourtRequests();
}


// Admin init calls — only run on admin.html where these functions exist
if (typeof loadAdminResidents === 'function') loadAdminResidents();
if (typeof loadAdminRequests === 'function') loadAdminRequests();
if (typeof loadAdminForum === 'function') loadAdminForum();
if (typeof loadProjects === 'function') loadProjects();
if (typeof loadAdminCourtSchedules === 'function') loadAdminCourtSchedules();
if (typeof loadAdminCourtRequests === 'function') loadAdminCourtRequests();


/* =========================================
  UTILITIES
========================================= */
function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* =========================================
  KEYBOARD SHORTCUTS
========================================= */
document.addEventListener('keypress', function(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  var a = document.activeElement;
  if (!a) return;
  if (['loginUsername','loginPassword'].indexOf(a.id) !== -1) residentLogin();
  if (['clearName','clearPurpose'].indexOf(a.id) !== -1) requestDocument();
  if (a.id === 'verifyAnswer') submitVerification();
});

/* =========================================
  HOME NOTIFICATIONS (below quick-links)
========================================= */
function loadHomeNotifications() {
  var section = document.getElementById('homeNotifSection');
  if (!section) return;
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;

  // Operate only on homeNotifList — never touch homeAdminMessages
  var notifList = document.getElementById('homeNotifList');
  if (!notifList) {
    notifList = document.createElement('div');
    notifList.id = 'homeNotifList';
    // Insert BEFORE homeAdminMessages so notifications appear above messages
    var msgEl = document.getElementById('homeAdminMessages');
    if (msgEl) {
      section.insertBefore(notifList, msgEl);
    } else {
      section.appendChild(notifList);
    }
  }

  var all  = getData('clearanceRequests');
  var mine = all.filter(function(r){ return r.requestedBy === user.userId; });

  if (mine.length === 0) {
    notifList.innerHTML = '';
    return;
  }

  // Show last 5, most recent first (reversed)
  var recent = mine.slice().reverse().slice(0, 5);
  var html = '<h3 style="font-size:.88rem;font-weight:600;color:var(--navy);margin-bottom:8px;display:flex;align-items:center;gap:7px;"><i class="fa-solid fa-bell" style="color:var(--orange);"></i> My Request Updates</h3>';
  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var cls = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : '';
    var icon = r.status === 'Approved' ? 'fa-circle-check' : r.status === 'Rejected' ? 'fa-circle-xmark' : 'fa-clock';
    var iconColor = r.status === 'Approved' ? '#2ecc71' : r.status === 'Rejected' ? '#e74c3c' : '#f39c12';
    html += '<div class="req-notif-item ' + cls + '" onclick="showResidentSection(\'res-myrequests\',document.querySelectorAll(\'.dash-btn\')[4]);return false;" style="cursor:pointer;">';
    html += '<div class="req-notif-icon"><i class="fa-solid ' + icon + '" style="color:' + iconColor + ';font-size:20px;"></i></div>';
    html += '<div class="req-notif-text"><strong>' + esc(r.docType || 'Document Request') + '</strong><span>Status: <strong>' + r.status + '</strong> · ' + (r.date || '') + ' · Purpose: ' + esc(r.purpose) + '</span></div>';
    html += '<i class="fa-solid fa-chevron-right req-notif-arrow"></i></div>';
  }
  notifList.innerHTML = html;
}

function loadHomeLatestUpdates() {
  var el = document.getElementById('homeLatestUpdates');
  if (!el) return;
  var posts = getData('announcementPosts') || [];
  if (posts.length === 0) {
    el.innerHTML = '<p style="color:#888;font-size:14px;padding:8px 0;">No updates yet.</p>';
    return;
  }
  var recent = posts.slice().reverse().slice(0, 4);
  var dotColors = ['#2ecc71','var(--orange)','var(--blue)','#8e24aa'];
  var html = '';
  recent.forEach(function(a, i) {
    html += '<div class="home-update-item hoverable-card" style="cursor:pointer;border-radius:10px;padding:10px 12px;transition:background .18s,box-shadow .18s,transform .15s;" onclick="showResidentSection(\'res-announcements\',document.querySelectorAll(\'.dash-btn\')[1]);return false;">';
    html += '<div class="home-update-dot" style="background:' + (dotColors[i % dotColors.length]) + ';flex-shrink:0;"></div>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<strong style="display:block;color:var(--navy);font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(a.title||a.subject||'Announcement') + '</strong>';
    html += '<p style="color:#666;font-size:12.5px;margin:3px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc((a.content||'').substring(0,80)) + (a.content && a.content.length > 80 ? '…' : '') + '</p>';
    html += '<small style="color:#aaa;font-size:11px;">' + esc(a.date||'') + '</small>';
    html += '</div></div>';
  });
  el.innerHTML = html;
}

/* =========================================
  HOME — MESSAGES FROM ADMIN WIDGET
========================================= */
function loadHomeAdminMessages() {
  var el = document.getElementById('homeAdminMessages');
  if (!el) return;
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;

  var messages = getData('chat_' + user.userId) || [];
  var adminMsgs = messages.filter(function(m){ return m.from === 'admin'; });

  if (adminMsgs.length === 0) {
    el.innerHTML = '<p style="color:#888;font-size:14px;padding:6px 0;">No messages from admin yet.</p>';
    return;
  }

  var recent = adminMsgs.slice().reverse().slice(0, 3);
  var adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
  var adminName = adminProfile.displayName || 'Barangay Administration';
  var adminInitial = adminName.charAt(0).toUpperCase();

  var html = '';
  recent.forEach(function(m) {
    var avatarHtml = adminProfile.profilePic
      ? '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="' + adminProfile.profilePic + '" style="width:100%;height:100%;object-fit:cover;"></div>'
      : '<div style="width:36px;height:36px;border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px;flex-shrink:0;">' + adminInitial + '</div>';

    html += '<div class="home-admin-msg-item" onclick="showResidentSection(\'res-messages\',document.querySelectorAll(\'.dash-btn\')[8]);return false;" style="cursor:pointer;">';
    html += avatarHtml;
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-weight:600;font-size:13px;color:var(--navy);">' + esc(adminName) + '</div>';
    html += '<div style="font-size:12.5px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(m.text) + '</div>';
    html += '<div style="font-size:11px;color:#aaa;margin-top:2px;">' + (m.time||'') + (m.date ? ' · ' + m.date : '') + '</div>';
    html += '</div>';
    html += '<i class="fa-solid fa-chevron-right" style="color:#ccc;font-size:11px;flex-shrink:0;"></i>';
    html += '</div>';
  });

  el.innerHTML = html;
}

/* =========================================
  NOTIFICATION BELL
========================================= */
function updateNotifBell() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  var readKey = 'readNotifs_' + user.userId;
  var all  = getData('clearanceRequests');
  var mine = all.filter(function(r){ return r.requestedBy === user.userId; });
  var read = JSON.parse(localStorage.getItem(readKey) || '[]');
  var unreadReqs = mine.filter(function(r) { return read.indexOf(r.date + r.docType) === -1 && (r.status === 'Approved' || r.status === 'Rejected'); });

  // Check for unread admin messages — use residentRead flag (not count-based)
  // so deletions never leave stale notification counts
  var chatMsgs = getData('chat_' + user.userId) || [];
  var unreadMsgCount = chatMsgs.filter(function(m){ return m.from === 'admin' && !m.residentRead; }).length;
  var hasUnreadMsgs = unreadMsgCount > 0;

  var totalUnread = unreadReqs.length + (hasUnreadMsgs ? unreadMsgCount : 0);

  var countEl = document.getElementById('notifCount');
  var bellBtn = document.querySelector('.notif-bell-btn');
  if (countEl) {
    if (totalUnread > 0) {
      countEl.textContent = totalUnread;
      countEl.style.display = 'flex';
      countEl.classList.add('pulse');
      if (bellBtn) bellBtn.classList.add('has-notif');
    } else {
      countEl.style.display = 'none';
      countEl.classList.remove('pulse');
      if (bellBtn) bellBtn.classList.remove('has-notif');
    }
  }

  // Populate notif panel
  var list = document.getElementById('notifList');
  if (!list) return;

  var html = '';

  // Unread admin messages notification item
  if (hasUnreadMsgs) {
    html += '<div class="notif-item unread" onclick="notifMsgClick()" style="cursor:pointer;">';
    html += '<div class="notif-dot" style="background:var(--orange);"></div>';
    html += '<div class="notif-item-body"><strong><i class="fa-solid fa-envelope" style="color:var(--orange);margin-right:5px;"></i>New Message from Admin</strong>';
    html += '<span>' + unreadMsgCount + ' unread message(s) from Barangay Administration</span></div>';
    html += '<div style="width:8px;height:8px;border-radius:50%;background:var(--orange);flex-shrink:0;margin-top:4px;"></div>';
    html += '</div>';
  }

  if (mine.length === 0 && !hasUnreadMsgs) {
    list.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
    return;
  }

  var recent = mine.slice().reverse().slice(0, 8);
  for (var i = 0; i < recent.length; i++) {
    var r = recent[i];
    var key = r.date + r.docType;
    var isUnread = read.indexOf(key) === -1 && (r.status === 'Approved' || r.status === 'Rejected');
    var dotCls = r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending';
    html += '<div class="notif-item' + (isUnread ? ' unread' : '') + '" onclick="notifClick(\'' + key + '\')" data-key="' + key + '">';
    html += '<div class="notif-dot ' + dotCls + '"></div>';
    html += '<div class="notif-item-body"><strong>' + esc(r.docType || 'Request') + ' — ' + r.status + '</strong><span>' + (r.date || '') + ' · ' + esc(r.purpose) + '</span></div>';
    if (isUnread) html += '<div style="width:8px;height:8px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:4px;"></div>';
    html += '</div>';
  }
  list.innerHTML = html;
}

function notifMsgClick() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  // Mark all admin messages as read using the residentRead flag
  var chatMsgs = getData('chat_' + user.userId) || [];
  var changed = false;
  chatMsgs.forEach(function(m) { if (m.from === 'admin' && !m.residentRead) { m.residentRead = true; changed = true; } });
  if (changed) setData('chat_' + user.userId, chatMsgs);
  localStorage.removeItem('readMsgs_' + user.userId); // clean up obsolete key
  var panel = document.getElementById('notifPanel');
  if (panel) panel.classList.remove('open');
  updateNotifBell();
  showResidentSection('res-messages', document.querySelectorAll('.dash-btn')[8]);
}

function toggleNotifPanel() {
  var panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) updateNotifBell();
  // Close on outside click
  if (panel.classList.contains('open')) {
    setTimeout(function() {
      document.addEventListener('click', closeNotifOnOutside);
    }, 10);
  }
}

function closeNotifOnOutside(e) {
  var panel = document.getElementById('notifPanel');
  var wrap  = panel ? panel.closest('.notif-wrap') : null;
  if (wrap && !wrap.contains(e.target)) {
    if (panel) panel.classList.remove('open');
    document.removeEventListener('click', closeNotifOnOutside);
  }
}

function notifClick(key) {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  var readKey = user ? 'readNotifs_' + user.userId : 'readNotifs';
  var read = JSON.parse(localStorage.getItem(readKey) || '[]');
  if (read.indexOf(key) === -1) read.push(key);
  localStorage.setItem(readKey, JSON.stringify(read));
  // Visually mark item as read immediately
  var item = document.querySelector('[data-key="' + key + '"]');
  if (item) item.classList.remove('unread');
  var panel = document.getElementById('notifPanel');
  if (panel) panel.classList.remove('open');
  updateNotifBell();
  showResidentSection('res-myrequests', document.querySelectorAll('.dash-btn')[4]);
}

function markAllRead() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  var readKey = 'readNotifs_' + user.userId;
  var all  = getData('clearanceRequests');
  var mine = all.filter(function(r){ return r.requestedBy === user.userId; });
  var read = mine.map(function(r){ return r.date + r.docType; });
  localStorage.setItem(readKey, JSON.stringify(read));
  updateNotifBell();
}

/* =========================================
  INIT
========================================= */
window.onload = function() {
  // Admin page has its own onload
  if (document.getElementById('admin-login')) return;

  var loggedInUser = sessionStorage.getItem('loggedInUser');

  // ---- residents.html (has #login, no #home) ----
  if (document.getElementById('login') && !document.getElementById('home')) {
    if (loggedInUser) {
      try {
        var u = JSON.parse(loggedInUser);
        var welcomeEl    = document.getElementById('welcomeUser');
        var welcomeInner = document.getElementById('welcomeUserInner');
        var welcomeSub   = document.getElementById('welcomeUserSub');
        if (welcomeEl)    welcomeEl.textContent    = getFullName(u);
        if (welcomeInner) welcomeInner.textContent = u.firstName || getFullName(u);
        if (welcomeSub)   welcomeSub.textContent   = getFullName(u) + ' (ID: ' + u.userId + ')';
        updateAvatarDisplay(u);
        // Check if account setup (security questions) is complete before going to dashboard
        var setupDone = (function() {
          for (var i = 1; i <= 15; i++) { if (!u['secQ' + i]) return false; }
          return true;
        })();
        if (!setupDone) {
          showPage('login');
          showTutorialModal();
        } else {
          showPage('dashboard');
        }
      } catch(e) { showPage('login'); }
    } else {
      showPage('login');
    }
    return;
  }

  // ---- index.html (has #home) ----
  if (loggedInUser) {
    var user = JSON.parse(loggedInUser);
    var welcomeEl    = document.getElementById('welcomeUser');
    var welcomeInner = document.getElementById('welcomeUserInner');
    var welcomeSub   = document.getElementById('welcomeUserSub');
    if (welcomeEl)    welcomeEl.textContent    = getFullName(user);
    if (welcomeInner) welcomeInner.textContent = user.firstName || getFullName(user);
    if (welcomeSub)   welcomeSub.textContent   = getFullName(user) + ' (ID: ' + user.userId + ')';
    updateAvatarDisplay(user);
    // Check if account setup (security questions) is complete before going to dashboard
    var setupDone = (function() {
      for (var i = 1; i <= 15; i++) { if (!user['secQ' + i]) return false; }
      return true;
    })();
    if (!setupDone) {
      showPage('home');
      showTutorialModal();
    } else {
      showPage('dashboard');
    }
  } else {
    showPage('home');
  }
};
/* =========================================
  CONTACT FORM SUBMISSION
========================================= */
function submitContactMessage(form) {
  var name    = document.getElementById('contactName').value.trim();
  var email   = document.getElementById('contactEmail').value.trim();
  var message = document.getElementById('contactMsg').value.trim();
  var alertEl = document.getElementById('contact-alert');
  if (!name || !email || !message) {
    if (alertEl) { alertEl.className='alert show'; alertEl.style.background='rgba(231,76,60,0.25)'; alertEl.style.border='1px solid rgba(231,76,60,0.5)'; alertEl.textContent='Please fill in all fields.'; }
    return;
  }
  var msgs = getData('contactMessages');
  msgs.push({
    name: name, email: email, message: message,
    date: new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
  });
  setData('contactMessages', msgs);
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';
  if (alertEl) {
    alertEl.className='alert show';
    alertEl.style.background='rgba(46,204,113,0.25)';
    alertEl.style.border='1px solid rgba(46,204,113,0.5)';
    alertEl.style.color='#fff';
    alertEl.textContent = 'Message sent! We will get back to you soon.';
    setTimeout(function(){ alertEl.classList.remove('show'); }, 5000);
  }
}

/* =========================================
  COURT CALENDAR — SHARED BUILDER
========================================= */
function buildCalendarHTML(year, month, schedules, mode) {
  // mode: 'resident' or 'admin'
  var daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var firstDay    = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);

  // Map date string -> schedules
  var schedMap = {};
  schedules.forEach(function(s) {
    if (!schedMap[s.date]) schedMap[s.date] = [];
    schedMap[s.date].push(s);
  });

  // For resident view: show booked days (approved bookings OR admin-posted schedules)
  var requests = getData('courtRequests');
  var bookedScheduleIds = {};
  requests.forEach(function(r) {
    // Show as booked if approved, OR if the current resident has a pending request for it
    if (r.status === 'Approved') bookedScheduleIds[r.scheduleId] = true;
  });

  var html = '<div class="cal-grid">';
  daysOfWeek.forEach(function(d){ html += '<div class="cal-header-cell">' + d + '</div>'; });
  for (var b=0; b<firstDay; b++) html += '<div class="cal-cell cal-empty"></div>';
  for (var day=1; day<=daysInMonth; day++) {
    var mm  = String(month+1).padStart(2,'0');
    var dd  = String(day).padStart(2,'0');
    var key = year + '-' + mm + '-' + dd;
    var daySched = schedMap[key] || [];
    var isPast   = new Date(key + 'T00:00:00') < today;
    var isToday  = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;

    // For resident: show orange if there is ANY schedule on that day
    // (schedules are posted by admin and are always visible/booked slots)
    var hasSched;
    if (mode === 'resident') {
      hasSched = daySched.length > 0;
    } else {
      hasSched = daySched.length > 0;
    }

    var cls = 'cal-cell' + (hasSched ? ' cal-booked' : ' cal-free') + (isToday ? ' cal-today' : '') + (isPast ? ' cal-past' : '');
    var clickable = !isPast || mode === 'admin';
    html += '<div class="' + cls + '"' + (clickable ? ' onclick="showCalDay(\'' + key + '\',\'' + (mode||'resident') + '\')" style="cursor:pointer;"' : ' title="Past date"') + '>';
    html += '<span class="cal-day-num">' + day + '</span>';
    if (hasSched) {
      html += '<div class="cal-dot-row">';
      daySched.forEach(function(){ html += '<span class="cal-mini-dot"></span>'; });
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* Day detail modal */
function showCalDay(dateKey, mode) {
  var schedules = getData('courtSchedules').filter(function(s){ return s.date === dateKey; });
  var requests  = getData('courtRequests');
  var d = new Date(dateKey + 'T00:00:00');
  var label = d.toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  var panelId  = mode === 'admin' ? 'adminCalDayPanel' : 'resCalDayPanel';
  var panel = document.getElementById(panelId);
  if (!panel) return;

  var inner = '<div class="cal-day-panel-header">';
  inner += '<span class="cal-day-panel-date">' + label + '</span>';
  inner += '<button class="cal-day-panel-close" onclick="document.getElementById(\'' + panelId + '\').style.display=\'none\'"><i class="fa-solid fa-xmark"></i></button>';
  inner += '</div>';

  // Show ALL admin-posted schedules for both admin and resident views
  // Residents see available + booked slots so they know what exists and can request
  var visibleSchedules = schedules;

  if (visibleSchedules.length === 0) {
    inner += '<div class="cal-day-empty"><i class="fa-regular fa-calendar-xmark"></i><p>No schedules posted for this day.</p></div>';
  } else {
    inner += '<div class="cal-day-events">';
    visibleSchedules.forEach(function(s) {
      var reqsForSlot   = requests.filter(function(r){ return r.scheduleId === s.id; });
      var approvedReq   = reqsForSlot.find(function(r){ return r.status === 'Approved'; });
      var isTaken       = !!approvedReq;
      inner += '<div class="cal-day-event' + (isTaken ? ' cal-event-taken' : '') + '">';
      inner += '<div class="cal-day-event-time"><i class="fa-solid fa-clock"></i> ' + s.timeFrom + (s.timeTo ? ' – ' + s.timeTo : '') + '</div>';
      inner += '<div class="cal-day-event-title">' + esc(s.title) + (s.activity ? ' <span class="cal-event-type">' + esc(s.activity) + '</span>' : '') + '</div>';
      if (s.notes) inner += '<div class="cal-day-event-notes">' + esc(s.notes) + '</div>';
      inner += '<div class="cal-day-event-status">';
      if (mode === 'admin') {
        // Admin: show all pending requests too
        var pendingReqs = reqsForSlot.filter(function(r){ return r.status === 'Pending'; });
        inner += isTaken
          ? '<span class="cal-tag cal-tag-taken"><i class="fa-solid fa-lock"></i> Slot Taken — ' + esc(approvedReq.fullname) + (approvedReq.paymentStatus === 'Paid' ? ' · <i class="fa-solid fa-circle-check" style="color:#2ecc71;"></i> Paid' : ' · Unpaid') + '</span>'
          : '<span class="cal-tag cal-tag-free"><i class="fa-solid fa-circle-check"></i> Available</span>';
        if (pendingReqs.length > 0) {
          inner += ' <span class="cal-tag" style="background:rgba(243,156,18,0.15);color:#f39c12;border:1px solid rgba(243,156,18,0.4);"><i class="fa-solid fa-clock"></i> ' + pendingReqs.length + ' Pending Request(s)</span>';
        }
      } else {
        inner += isTaken
          ? '<span class="cal-tag cal-tag-taken"><i class="fa-solid fa-lock"></i> Slot Taken</span>'
          : '<span class="cal-tag cal-tag-free"><i class="fa-solid fa-circle-check"></i> Available</span>';
        if (!isTaken) {
          inner += '<button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="document.getElementById(\'' + panelId + '\').style.display=\'none\';openCourtRequest(' + s.id + ',\'' + esc(s.title) + '\',\'' + s.date + '\')"><i class="fa-solid fa-hand-pointer"></i> Request This Slot</button>';
        }
      }
      inner += '</div>';
      inner += '</div>';
    });
    inner += '</div>';
  }

  panel.innerHTML = inner;
  panel.style.display = 'block';
}

/* =========================================
  COURT CALENDAR — RESIDENT
  init on section open (handled in showResidentSection above)
========================================= */

var _annCardIdx = 0;
var _annAllCards = [];

function loadResidentAnnouncementCards() {
  var el = document.getElementById('resAnnouncementCards');
  if (!el) return;

  var stored = getData('announcementPosts');
  _annAllCards = stored.slice().reverse();

  if (_annAllCards.length === 0) {
    el.innerHTML = '<div class="card" style="color:#888;padding:40px 30px;text-align:center;grid-column:1/-1;width:100%;"><i class="fa-solid fa-bullhorn" style="font-size:2rem;display:block;margin-bottom:10px;opacity:.3;"></i>No announcements yet.</div>';
    return;
  }

  var html = '';
  _annAllCards.forEach(function(a, idx) {
    var imgs = a.images || (a.image ? [a.image] : []);
    html += '<div class="res-ann-card hoverable-card" onclick="openAnnCard(' + idx + ')" style="cursor:pointer;" tabindex="0" role="button" title="Click to read more">';
    if (imgs.length > 0) {
      if (imgs.length === 1) {
        html += '<img class="res-ann-card-img" src="' + imgs[0] + '" alt="Announcement photo">';
      } else {
        // Mini gallery strip: first image + count badge
        html += '<div style="position:relative;">';
        html += '<img class="res-ann-card-img" src="' + imgs[0] + '" alt="Announcement photo" style="display:block;">';
        html += '<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;backdrop-filter:blur(4px);"><i class="fa-solid fa-images" style="margin-right:4px;"></i>' + imgs.length + ' photos</div>';
        html += '</div>';
      }
    } else {
      html += '<div class="res-ann-card-img-placeholder"><i class="fa-solid fa-bullhorn"></i></div>';
    }
    html += '<div class="res-ann-card-body">';
    html += '<h4>' + esc(a.title || 'Announcement') + '</h4>';
    html += '<p>' + esc(a.content || '') + '</p>';
    html += '<div class="res-ann-card-footer">';
    html += '<span class="res-ann-tag">' + esc(a.tag || 'Notice') + '</span>';
    html += '<span><i class="fa-solid fa-calendar" style="margin-right:4px;"></i>' + esc(a.date || '') + '</span>';
    html += '</div></div>';
    html += '<div class="res-ann-card-read-more"><i class="fa-solid fa-arrow-right"></i> Read More</div>';
    html += '</div>';
  });
  el.innerHTML = html;
}

var _annImgIdx = 0; // current photo index within an announcement

function renderAnnModal() {
  var existing = document.getElementById('annCardModal');
  if (existing) existing.remove();

  var a = _annAllCards[_annCardIdx];
  if (!a) return;
  var total = _annAllCards.length;
  var hasPrev = _annCardIdx > 0;
  var hasNext = _annCardIdx < total - 1;

  var imgs = a.images || (a.image ? [a.image] : []);
  if (_annImgIdx >= imgs.length) _annImgIdx = 0;

  var modal = document.createElement('div');
  modal.id = 'annCardModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  // Build photo section
  var photoSection = '';
  if (imgs.length > 0) {
    var curImg = imgs[_annImgIdx];
    photoSection = '<div style="position:relative;background:#000;text-align:center;">' +
      '<img id="annModalImg" src="' + curImg + '" style="max-width:100%;max-height:300px;display:block;margin:0 auto;object-fit:contain;">';
    // Prev photo
    if (imgs.length > 1) {
      photoSection += '<button onclick="annImgNav(-1)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;"' + (_annImgIdx === 0 ? ' disabled style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.2);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:not-allowed;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.4;"' : '') + '><i class="fa-solid fa-chevron-left"></i></button>';
      photoSection += '<button onclick="annImgNav(1)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;"' + (_annImgIdx === imgs.length - 1 ? ' disabled style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.2);border:none;color:#fff;width:34px;height:34px;border-radius:50%;cursor:not-allowed;font-size:14px;display:flex;align-items:center;justify-content:center;opacity:.4;"' : '') + '><i class="fa-solid fa-chevron-right"></i></button>';
      // Dot indicators
      photoSection += '<div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:5px;">';
      imgs.forEach(function(_, i) {
        photoSection += '<span onclick="annImgGoto(' + i + ')" style="width:7px;height:7px;border-radius:50%;background:' + (i === _annImgIdx ? '#fff' : 'rgba(255,255,255,0.4)') + ';cursor:pointer;transition:background .2s;"></span>';
      });
      photoSection += '</div>';
      // Counter
      photoSection += '<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;">' + (_annImgIdx+1) + ' / ' + imgs.length + '</div>';
    }
    photoSection += '</div>';
  }

  modal.innerHTML =
    '<div style="background:#fff;border-radius:20px;max-width:600px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.4);overflow:hidden;max-height:92vh;display:flex;flex-direction:column;">' +
      '<div style="background:linear-gradient(135deg,var(--navy),var(--blue));padding:22px 26px;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
        '<div>' +
          '<div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">' + esc(a.tag || 'Notice') + '</div>' +
          '<h3 style="margin:0;font-size:1.2rem;line-height:1.35;font-weight:700;">' + esc(a.title || 'Announcement') + '</h3>' +
        '</div>' +
        '<button onclick="document.getElementById(\'annCardModal\').remove()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&times;</button>' +
      '</div>' +
      '<div style="overflow-y:auto;flex:1;">' +
        photoSection +
        '<div style="padding:24px 26px;">' +
          '<div style="font-size:15px;color:#333;line-height:1.75;">' + esc(a.content || '') + '</div>' +
          '<div style="margin-top:16px;font-size:12.5px;color:#aaa;display:flex;align-items:center;gap:6px;"><i class="fa-solid fa-calendar"></i> ' + esc(a.date || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:#fafbfd;flex-shrink:0;">' +
        '<button onclick="annCardNav(-1)" style="background:var(--navy);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:Poppins,sans-serif;font-size:13px;display:flex;align-items:center;gap:6px;' + (!hasPrev ? 'opacity:.4;pointer-events:none;' : '') + '"><i class="fa-solid fa-chevron-left"></i> Prev</button>' +
        '<span style="font-size:12px;color:var(--gray);">' + (_annCardIdx + 1) + ' / ' + total + '</span>' +
        '<button onclick="annCardNav(1)" style="background:var(--navy);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:Poppins,sans-serif;font-size:13px;display:flex;align-items:center;gap:6px;' + (!hasNext ? 'opacity:.4;pointer-events:none;' : '') + '">Next <i class="fa-solid fa-chevron-right"></i></button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

  modal._keyHandler = function(e) {
    if (e.key === 'ArrowLeft') annCardNav(-1);
    if (e.key === 'ArrowRight') annCardNav(1);
    if (e.key === 'Escape') modal.remove();
  };
  document.addEventListener('keydown', modal._keyHandler);
}

function openAnnCard(idx) {
  _annCardIdx = idx;
  _annImgIdx = 0;
  renderAnnModal();
}

function annCardNav(dir) {
  var old = document.getElementById('annCardModal');
  if (old && old._keyHandler) document.removeEventListener('keydown', old._keyHandler);
  _annCardIdx = Math.max(0, Math.min(_annAllCards.length - 1, _annCardIdx + dir));
  _annImgIdx = 0; // reset to first photo on announcement change
  renderAnnModal();
}

function annImgNav(dir) {
  var a = _annAllCards[_annCardIdx];
  if (!a) return;
  var imgs = a.images || (a.image ? [a.image] : []);
  _annImgIdx = Math.max(0, Math.min(imgs.length - 1, _annImgIdx + dir));
  renderAnnModal();
}

function annImgGoto(i) {
  _annImgIdx = i;
  renderAnnModal();
}

/* =========================================
  DATE LABEL HELPER — Today / Yesterday / exact date
========================================= */
function getDateLabel(dateStr) {
  if (!dateStr) return '';
  var today = new Date();
  var todayStr = today.toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'short',day:'numeric'});
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var yesterdayStr = yesterday.toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'short',day:'numeric'});
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return dateStr;
}

/* =========================================
  RESIDENT MESSAGING
========================================= */
function loadResidentMessages() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  var thread = document.getElementById('resMsgThread');
  if (!thread) return;
  var messages = getData('chat_' + user.userId);
  // Mark all admin messages as read using residentRead flag
  var changed = false;
  messages.forEach(function(m) { if (m.from === 'admin' && !m.residentRead) { m.residentRead = true; changed = true; } });
  if (changed) setData('chat_' + user.userId, messages);
  localStorage.removeItem('readMsgs_' + user.userId); // clean up obsolete key
  updateNotifBell();

  // Update header with admin profile info
  var adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
  var adminAvatarEl = document.getElementById('resMsgAdminAvatarContent');
  var adminAvatarWrap = document.getElementById('resMsgAdminAvatar');
  var adminNameEl = document.getElementById('resMsgAdminName');
  if (adminAvatarEl && adminAvatarWrap) {
    if (adminProfile.profilePic) {
      adminAvatarWrap.innerHTML = '<img src="' + adminProfile.profilePic + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      var adminInitial = (adminProfile.displayName || 'Administrator').charAt(0).toUpperCase();
      adminAvatarWrap.innerHTML = '<span style="font-weight:700;color:#fff;font-size:17px;">' + adminInitial + '</span>';
    }
  }
  if (adminNameEl) adminNameEl.textContent = adminProfile.displayName || 'Barangay Administration';

  // Build resident avatar html
  var resInitial = (user.familyName || user.name || 'R').charAt(0).toUpperCase();
  function resAvatarHtml(small) {
    var sz = small ? '32px' : '36px';
    var fs = small ? '13px' : '15px';
    if (user.profilePic) {
      return '<div style="width:' + sz + ';height:' + sz + ';border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="' + user.profilePic + '" style="width:100%;height:100%;object-fit:cover;"></div>';
    }
    return '<div style="width:' + sz + ';height:' + sz + ';border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:' + fs + ';flex-shrink:0;">' + resInitial + '</div>';
  }
  function adminAvatarHtml(small) {
    var sz = small ? '32px' : '36px';
    var fs = small ? '13px' : '15px';
    if (adminProfile.profilePic) {
      return '<div style="width:' + sz + ';height:' + sz + ';border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="' + adminProfile.profilePic + '" style="width:100%;height:100%;object-fit:cover;"></div>';
    }
    var al = (adminProfile.displayName || 'A').charAt(0).toUpperCase();
    return '<div style="width:' + sz + ';height:' + sz + ';border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:' + fs + ';flex-shrink:0;">' + al + '</div>';
  }

  if (messages.length === 0) {
    thread.innerHTML = '<div class="msg-empty"><i class="fa-solid fa-comments"></i><p>No messages yet. Send a message to the barangay!</p></div>';
    return;
  }

  var html = '';
  var lastDate = '';
  messages.forEach(function(m, idx) {
    var fromAdmin = m.from === 'admin';

    // Smart date separator
    var msgDate = m.date || '';
    if (msgDate && msgDate !== lastDate) {
      var label = getDateLabel(msgDate);
      html += '<div style="text-align:center;margin:10px 0 6px;display:flex;align-items:center;gap:10px;">';
      html += '<div style="flex:1;height:1px;background:var(--border);"></div>';
      html += '<span style="background:#e8edf5;color:var(--gray);font-size:11px;padding:3px 14px;border-radius:20px;font-weight:500;white-space:nowrap;">' + esc(label) + '</span>';
      html += '<div style="flex:1;height:1px;background:var(--border);"></div>';
      html += '</div>';
      lastDate = msgDate;
    }

    html += '<div class="res-msg-group" style="display:flex;flex-direction:column;align-items:' + (fromAdmin ? 'flex-start' : 'flex-end') + ';position:relative;" data-idx="' + idx + '">';
    html += '<div class="msg-bubble ' + (fromAdmin ? 'from-admin' : 'from-resident') + '" style="max-width:72%;">';
    if (fromAdmin) {
      html += adminAvatarHtml(false);
    } else {
      html += resAvatarHtml(false);
    }
    html += '<div class="msg-text-wrap">';
    html += '<div class="msg-text">' + esc(m.text) + '</div>';
    html += '<div class="msg-time" style="display:flex;align-items:center;gap:6px;">';
    html += '<span>' + (m.time || '') + '</span>';
    if (!fromAdmin) {
      html += '<button onclick="deleteResidentMessage(' + idx + ')" title="Delete" style="background:none;border:none;cursor:pointer;color:#bbb;font-size:11px;padding:0 2px;line-height:1;opacity:0;transition:opacity .15s;" class="res-msg-del-btn" onmouseover="this.style.color=\'#e74c3c\'" onmouseout="this.style.color=\'#bbb\'"><i class="fa-solid fa-trash"></i></button>';
    }
    html += '</div>';
    html += '</div></div>';
    html += '</div>';
  });

  thread.innerHTML = html;
  thread.scrollTop = thread.scrollHeight;

  // Show delete button on hover per group
  thread.querySelectorAll('.res-msg-group').forEach(function(g) {
    var btn = g.querySelector('.res-msg-del-btn');
    if (!btn) return;
    g.addEventListener('mouseenter', function() { btn.style.opacity = '1'; });
    g.addEventListener('mouseleave', function() { btn.style.opacity = '0'; });
  });
}

function deleteResidentMessage(idx) {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  if (!confirm('Delete this message?')) return;
  var messages = getData('chat_' + user.userId);
  messages.splice(idx, 1);
  setData('chat_' + user.userId, messages);
  loadResidentMessages();
}

function clearAllResidentMessages() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  if (!confirm('Clear entire conversation? This cannot be undone.')) return;
  setData('chat_' + user.userId, []);
  loadResidentMessages();
}

function sendResidentMessage() {
  var user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!user) return;
  var input = document.getElementById('resMsgInput');
  var text = (input.value || '').trim();
  if (!text) return;
  var messages = getData('chat_' + user.userId);
  var now = new Date();
  messages.push({
    from: 'resident',
    text: text,
    time: now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),
    date: now.toLocaleDateString('en-PH',{weekday:'short',year:'numeric',month:'short',day:'numeric'}),
    adminRead: false,
    residentRead: true,
    _ts: now.getTime()
  });
  setData('chat_' + user.userId, messages);
  input.value = '';
  loadResidentMessages();
}

// Allow Enter to send resident message
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey && document.activeElement && document.activeElement.id === 'resMsgInput') {
    e.preventDefault();
    sendResidentMessage();
  }
});

/* =========================================
  UPDATED postDashAnnouncement - with multiple image support
========================================= */
// Preview function for announcement images (was missing!)
function previewAnnounceImgs(input) {
  var previewEl = document.getElementById('dashAnnounceImgPreview');
  if (!previewEl) return;
  
  if (!input.files || input.files.length === 0) {
    previewEl.style.display = 'none';
    return;
  }
  
  var files = Array.from(input.files).slice(0, 5);
  var html = '';
  var pending = files.length;
  var results = [];
  
  function renderPreviews() {
    html = '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    results.forEach(function(dataUrl, idx) {
      if (dataUrl) {
        html += '<div style="position:relative;width:80px;height:80px;">';
        html += '<img src="' + dataUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid var(--border);">';
        html += '<button type="button" onclick="removeAnnounceImg()" style="position:absolute;top:-8px;right:-8px;background:#e74c3c;border:none;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;">×</button>';
        html += '</div>';
      }
    });
    html += '</div>';
    previewEl.innerHTML = html;
    previewEl.style.display = 'flex';
  }
  
  files.forEach(function(file, i) {
    var reader = new FileReader();
    reader.onload = function(e) {
      results[i] = e.target.result;
      pending--;
      if (pending === 0) renderPreviews();
    };
    reader.onerror = function(err) {
      console.error('Error reading file:', file.name, err);
      pending--;
      if (pending === 0) renderPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function removeAnnounceImg() {
  var input = document.getElementById('dashAnnounceImg');
  input.value = '';
  var preview = document.getElementById('dashAnnounceImgPreview');
  if (preview) preview.style.display = 'none';
}

// Override the postDashAnnouncement defined in admin.html
function postDashAnnouncementWithImg() {
  var subjectEl = document.getElementById('dashAnnounceSubject');
  var subject = subjectEl ? (subjectEl.value || '').trim() : '';
  var txt = (document.getElementById('dashAnnounceText')||{}).value || '';
  var alertEl = document.getElementById('dashAnnounceAlert');
  if (!subject) {
    if (alertEl) { alertEl.style.display='block'; alertEl.className='alert alert-error'; alertEl.textContent='Please enter a subject/title for the announcement.'; }
    return;
  }
  if (!txt.trim()) {
    if (alertEl) { alertEl.style.display='block'; alertEl.className='alert alert-error'; alertEl.textContent='Please enter the announcement message.'; }
    return;
  }
  var imgInput = document.getElementById('dashAnnounceImg');
  var files = imgInput && imgInput.files ? Array.from(imgInput.files).slice(0, 5) : [];

  function doPost(imagesData) {
    var posts = getData('announcementPosts') || [];
    var d = new Date();
    posts.push({
      author: 'Administrator', title: subject,
      content: txt.trim(), date: d.toLocaleDateString('en-PH', {year:'numeric',month:'short',day:'numeric'}),
      images: imagesData.length > 0 ? imagesData : [],
      image: imagesData[0] || null, // backwards compat
      tag: 'Official', role: 'admin'
    });
    setData('announcementPosts', posts);
    // Also post to forum for notifications
    var forumPosts = getData('forumPosts') || [];
    forumPosts.push({ author: 'Administrator', subject: subject, message: txt.trim(), content: txt.trim(), date: d.toLocaleDateString('en-PH'), likes: 0, role: 'admin' });
    setData('forumPosts', forumPosts);
    if (subjectEl) subjectEl.value = '';
    document.getElementById('dashAnnounceText').value = '';
    if (imgInput) imgInput.value = '';
    var prev = document.getElementById('dashAnnounceImgPreview');
    if (prev) { prev.innerHTML = ''; prev.style.display = 'none'; }
    if (alertEl) { alertEl.style.display='block'; alertEl.className='alert alert-success'; alertEl.textContent='Announcement posted!'; setTimeout(function(){ alertEl.style.display='none'; if (typeof closeAnnouncePanel === 'function') closeAnnouncePanel(); }, 1500); }
  }

  if (files.length === 0) {
    doPost([]);
    return;
  }

  // Read all files as base64
  var results = new Array(files.length);
  var done = 0;
  files.forEach(function(file, i) {
    var reader = new FileReader();
    reader.onload = function(e) {
      results[i] = e.target.result;
      done++;
      if (done === files.length) doPost(results);
    };
    reader.onerror = function(err) {
      console.error('Error reading file:', file.name, err);
      // Still count as done even if there's an error, so form doesn't hang
      done++;
      if (done === files.length) doPost(results);
    };
    reader.readAsDataURL(file);
  });
}


var courtCalDate = new Date();

function renderCourtCalendar() {
  var el      = document.getElementById('courtCalendar');
  var titleEl = document.getElementById('courtCalTitle');
  if (!el) return;
  var year  = courtCalDate.getFullYear();
  var month = courtCalDate.getMonth();
  if (titleEl) titleEl.textContent = new Date(year, month, 1).toLocaleDateString('en-PH',{month:'long',year:'numeric'});
  el.innerHTML = buildCalendarHTML(year, month, getData('courtSchedules'), 'resident');
}

function courtCalPrev() { courtCalDate.setMonth(courtCalDate.getMonth()-1); renderCourtCalendar(); }
function courtCalNext() { courtCalDate.setMonth(courtCalDate.getMonth()+1); renderCourtCalendar(); }

/* =========================================
  COURT CALENDAR — init on section open (handled in showResidentSection above)
========================================= */