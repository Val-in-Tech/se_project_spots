import { enableValidation, config, resetValidation } from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import './index.css';
import logo from '../images/logo.svg';
document.querySelector(".header__logo").src = logo;
import avatarFallback from '../images/spots-images/valarie.jpg';
import cardFallback from '../images/spots-images/card-fallback.jpg';




import Api from "../scripts/Api.js";

const initialCards = [
  {
    _id: "init1",
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
    likes: [{ _id: "demo-user" }]
  },

  {
    _id: "init2",
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
    likes: []
  },

  {
    _id: "init3",
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
    likes: []
  },

  {
    _id: "init4",
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
    likes: []
  },

  {
    _id: "init5",
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
    likes: []
  },

  {
    _id: "init6",
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
    likes: []
  },

  {
    _id: "init7",
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
    likes: []
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "dbc7ac93-a7e1-4202-a0be-543dc69048ed",
    "Content-Type": "application/json"
  },
});

let myUserId;
document.addEventListener('DOMContentLoaded', () => {

  const profileNameEl = document.querySelector(".profile__name");
  const profileDescriptionEl = document.querySelector(".profile__description");
  const cardsList = document.querySelector(".cards__list");
  const avatarEl = document.querySelector('.profile__avatar');

  const editProfileBtn = document.querySelector(".profile__edit-btn");
  const editProfileModal = document.querySelector("#edit-profile-modal");
  const editProfileCloseBtn = editProfileModal?.querySelector(".modal__close-btn") || null;
  const editProfileFormEl = document.querySelector("#edit-profile-form") || (editProfileModal?.querySelector(".modal__form") || null);
  const editProfileNameInput = editProfileModal?.querySelector("#profile-name-input") || document.querySelector("#profile-name-input") || null;
  const editProfileDescriptionInput = editProfileModal?.querySelector("#profile-description-input") || document.querySelector("#profile-description-input") || null;


  if (!editProfileFormEl || !editProfileNameInput || !editProfileDescriptionInput || !profileNameEl || !profileDescriptionEl) {
    console.error("Missing profile elements, aborting init:", {
      form: !!editProfileFormEl,
      nameInput: !!editProfileNameInput,
      descInput: !!editProfileDescriptionInput,
      profileName: !!profileNameEl,
      profileDesc: !!profileDescriptionEl
    });
    return;
  }

  const newPostBtn = document.querySelector(".profile__add-btn");
  const newPostModal = document.querySelector("#new-post-modal");
  const newPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
  const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
  const newPostFormEl = newPostModal.querySelector(".modal__form");
  const newPostCardImageInput = newPostModal.querySelector("#card-image-input");
  const newPostCardCaptionInput = newPostModal.querySelector("#card-caption-input");

  const previewModal = document.querySelector("#preview-modal");
  const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
  const previewImageEl = previewModal.querySelector(".modal__image");
  const previewCaptionEl = previewModal.querySelector(".modal__caption");
  const previewModalImageContainer = previewModal.querySelector(".modal__image-container");

    const avatarModalBtn = document.querySelector(".profile__avatar-btn");
    const editAvatarModal = document.querySelector("#edit-avatar-modal");
    const editAvatarCloseBtn = editAvatarModal.querySelector(".modal__close-btn");
    const editAvatarFormEl = editAvatarModal ? editAvatarModal.querySelector(".modal__form") : null;
    const editAvatarInput = editAvatarModal ? editAvatarModal.querySelector("#avatar-input") : null;


    function handleAvatarSubmit(evt) {
      evt.preventDefault();
      if (!editAvatarFormEl || !editAvatarInput) return;

      const submitBtn = editAvatarFormEl.querySelector(".modal__submit-btn");
      if (submitBtn) setButtonText(submitBtn, true);

      api.editAvatarInfo(editAvatarInput.value)
        .then((data) => {
          if (avatarEl) avatarEl.src = data.avatar || avatarFallback;
          closeModal(editAvatarModal);
          if (editAvatarFormEl) {
            editAvatarFormEl.reset();
            resetValidation(editAvatarFormEl, config);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (submitBtn) setButtonText(submitBtn, false);
        });
    }


    if (editAvatarFormEl) editAvatarFormEl.addEventListener("submit", handleAvatarSubmit);

    const deleteModal = document.querySelector("#delete-modal");
    const deleteCloseBtn = deleteModal.querySelector(".modal__close-btn");
    const deleteFormEl = deleteModal ? deleteModal.querySelector(".modal__form") : null;

    let selectedCard;
    let selectedCardId;

     // testing this for adding unsplash images
    // quick helper — only allow obvious direct image URLs (avoids page URLs)
    const isLikelyImageUrl = (url) => {
      if (!url || typeof url !== "string") return false;
      return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url.trim());
    };

    // helper: return a direct-image URL or the fallback
    const normalizeImageUrl = (link) => {
      if (!link || typeof link !== "string") return cardFallback;
      const trimmed = link.trim();
      if (/\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(trimmed)) return trimmed;
      const unsplashMatch = String(trimmed).match(/unsplash\.com\/photos\/([^\/?#]+)/i);
      if (unsplashMatch) {
        const slug = unsplashMatch[1];
        const photoId = slug.split('-').pop();
        return `https://source.unsplash.com/${photoId}/1600x900`;
      }
      return cardFallback;
    };

    function getCardElement(data) {
      const cardTemplate = document
        .querySelector("#card-template")
        .content.querySelector(".card");
      const cardElement = cardTemplate.cloneNode(true);

      const cardTitleEl = cardElement.querySelector(".card__title");
      const cardImageEl = cardElement.querySelector(".card__image");

      console.debug("Creating card:", data._id, data.name, data.link);


      cardImageEl.src = normalizeImageUrl(data.link);
      cardImageEl.alt = data.name || "";


      cardImageEl.addEventListener('load', () => {
        cardImageEl.classList.remove('card__image--error');
      });

      cardImageEl.addEventListener('error', () => {
        if (!cardImageEl.classList.contains('card__image--error')) {
          cardImageEl.src = cardFallback;
          cardImageEl.classList.add('card__image--error');
        }
      });

      cardTitleEl.textContent = data.name;

      const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");


      let likesArr = data.likes;
      if (data._id && data._id.startsWith("init")) {
        likesArr = getLocalLikes(data._id);
      }

      if (
        Array.isArray(likesArr) &&
        likesArr.some(user => user._id === myUserId)
      ) {
        cardLikeBtnEl.classList.add("card__like-btn_active");
      } else {
        cardLikeBtnEl.classList.remove("card__like-btn_active");
      }

      cardLikeBtnEl.addEventListener("click", () => {
        if (!data._id || typeof data._id !== "string" || data._id.startsWith("init")) {

          let likesArr = getLocalLikes(data._id);
          const liked = likesArr.some(user => user._id === myUserId);
          if (liked) {
            likesArr = likesArr.filter(user => user._id !== myUserId);
            cardLikeBtnEl.classList.remove("card__like-btn_active");
          } else {
            likesArr.push({ _id: myUserId });
            cardLikeBtnEl.classList.add("card__like-btn_active");
          }
          setLocalLikes(data._id, likesArr);
          return;
        }

        const isActive = cardLikeBtnEl.classList.contains("card__like-btn_active");
        api.changeLikeStatus(data._id, isActive)
          .then((updatedCard) => {
            if (
              Array.isArray(updatedCard.likes) &&
              updatedCard.likes.some(user => user._id === myUserId)
            ) {
              cardLikeBtnEl.classList.add("card__like-btn_active");
            } else {
              cardLikeBtnEl.classList.remove("card__like-btn_active");
            }
          })
          .catch(console.error);
      });

      const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
      cardDeleteBtnEl.addEventListener("click", () => {
        openModal(deleteModal);
        selectedCard = cardElement;
        selectedCardId = data._id;
      });

      cardImageEl.addEventListener("click", () => {
        // use normalized URL for the preview too
        previewImageEl.src = normalizeImageUrl(data.link);
        previewCaptionEl.textContent = data.name;
        openModal(previewModal);
      });

      return cardElement;
    };


    if (newPostModal) {
      const newPostModalClose = newPostModal.querySelector(".modal__close-btn");
      if (newPostModalClose) {
        newPostModalClose.addEventListener("click", () => closeModal(newPostModal));
      }
    }


    if (avatarModalBtn && editAvatarModal) {
      avatarModalBtn.addEventListener("click", () => openModal(editAvatarModal));
    }
    if (editAvatarModal) {
      const editAvatarClose = editAvatarModal.querySelector(".modal__close-btn");
      if (editAvatarClose) editAvatarClose.addEventListener("click", () => closeModal(editAvatarModal));


      if (editAvatarFormEl) editAvatarFormEl.addEventListener("submit", handleAvatarSubmit);
    }

  function handleDeleteSubmit(evt) {
    evt.preventDefault();
    const submitBtn = deleteFormEl ? deleteFormEl.querySelector(".modal__submit-btn") : null;
    if (submitBtn) setButtonText(submitBtn, true, "Delete", "Deleting...");

    if (!selectedCardId) {
      if (submitBtn) setButtonText(submitBtn, false, "Delete", "Deleting...");
      return;
    }

    if (typeof selectedCardId === "string" && selectedCardId.startsWith("init")) {
      if (selectedCard) selectedCard.remove();
      closeModal(deleteModal);
      if (deleteFormEl) {
        deleteFormEl.reset();
        resetValidation(deleteFormEl, config);
      }
      if (submitBtn) setButtonText(submitBtn, false, "Delete", "Deleting...");
      return;
    }

    api.deleteCard(selectedCardId)
      .then(() => {
        if (selectedCard) selectedCard.remove();
        closeModal(deleteModal);
        if (deleteFormEl) {
          deleteFormEl.reset();
          resetValidation(deleteFormEl, config);
        }
      })
      .catch((err) => {
        console.error("Delete failed:", err);
      })
      .finally(() => {
        if (submitBtn) setButtonText(submitBtn, false, "Delete", "Deleting...");
      });
}


    if (deleteModal) {
      const deleteClose = deleteModal.querySelector(".modal__close-btn");
      if (deleteClose) deleteClose.addEventListener("click", () => closeModal(deleteModal));

      const deleteForm = deleteModal.querySelector(".modal__form");
      if (deleteForm) deleteForm.addEventListener("submit", handleDeleteSubmit);
    }


    const cancelBtn = deleteModal ? deleteModal.querySelector(".modal__submit-btn_cancel") : null;

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        closeModal(deleteModal);
      });
    }


    if (editProfileBtn && editProfileModal) {
      editProfileBtn.addEventListener("click", () => {
        openModal(editProfileModal);
        if (editProfileNameInput) editProfileNameInput.value = profileNameEl ? profileNameEl.textContent : "";
        if (editProfileDescriptionInput) editProfileDescriptionInput.value = profileDescriptionEl ? profileDescriptionEl.textContent : "";
        if (editProfileFormEl) {
          resetValidation(editProfileFormEl, config);
          toggleEditProfileSaveButton();
        }
      });
    }
    if (editProfileCloseBtn) editProfileCloseBtn.addEventListener("click", () => closeModal(editProfileModal));
    if (newPostBtn) newPostBtn.addEventListener("click", () => openModal(newPostModal));
    if (newPostCloseBtn) newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
    if (previewModalCloseBtn) previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));
    if (newPostFormEl) {
      newPostFormEl.addEventListener("submit", function (evt) {
        evt.preventDefault();

        const submitBtn = newPostFormEl.querySelector(".modal__submit-btn");
        if (submitBtn) setButtonText(submitBtn, true, "Save", "Saving...");

        const cardData = {
          name: newPostCardCaptionInput.value,
          link: newPostCardImageInput.value,
        };

        const imageErrorEl = newPostFormEl.querySelector("#card-image-input-error");
        const isUnsplashPageUrl = (url) =>
          typeof url === "string" && /unsplash\.com\/photos\/([^\/?#]+)/i.test(url);

        if (!isLikelyImageUrl(cardData.link) && !isUnsplashPageUrl(cardData.link)) {
          // Show error
          return;
        } else if (imageErrorEl) {
          imageErrorEl.textContent = "";
          imageErrorEl.classList.remove(config.errorClass);
        }

        api.addCard(cardData)
          .then((newCard) => {
            const cardElement = getCardElement(newCard);
            cardsList.prepend(cardElement);
            closeModal(newPostModal);
            newPostFormEl.reset();
            resetValidation(newPostFormEl, config);
          })
          .catch(console.error)
          .finally(() => {
            if (submitBtn) setButtonText(submitBtn, false, "Save", "Saving...");
          });
      });
    }



    function isProfileChanged() {
      return (
        editProfileNameInput.value !== profileNameEl.textContent ||
        editProfileDescriptionInput.value !== profileDescriptionEl.textContent
      );
    }

    function toggleEditProfileSaveButton() {
      const saveBtn = editProfileFormEl && editProfileFormEl.querySelector(".modal__submit-btn");
      if (!saveBtn) return;

      const valid =
        editProfileNameInput && editProfileNameInput.validity.valid &&
        editProfileDescriptionInput && editProfileDescriptionInput.validity.valid;

      const changed =
        editProfileNameInput.value !== (profileNameEl ? profileNameEl.textContent : "") ||
        editProfileDescriptionInput.value !== (profileDescriptionEl ? profileDescriptionEl.textContent : "");

      if (valid && changed) {
        saveBtn.disabled = false;
        saveBtn.classList.remove(config.inactiveButtonClass);
      } else {
        saveBtn.disabled = true;
        saveBtn.classList.add(config.inactiveButtonClass);
      }
    }

    editProfileNameInput?.addEventListener("input", toggleEditProfileSaveButton);
    editProfileDescriptionInput?.addEventListener("input", toggleEditProfileSaveButton);

    enableValidation(config);

    function getLocalLikes(cardId) {
      const likes = JSON.parse(localStorage.getItem('demoCardLikes') || '{}');
      return likes[cardId] || [];
    }

    function setLocalLikes(cardId, likesArr) {
      const likes = JSON.parse(localStorage.getItem('demoCardLikes') || '{}');
      likes[cardId] = likesArr;
      localStorage.setItem('demoCardLikes', JSON.stringify(likes));
    }

    api.getAppInfo()
      .then(([cards, userInfo]) => {
        myUserId = userInfo._id;

        if (userInfo.avatar && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(userInfo.avatar)) {
          avatarEl.src = userInfo.avatar;
        } else {
          avatarEl.src = avatarFallback;
        }

        profileNameEl.textContent = userInfo.name;
        profileDescriptionEl.textContent = userInfo.about;

        cards.forEach((item) => {
          const cardElement = getCardElement(item);
          cardsList.append(cardElement);
        });

        initialCards.forEach((item) => {
          const cardElement = getCardElement(item);
          cardsList.append(cardElement);
        });
      })
      .catch(console.error);

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("modal_is-opened");
    modal.addEventListener('mousedown', handleOverlayClick);
    document.addEventListener('keydown', handleEscape);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("modal_is-opened");
    modal.removeEventListener('mousedown', handleOverlayClick);
    document.removeEventListener('keydown', handleEscape);
  }

  function handleOverlayClick(event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      const openedModal = document.querySelector(".modal_is-opened");
      if (openedModal) {
        closeModal(openedModal);
      }
    }
  }

  if (editProfileFormEl) {
    editProfileFormEl.addEventListener("submit", function (evt) {
      evt.preventDefault();
      console.debug("editProfile submit:", {
        name: editProfileNameInput?.value,
        about: editProfileDescriptionInput?.value,
        formFound: !!editProfileFormEl
    });

    const submitBtn = editProfileFormEl.querySelector(".modal__submit-btn");
    if (submitBtn) setButtonText(submitBtn, true, "Save", "Saving...");

    const payload = {
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value
    };

    (api && typeof api.editUserInfo === "function"
      ? api.editUserInfo(payload)
      : Promise.reject(new Error("API not available")))

      .then((userInfo) => {
        console.debug("API success:", userInfo);
        profileNameEl.textContent = userInfo.name;
        profileDescriptionEl.textContent = userInfo.about;
        closeModal(editProfileModal);
        editProfileFormEl.reset();
        resetValidation(editProfileFormEl, config);
      })
      .catch((err) => {
        console.error("API update failed; applying local fallback:", err);
        profileNameEl.textContent = payload.name;
        profileDescriptionEl.textContent = payload.about;
        closeModal(editProfileModal);
        editProfileFormEl.reset();
        resetValidation(editProfileFormEl, config);
      })
      .finally(() => {
        if (submitBtn) setButtonText(submitBtn, false, "Save", "Saving...");
      });
  });
  } else {
    console.error("edit profile form element not found (#edit-profile-form).");
  }
});