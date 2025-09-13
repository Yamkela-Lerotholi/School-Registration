// NAV TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('show'));
  }

  /* -------- Multi-step form logic -------- */
  const form = document.getElementById('admissionForm');
  if (!form) return; // other pages include script.js too

  const steps = Array.from(document.querySelectorAll('.form-step'));
  const progressText = document.getElementById('formProgress');
  const progressBar = document.getElementById('progressBar');
  let current = steps.findIndex(s => s.classList.contains('active'));
  if (current < 0) current = 0;

  function updateUI() {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    if (progressText) progressText.textContent = `Step ${current + 1} of ${steps.length}`;
    if (progressBar) {
      const pct = Math.round(((current + 1) / steps.length) * 100);
      progressBar.style.width = pct + '%';
    }
    // Grade dependent behavior
    const grade = document.getElementById('grade')?.value;
    const gradeInfo = document.getElementById('gradeInfo');
    if (gradeInfo) {
      if (grade === '8' || grade === '9') {
        gradeInfo.textContent = 'Grades 8–9 follow a standard subject offering; no subject selection required.';
      } else if (grade) {
        gradeInfo.textContent = 'Grades 10–12 must choose subjects. English and LO are compulsory.';
      } else {
        gradeInfo.textContent = '';
      }
    }
  }

  updateUI();

  // delegated next & prev
  form.addEventListener('click', (e) => {
    if (e.target.matches('[data-next]')) {
      // basic validation for current step's required inputs
      const active = steps[current];
      const invalid = Array.from(active.querySelectorAll('[required]')).some(inp => {
        if (inp.type === 'file') return inp.files.length === 0;
        return !inp.value || inp.value.trim() === '';
      });
      if (invalid) {
        // simple feedback
        active.querySelectorAll('[required]').forEach(i => i.reportValidity?.());
        return;
      }

      if (current < steps.length - 1) {
        current++;
        updateUI();
      }
    } else if (e.target.matches('[data-prev]')) {
      if (current > 0) {
        current--;
        updateUI();
      }
    }
  });

// Extract DOB and Gender from SA ID when leaving ID field
const idInput = document.getElementById('id_number');
const dobInput = document.getElementById('dob');
const genderInput = document.getElementById('gender');

idInput?.addEventListener('blur', () => {
  const val = (idInput.value || '').trim();

  // clear fields if input empty
  if (!val) {
    if (dobInput) dobInput.value = '';
    if (genderInput) genderInput.value = '';
    return;
  }

  // Validate: must be 13 digits
  if (!/^\d{13}$/.test(val)) {
    // friendly message and clear auto fields
    alert('ID number must contain exactly 13 digits. Please check and try again.');
    if (dobInput) dobInput.value = '';
    if (genderInput) genderInput.value = '';
    idInput.focus();
    return;
  }

  // Parse DOB from first 6 digits YYMMDD
  const yy = val.substring(0,2);
  const mm = val.substring(2,4);
  const dd = val.substring(4,6);

  // decide 19xx or 20xx (simple heuristic)
  const twoDigitNow = new Date().getFullYear() % 100;
  const yearNum = parseInt(yy,10);
  const fullYear = (yearNum <= twoDigitNow) ? 2000 + yearNum : 1900 + yearNum;

  // validate month/day (basic)
  const monthNum = parseInt(mm,10);
  const dayNum = parseInt(dd,10);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    alert('ID number contains invalid date — please check the first 6 digits (YYMMDD).');
    if (dobInput) dobInput.value = '';
    if (genderInput) genderInput.value = '';
    return;
  }

  // Set DOB input as YYYY-MM-DD
  if (dobInput) {
    const mmP = mm.padStart(2,'0');
    const ddP = dd.padStart(2,'0');
    dobInput.value = `${fullYear}-${mmP}-${ddP}`;
  }

  // Determine gender from digits 7-10 (indexes 6..9)
  const genderCode = parseInt(val.substring(6,10),10);
  const gender = (genderCode >= 5000) ? 'Male' : 'Female';

  if (genderInput) {
    genderInput.value = gender;
  }

  // Optionally store gender into form dataset
  form.dataset.gender = gender;
});


  // Subjects selection rules
  const subjectsSelect = document.getElementById('subjectsSelect');
  const languages = ['English','Sesotho','Sestwana','isiXhosa','Zulu','Pedi'];
  subjectsSelect?.addEventListener('change', (ev) => {
    const selected = Array.from(subjectsSelect.selectedOptions).map(o => o.value);
    const selectedLangs = selected.filter(s => languages.includes(s));
    if (selected.length > 7) {
      alert('You may select a maximum of 7 subjects.');
      // deselect last selected
      ev.target.selectedOptions[ev.target.selectedOptions.length -1].selected = false;
      return;
    }
    if (selectedLangs.length > 2) {
      alert('You may select a maximum of 2 language subjects.');
      ev.target.selectedOptions[ev.target.selectedOptions.length -1].selected = false;
      return;
    }
  });

  // Show/hide subjects step for grades 8-9 (informational)
  const gradeEl = document.getElementById('grade');
  gradeEl?.addEventListener('change', () => updateUI());

  // Emergency same as parent
  const sameCheckbox = document.getElementById('emergencySameAsParent');
  sameCheckbox?.addEventListener('change', () => {
    const parentName = document.getElementById('parent_name');
    const parentRelationship = document.getElementById('relationship');
    const parentPhone = document.getElementById('parent_phone');
    const parentEmail = document.getElementById('parent_email');

    const emName = document.getElementById('emergency_name');
    const emRel = document.getElementById('emergency_relationship');
    const emPhone = document.getElementById('emergency_phone');

    if (sameCheckbox.checked) {
      emName.value = parentName.value;
      emRel.value = parentRelationship.value;
      emPhone.value = parentPhone.value;
    } else {
      emName.value = '';
      emRel.value = '';
      emPhone.value = '';
    }
  });

  // Modal & submit handling
  const modal = document.getElementById('thankYouModal');
  const closeBtn = modal?.querySelector('.modal-close');

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // final validation (ensure required fields in the active or all steps are present)
    const missing = Array.from(form.querySelectorAll('[required]')).some(i => {
      if (i.type === 'file') return i.files.length === 0;
      return !i.value || i.value.trim() === '';
    });
    if (missing) {
      alert('Please complete all required fields and uploads before submitting.');
      return;
    }

    // Here: normally submit to server via fetch/XHR. For demo, show modal.
    openModal();

    // Optionally reset form and return to step 1 when modal closed
    // hooking close to reset:
    const resetOnClose = () => {
      form.reset();
      current = 0;
      updateUI();
      closeModal();
      // remove this one-time listener
      closeBtn.removeEventListener('click', resetOnClose);
    };
    closeBtn.addEventListener('click', resetOnClose);
  });
});
