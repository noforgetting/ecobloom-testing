const applicationForm = document.querySelector("#application-form");

if (applicationForm) {
  const steps = Array.from(applicationForm.querySelectorAll(".application-step"));
  const progressBar = document.querySelector("#step-progress");
  const stepLabel = document.querySelector("#step-label");
  const submissionStatus = document.querySelector("#submission-status");
  const submitButton = document.querySelector("#submit-application");
  const responseFrame = document.querySelector(".application-submit-frame");
  const applicationShell = document.querySelector(".application-shell");
  const isPartnershipForm = document.body.classList.contains("partnership-application-body");
  let activeStep = 0;
  let submissionStarted = false;

  const updateProgress = () => {
    const completed = Math.round(((activeStep + 1) / steps.length) * 100);
    stepLabel.textContent = `Halaman ${activeStep + 1}/${steps.length}`;
    progressBar.style.width = `${completed}%`;
  };

  const syncOtherChoice = (choice) => {
    const otherInput = choice.closest(".application-other-choice")?.querySelector(".application-other-input");
    if (!otherInput) return;
    const isOther = choice.checked && choice.value === "__other_option__";
    otherInput.disabled = !isOther;
    otherInput.required = isOther;
    if (!isOther) otherInput.value = "";
  };

  applicationForm.querySelectorAll(".application-choice-field input[type=radio]").forEach((choice) => {
    choice.addEventListener("change", () => {
      const fieldset = choice.closest(".application-choice-field");
      fieldset?.querySelectorAll("input[type=radio]").forEach(syncOtherChoice);
    });
    syncOtherChoice(choice);
  });

  applicationForm.querySelectorAll("[data-terms-consent]").forEach((consent) => {
    const continueButton = consent.closest(".application-step")?.querySelector("[data-next]");
    const syncTermsConsent = () => {
      if (continueButton) continueButton.disabled = !consent.checked;
    };
    consent.addEventListener("change", syncTermsConsent);
    syncTermsConsent();
  });

  updateProgress();
  if (isPartnershipForm) applicationShell.classList.add("is-intro-step");

  responseFrame?.addEventListener("load", () => {
    if (!submissionStarted) return;
    submissionStarted = false;
    submissionStatus.classList.add("is-success");
    submissionStatus.textContent = "Permintaan pendaftaran sudah dikirim. Terima kasih!";
    submitButton.textContent = "Pendaftaran terkirim";
  });

  const scrollToForm = (behavior) => {
    const isIntroStep = isPartnershipForm && applicationShell.classList.contains("is-intro-step");
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
    const introOffset = isIntroStep ? headerHeight + 72 : 0;
    const baseOffset = isPartnershipForm ? 0 : 64;
    const top = document.querySelector(".application-progress-wrap").getBoundingClientRect().top + window.scrollY - introOffset - baseOffset;
    window.scrollTo({ top, behavior: behavior || (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") });
  };

  // Start below the navigation so the form occupies the viewport. Scrolling up
  // naturally reveals the navigation above it.
  requestAnimationFrame(() => scrollToForm("auto"));

  const showStep = (nextIndex) => {
    const nextStep = Math.max(0, Math.min(nextIndex, steps.length - 1));
    if (nextStep === activeStep) return;

    steps[activeStep].hidden = true;
    steps[activeStep].classList.remove("is-active", "is-entering");
    activeStep = nextStep;
    if (isPartnershipForm) applicationShell.classList.toggle("is-intro-step", activeStep < 2);
    const current = steps[activeStep];
    current.hidden = false;
    current.classList.add("is-active");
    requestAnimationFrame(() => current.classList.add("is-entering"));

    updateProgress();
    scrollToForm();
    current.querySelector("h2")?.focus({ preventScroll: true });
  };

  const validateStep = (step) => {
    const controls = Array.from(step.querySelectorAll("input, textarea, select")).filter((control) => !control.disabled);
    const invalid = controls.find((control) => !control.checkValidity());
    if (!invalid) return true;

    const validationMessage = invalid.validity.typeMismatch
      ? "Masukkan alamat email dengan format yang benar sebelum melanjutkan."
      : "Lengkapi semua pertanyaan bertanda * sebelum melanjutkan.";
    let notice = step.querySelector(".step-validation");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "step-validation";
      notice.setAttribute("role", "alert");
      step.querySelector(".step-actions")?.before(notice);
    }
    notice.textContent = validationMessage;
    invalid.setAttribute("aria-invalid", "true");
    invalid.focus({ preventScroll: true });
    return false;
  };

  const clearValidation = (control) => {
    if (!control.checkValidity()) return;
    control.removeAttribute("aria-invalid");
    const step = control.closest(".application-step");
    step?.querySelector(".step-validation")?.remove();
  };

  applicationForm.addEventListener("input", (event) => clearValidation(event.target));
  applicationForm.addEventListener("change", (event) => clearValidation(event.target));

  applicationForm.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep(steps[activeStep])) showStep(activeStep + 1);
    });
  });

  applicationForm.querySelectorAll("[data-prev]").forEach((button) => {
    button.addEventListener("click", () => showStep(activeStep - 1));
  });

  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalidStepIndex = steps.slice(0, -1).findIndex((step) =>
      Array.from(step.querySelectorAll("input, textarea, select")).some((control) => !control.disabled && !control.checkValidity())
    );
    if (invalidStepIndex !== -1) {
      showStep(invalidStepIndex);
      validateStep(steps[invalidStepIndex]);
      return;
    }

    submissionStatus.hidden = false;
    submissionStatus.classList.remove("is-success");
    submissionStatus.textContent = "Mengirim pendaftaran…";
    submitButton.disabled = true;
    submitButton.textContent = "Mengirim…";
    submissionStarted = true;
    applicationForm.submit();
  });
}
