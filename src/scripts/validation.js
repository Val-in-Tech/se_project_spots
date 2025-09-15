export const config = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible"
};

const showInputError = (formEl, inputEl, errorMessage, config) => {
  const errorMessageEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMessageEl) {
    errorMessageEl.textContent = errorMessage;
    errorMessageEl.classList.add(config.errorClass);
  }
  inputEl.classList.add(config.inputErrorClass);
};

const hideInputError = (formEl, inputEl, config) => {
  const errorMessageEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMessageEl) {
    errorMessageEl.textContent = "";
    errorMessageEl.classList.remove(config.errorClass);
  }
  inputEl.classList.remove(config.inputErrorClass);
};

const checkInputValidity = (formEl, inputEl, config) => {
 if (!inputEl.validity.valid) {
  showInputError(formEl, inputEl, inputEl.validationMessage, config);
 } else {
  hideInputError(formEl, inputEl, config);
 }
};

 const hasInvalidInput = (inputList) => {
  return inputList.some((inputEl) => !inputEl.validity.valid);
};

function toggleButtonState(inputList, buttonEl, config) {
  if (!buttonEl) return;
  if (hasInvalidInput(inputList)) {
    buttonEl.disabled = true;
    buttonEl.classList.add(config.inactiveButtonClass);
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove(config.inactiveButtonClass);
  }
}

const disableButton = (buttonEl, config) => {
  buttonEl.disabled = true;
  buttonEl.classList.add(config.inactiveButtonClass);
};

export function resetValidation(formEl, config) {
  const submitButton = formEl.querySelector(config.submitButtonSelector);
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  inputList.forEach((inputEl) => {
    hideInputError(formEl, inputEl, config);
  });

  if (submitButton) {
    if (inputList.some(input => !input.validity.valid)) {
      submitButton.disabled = true;
      submitButton.classList.add(config.inactiveButtonClass);
    } else {
      submitButton.disabled = false;
      submitButton.classList.remove(config.inactiveButtonClass);
    }
  } else {
    console.error("Submit button not found with selector:", config.submitButtonSelector);
  }
};

const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

      toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", function () {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};


export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formEl) => {
    setEventListeners(formEl, config);
    resetValidation(formEl, config);
  });
};

