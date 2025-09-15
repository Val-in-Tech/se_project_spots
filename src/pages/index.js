import { enableValidation, config, resetValidation } from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import './index.css';
import logo from '../images/logo.svg';
document.querySelector(".header__logo").src = logo;
import avatarFallback from '../images/spots-images/avatar.jpg';
import cardFallback from '../images/spots-images/card-fallback.jpg';


import Api from "../scripts/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "314b9ca0-69a0-4cd4-9e45-d2ca9c95b937",
    "Content-Type": "application/json"
  }
});

let myUserId;

document.addEventListener('DOMContentLoaded', () => {
  const cardsList = document.querySelector(".cards__list");
  const profileNameEl = document.querySelector(".profile__name");
  const profileDescriptionEl = document.querySelector(".profile__description");
  const avatarEl = document.querySelector('.profile__avatar');

  avatarEl.addEventListener('error', (ev) => {
    console.debug("avatar image load error for src:", avatarEl.src, ev);
    avatarEl.classList.add('profile__avatar--error');
  });

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

  // shared helpers (keep this near top of DOMContentLoaded)
  const isImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url.trim());
  };

  // keep getImageUrl trivial (do NOT force local fallback)
  function getImageUrl(link) {
    return link || ""; // return raw link so UI shows the user's URL
  }

  // ADD preload helper so any user URL is attempted by the browser before rendering
  function loadImageOnce(url, timeout = 6000) {
    return new Promise((resolve) => {
      if (!url || typeof url !== "string") return resolve(false);
      const img = new Image();
      let done = false;
      const timer = setTimeout(() => {
        if (!done) { done = true; img.src = ""; resolve(false); }
      }, timeout);
      img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(true); } };
      img.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } };
      img.src = url;
    });
  }

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

    function getCardElement(data) {
      const cardTemplate = document
        .querySelector("#card-template")
        .content.querySelector(".card");
      const cardElement = cardTemplate.cloneNode(true);

      const cardTitleEl = cardElement.querySelector(".card__title");
      const cardImageEl = cardElement.querySelector(".card__image");

      console.debug("Creating card:", data._id, data.name, data.link);

      // Immediately assign the raw user link so the card shows the user-supplied URL
      cardImageEl.src = data.link || "";
      cardImageEl.alt = data.name || "";
      cardImageEl.classList.remove('card__image--loading');

      // Log failures but do NOT overwrite the user's URL (avoid forcing fallback)
      cardImageEl.addEventListener('error', (ev) => {
        console.debug("image load error for src:", cardImageEl.src, ev);
        cardImageEl.classList.add('card__image--error'); // visual marker if desired
      });

      cardTitleEl.textContent = data.name;

      const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");


      let likesArr = data.likes;
      if (data._id && data._id.startsWith("init")) {
        likesArr = getLocalLikes(data._id);
      }

      // For demo cards (local only)
      if (data._id && data._id.startsWith("init")) {
        const likesArr = getLocalLikes(data._id);
        if (Array.isArray(likesArr) && likesArr.some(user => user._id === myUserId)) {
          cardLikeBtnEl.classList.add("card__like-btn_active");
        } else {
          cardLikeBtnEl.classList.remove("card__like-btn_active");
        }
      } else {
        // For real cards from the API
        if (data.isLiked === true) {
          cardLikeBtnEl.classList.add("card__like-btn_active");
        } else {
          cardLikeBtnEl.classList.remove("card__like-btn_active");
        }
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
            console.log("API like response:", updatedCard);
            if (updatedCard.isLiked === true) {
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
        previewImageEl.src = getImageUrl(data.link);
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
      newPostFormEl.addEventListener("submit", async function (evt) {
        evt.preventDefault();
        const submitBtn = newPostFormEl.querySelector(".modal__submit-btn");
        if (submitBtn) setButtonText(submitBtn, true, "Save", "Saving...");

        const inputLink = (newPostCardImageInput.value || "").trim();
        const caption = newPostCardCaptionInput.value || "";

        const cardData = {
          name: caption,
          link: inputLink, // send original user input to server
        };

        // render immediately with the raw link so user sees the card at once
        const tempCard = {
          _id: `init-${Date.now()}`,
          name: cardData.name,
          link: inputLink, // raw user URL
          likes: []
        };
        const cardElement = getCardElement(tempCard);
        cardsList.prepend(cardElement);
        closeModal(newPostModal);
        newPostFormEl.reset();
        resetValidation(newPostFormEl, config);

        // then call the API; if the server returns a different link/update the DOM
        api.addCard(cardData)
          .then((newCard) => {
            try {
              // if server created an id, update element dataset / remove init id etc.
              const imgEl = cardElement.querySelector('.card__image');
              const titleEl = cardElement.querySelector('.card__title');

              if (newCard && newCard._id) {
                // store real id if needed
                cardElement.dataset.cardId = newCard._id;
              }
              // if server returned a link different from what user supplied, update image src
              if (newCard && newCard.link && newCard.link !== inputLink) {
                imgEl.src = newCard.link;
              }
              // update likes/title from server if available
              if (newCard && typeof newCard.name === 'string') titleEl.textContent = newCard.name;
            } catch (e) {
              console.debug("Error applying server response to client card:", e);
            }
          })
          .catch((err) => {
            console.error("addCard API failed:", err);
            // leave the client card as-is (raw URL) so user still sees their post
          })
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
        console.log("API cards:", cards); // <--- What does this output?
        myUserId = userInfo._id;
        const isImageUrl = url => /\.(jpe?g|png|gif|webp|svg)$/i.test(url || "");
        avatarEl.src = userInfo.avatar || "";
        profileNameEl.textContent = userInfo.name;
        profileDescriptionEl.textContent = userInfo.about;

        cardsList.innerHTML = "";
        cards.forEach((item) => {
          const cardElement = getCardElement(item);
          console.log(cardElement);
          cardsList.append(cardElement);
          console.log("Appending card:", cardElement);
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

